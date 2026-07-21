import {
  archiveKeyFor,
  investorReportRows,
  sanitizeBackupData
} from './businessIntelligence';
import {
  createZip,
  downloadBlob,
  downloadCsv,
  downloadJson,
  downloadText,
  downloadXlsx,
  sha256,
  toCsv
} from './exportCenter';

const archiveStorageKey = 'fsd-admin-report-archive-v1';
const auditStorageKey = 'fsd-admin-export-audit-v1';
const appVersion = '1.1.0';

export function getReportArchive() {
  return readStorage(archiveStorageKey);
}

export function getExportAudit() {
  return readStorage(auditStorageKey);
}

export async function exportInvestorReport(bi, format) {
  const rows = investorReportRows(bi);
  const stamp = stampName();
  if (format === 'pdf') {
    const blob = await createInvestorPdf(bi, rows, 'Investor Report');
    downloadBlob(blob, `fsd-investor-report-${stamp}.pdf`);
    archiveReport('Investor Report', 'PDF', bi, rows);
  } else if (format === 'xlsx') {
    await downloadXlsx(rows, `fsd-investor-report-${stamp}.xlsx`, 'Investor Report');
    archiveReport('Investor Report', 'XLSX', bi, rows);
  } else {
    downloadCsv(rows, `fsd-investor-report-${stamp}.csv`);
    archiveReport('Investor Report', 'CSV', bi, rows);
  }
  auditExport(`investor-report-${format}`);
}

export async function exportBusinessSnapshot(bi) {
  const rows = investorReportRows(bi).slice(0, 10);
  const blob = await createInvestorPdf(bi, rows, 'Business Snapshot');
  downloadBlob(blob, `fsd-business-snapshot-${stampName()}.pdf`);
  archiveReport('Business Snapshot', 'PDF', bi, rows);
  auditExport('business-snapshot-pdf');
}

export async function exportDataset(name, rows, format) {
  const safeName = name.replace(/_/g, '-');
  const stamp = stampName();
  if (format === 'json') {
    downloadJson(rows, `fsd-${safeName}-${stamp}.json`);
  } else if (format === 'xlsx') {
    await downloadXlsx(rows, `fsd-${safeName}-${stamp}.xlsx`, name);
  } else {
    downloadCsv(rows, `fsd-${safeName}-${stamp}.csv`);
  }
  auditExport(`${name}-${format}`);
}

export async function createFullBackup(data, bi) {
  const backupData = sanitizeBackupData(data);
  const createdAt = new Date().toISOString();
  const manifest = {
    product: 'FSD Home Services',
    type: 'standard-admin-backup',
    created_at: createdAt,
    app_version: appVersion,
    security_note: 'Standard backup excludes CNIC images, signed URLs, passwords, private worker documents, and storage objects.',
    tables: Object.fromEntries(Object.entries(backupData).map(([key, value]) => [key, Array.isArray(value) ? value.length : 1])),
    range: {
      start: bi.range.start.toISOString(),
      end: bi.range.end.toISOString()
    }
  };
  const payload = JSON.stringify(backupData, null, 2);
  const checksum = await sha256(payload);
  const files = [
    { path: 'manifest.json', content: JSON.stringify({ ...manifest, checksum_sha256: checksum }, null, 2) },
    { path: 'metadata.json', content: JSON.stringify({ generated_by: 'admin-dashboard', app_version: appVersion }, null, 2) },
    { path: 'business-data.json', content: payload },
    { path: 'business-summary.csv', content: toCsv(investorReportRows(bi)) },
    ...Object.entries(backupData)
      .filter(([, rows]) => Array.isArray(rows))
      .map(([name, rows]) => ({ path: `csv/${name}.csv`, content: toCsv(rows) }))
  ];
  const blob = await createZip(files);
  downloadBlob(blob, `fsd-standard-backup-${stampName()}.zip`);
  auditExport('standard-full-backup');
  return { checksum, manifest };
}

