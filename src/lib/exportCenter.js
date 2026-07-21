import JSZip from 'jszip';

const textEncoder = new window.TextEncoder();

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text, fileName, type = 'text/plain;charset=utf-8') {
  downloadBlob(new window.Blob([text], { type }), fileName);
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(','))
  ].join('\n');
}

export function downloadCsv(rows, fileName) {
  downloadText(toCsv(rows), fileName, 'text/csv;charset=utf-8');
}

export function downloadJson(data, fileName) {
  downloadText(JSON.stringify(data, null, 2), fileName, 'application/json;charset=utf-8');
}

export async function downloadXlsx(rows, fileName, sheetName = 'Report') {
  const zip = new JSZip();
  const headers = rows.length ? Object.keys(rows[0]) : ['No data'];
  const safeRows = rows.length ? rows : [{ 'No data': 'No records available' }];

  zip.file('[Content_Types].xml', contentTypesXml());
  zip.folder('_rels').file('.rels', rootRelsXml());
  zip.folder('xl').file('workbook.xml', workbookXml(sheetName));
  zip.folder('xl').folder('_rels').file('workbook.xml.rels', workbookRelsXml());
  zip.folder('xl').folder('worksheets').file('sheet1.xml', worksheetXml(headers, safeRows));
  zip.folder('xl').file('styles.xml', stylesXml());

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  downloadBlob(blob, fileName);
}

export async function createZip(files) {
  const zip = new JSZip();
  files.forEach((file) => {
    zip.file(file.path, file.content);
  });
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(text));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = escapeSpreadsheetFormula(String(value).replace(/\r?\n/g, ' '));
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function escapeSpreadsheetFormula(value) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function escapeXml(value) {
  return escapeSpreadsheetFormula(String(value ?? ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function workbookXml(sheetName) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${escapeXml(sheetName).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
}

function workbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellXfs>
</styleSheet>`;
}

function worksheetXml(headers, rows) {
  const allRows = [headers, ...rows.map((row) => headers.map((header) => row[header]))];
  const rowXml = allRows.map((row, rowIndex) => (
    `<row r="${rowIndex + 1}">${row.map((cell, cellIndex) => (
      `<c r="${columnName(cellIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`
    )).join('')}</row>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function columnName(index) {
  let name = '';
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}