export async function reopenArchivedReport(report) {
  if (report.format === 'PDF') {
    const blob = await createArchivedPdf(report);
    downloadBlob(blob, `${report.slug}.pdf`);
  } else if (report.format === 'CSV') {
    downloadText(report.content, `${report.slug}.csv`, 'text/csv;charset=utf-8');
  } else {
    downloadText(report.content, `${report.slug}.txt`, 'text/plain;charset=utf-8');
  }
  auditExport(`archive-download-${report.format.toLowerCase()}`);
}

async function createInvestorPdf(bi, rows, title) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  drawHeader(pdf, title);
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Generated: ${new Date().toLocaleString('en-PK')}`, 48, 105);
  pdf.text(`Range: ${formatDate(bi.range.start)} to ${formatDate(bi.range.end)}`, 48, 122);
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Executive Summary', 48, 158);
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  wrap(pdf, [
    `FSD Home Services currently tracks ${bi.summary.totalWorkers} workers, ${bi.summary.totalRequests} service requests in the selected period, and ${rupees(bi.summary.commissionEarned)} platform commission.`,
    `Business health score is ${bi.summary.healthScore}/100, with top demand in ${bi.summary.topService} and ${bi.summary.topArea}.`
  ].join(' '), 48, 178, 500);
  drawRows(pdf, rows, 230);
  drawFooter(pdf);
  return pdf.output('blob');
}

async function createArchivedPdf(report) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  drawHeader(pdf, report.title);
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Generated: ${new Date(report.created_at).toLocaleString('en-PK')}`, 48, 105);
  drawRows(pdf, report.rows || [], 140);
  drawFooter(pdf);
  return pdf.output('blob');
}

function drawHeader(pdf, title) {
  pdf.setFillColor(15, 118, 110);
  pdf.rect(0, 0, 595, 72, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('FSD Home Services', 48, 34);
  pdf.setFontSize(12);
  pdf.text(title, 48, 54);
}

function drawRows(pdf, rows, startY) {
  let y = startY;
  pdf.setFontSize(10);
  rows.forEach((row, index) => {
    if (y > 760) {
      pdf.addPage();
      y = 60;
    }
    pdf.setFillColor(index % 2 ? 248 : 241, index % 2 ? 250 : 245, index % 2 ? 252 : 249);
    pdf.rect(48, y - 14, 500, 24, 'F');
    pdf.setTextColor(15, 23, 42);
    pdf.text(String(row.metric || row.label || ''), 60, y);
    pdf.setTextColor(15, 118, 110);
    pdf.text(String(row.value ?? ''), 330, y);
    y += 26;
  });
}

function drawFooter(pdf) {
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Confidential admin report. Sensitive CNIC images, passwords, private notes, and private worker documents are excluded.', 48, 812);
}

function wrap(pdf, text, x, y, width) {
  pdf.splitTextToSize(text, width).forEach((line, index) => {
    pdf.text(line, x, y + index * 14);
  });
}

function archiveReport(title, format, bi, rows) {
  const createdAt = new Date();
  const archive = getReportArchive();
  const report = {
    id: crypto.randomUUID(),
    title,
    format,
    month: archiveKeyFor(createdAt),
    created_at: createdAt.toISOString(),
    slug: `${title.toLowerCase().replace(/\W+/g, '-')}-${stampName()}`,
    rows,
    content: toCsv(rows),
    summary: bi.summary
  };
  window.localStorage.setItem(archiveStorageKey, JSON.stringify([report, ...archive].slice(0, 50)));
}

function auditExport(type) {
  const audit = getExportAudit();
  const entry = {
    id: crypto.randomUUID(),
    type,
    created_at: new Date().toISOString()
  };
  window.localStorage.setItem(auditStorageKey, JSON.stringify([entry, ...audit].slice(0, 100)));
}

function readStorage(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function stampName() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function formatDate(date) {
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

function rupees(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
