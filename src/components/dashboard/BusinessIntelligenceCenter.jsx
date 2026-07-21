import { useMemo, useState } from 'react';
import {
  Activity,
  Archive,
  BarChart3,
  BriefcaseBusiness,
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import {
  buildBusinessIntelligence,
  buildExportDatasets,
  investorReportRows,
  reportRanges
} from '../../lib/businessIntelligence';
import {
  createFullBackup,
  exportBusinessSnapshot,
  exportDataset,
  exportInvestorReport,
  getExportAudit,
  getReportArchive,
  reopenArchivedReport
} from '../../lib/reportCenter';

const tabs = [
  ['dashboard', 'Executive Dashboard', BarChart3],
  ['reports', 'Investor Reports', FileText],
  ['snapshot', 'Business Snapshot', BriefcaseBusiness],
  ['archive', 'Admin Data Archive', Archive],
  ['exports', 'Export Center', FileSpreadsheet],
  ['backup', 'Backup Center', DatabaseBackup]
];

export function BusinessIntelligenceCenter({ data, loading }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({ range: '30d', startDate: '', endDate: '' });
  const [status, setStatus] = useState('');
  const [working, setWorking] = useState('');
  const [, setArchiveVersion] = useState(0);
  const bi = useMemo(() => buildBusinessIntelligence(data, filters), [data, filters]);
  const datasets = useMemo(() => buildExportDatasets(data, bi.range), [data, bi.range]);
  const archive = getReportArchive();
  const audit = getExportAudit();

  const run = async (key, action, message) => {
    setWorking(key);
    setStatus('');
    try {
      await action();
      setArchiveVersion((value) => value + 1);
      setStatus(message);
    } catch (error) {
      setStatus(error.message || 'Action failed. Please try again.');
    } finally {
      setWorking('');
    }
  };

  return (
    <section id="business-intelligence" className="mt-8 scroll-mt-24">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase text-brand-700">Admin only</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Business Intelligence & Backup Center</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Executive KPIs, investor reports, safe exports, local archives, and standard disaster-recovery backups.
              </p>
            </div>
            <DateFilters filters={filters} setFilters={setFilters} />
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${activeTab === key ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {status && <p className="mx-5 mt-5 rounded-lg bg-brand-50 p-3 text-sm font-bold text-brand-800">{status}</p>}
        {loading && <p className="mx-5 mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">BI data is loading from the admin dashboard...</p>}

        <div className="p-5">
          {activeTab === 'dashboard' && <ExecutiveDashboard bi={bi} />}
          {activeTab === 'reports' && (
            <InvestorReports
              bi={bi}
              working={working}
              onExport={(format) => run(`investor-${format}`, () => exportInvestorReport(bi, format), `Investor ${format.toUpperCase()} report downloaded and archived.`)}
            />
          )}
          {activeTab === 'snapshot' && (
            <BusinessSnapshot
              bi={bi}
              working={working}
              onDownload={() => run('snapshot-pdf', () => exportBusinessSnapshot(bi), 'Business snapshot PDF downloaded and archived.')}
            />
          )}
          {activeTab === 'archive' && <DataArchive archive={archive} audit={audit} onOpen={(report) => run(`archive-${report.id}`, () => reopenArchivedReport(report), 'Archived report downloaded.')} />}
          {activeTab === 'exports' && <ExportCenter datasets={datasets} working={working} onExport={(name, format) => run(`export-${name}-${format}`, () => exportDataset(name, datasets[name], format), `${name.replace(/_/g, ' ')} ${format.toUpperCase()} exported.`)} />}
          {activeTab === 'backup' && <BackupCenter bi={bi} working={working} onBackup={() => run('backup-full', () => createFullBackup(data, bi), 'Standard backup ZIP downloaded.')} />}
        </div>
      </div>
    </section>
  );
}

function DateFilters({ filters, setFilters }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_repeat(2,minmax(130px,1fr))]">
      <select
        value={filters.range}
        onChange={(event) => setFilters((current) => ({ ...current, range: event.target.value }))}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold"
      >
        {reportRanges.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <input
        type="date"
        value={filters.startDate}
        onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value, range: 'custom' }))}
        className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
      />
      <input
        type="date"
        value={filters.endDate}
        onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value, range: 'custom' }))}
        className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
      />
    </div>
  );
}

function ExecutiveDashboard({ bi }) {
  const cards = [
    ['Total Workers', bi.summary.totalWorkers],
    ['Approved Workers', bi.summary.approvedWorkers],
    ['Pending Workers', bi.summary.pendingWorkers],
    ['Customers', bi.summary.customers],
    ['Service Requests', bi.summary.totalRequests],
    ['Completed Jobs', bi.summary.completedJobs],
    ['Completion Rate', `${bi.summary.completionRate}%`],
    ['Revenue', rupees(bi.summary.revenue)],
    ['Platform Commission', rupees(bi.summary.commissionEarned)],
    ['Pending Commission', rupees(bi.summary.pendingCommission)],
    ['Average Rating', bi.summary.averageRating.toFixed(1)],
    ['Business Health', `${bi.summary.healthScore}/100`]
  ];
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => <KpiCard key={label} label={label} value={value} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Demand by Service"><BarList rows={bi.charts.topServices} /></Panel>
        <Panel title="Top Areas"><BarList rows={bi.charts.topAreas} /></Panel>
        <Panel title="Business Health">
          <div className="flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-full border-8 border-brand-100 text-2xl font-bold text-brand-700">{bi.summary.healthScore}</div>
            <div>
              <p className="font-bold text-slate-950">{healthLabel(bi.summary.healthScore)}</p>
              <p className="mt-1 text-sm text-slate-600">Based on completion rate, approved supply, complaints, demand, and pending commission risk.</p>
            </div>
          </div>
        </Panel>
      </div>
      <Panel title="Monthly Growth">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {bi.charts.monthly.map((month) => (
            <div key={month.label} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-bold text-slate-950">{month.label}</p>
              <p className="mt-1 text-sm text-slate-600">{month.requests} requests, {month.completed} completed</p>
              <p className="mt-1 font-bold text-brand-700">{rupees(month.commission)} commission</p>
            </div>
          ))}
          {!bi.charts.monthly.length && <EmptyState text="No monthly data yet." />}
        </div>
      </Panel>
    </div>
  );
}

function InvestorReports({ bi, working, onExport }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Investor Report Preview">
        <div className="grid gap-2">
          {investorReportRows(bi).map((row) => (
            <div key={row.metric} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3 text-sm">
              <span className="font-semibold text-slate-600">{row.metric}</span>
              <strong className="text-slate-950">{row.value}</strong>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Download Options">
        <p className="text-sm leading-6 text-slate-600">Investor reports exclude customer phone numbers, CNIC data, passwords, private notes, and private worker documents.</p>
        <div className="mt-4 grid gap-2">
          <ActionButton icon={FileText} loading={working === 'investor-pdf'} onClick={() => onExport('pdf')}>Download PDF</ActionButton>
          <ActionButton icon={FileSpreadsheet} loading={working === 'investor-xlsx'} onClick={() => onExport('xlsx')}>Download Excel (.xlsx)</ActionButton>
          <ActionButton icon={Download} loading={working === 'investor-csv'} onClick={() => onExport('csv')}>Download CSV</ActionButton>
        </div>
      </Panel>
    </div>
  );
}

function BusinessSnapshot({ bi, working, onDownload }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Snapshot">
        <div className="flex items-center gap-4 rounded-lg bg-brand-50 p-4">
          <TrendingUp className="text-brand-700" size={32} />
          <div>
            <p className="text-sm font-bold uppercase text-brand-700">Executive summary</p>
            <h3 className="text-xl font-bold text-slate-950">{bi.summary.healthScore}/100 health score</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          FSD Home Services has {bi.summary.approvedWorkers} approved workers, {bi.summary.totalRequests} requests in this range,
          {` ${bi.summary.completedJobs}`} completed jobs, and {rupees(bi.summary.commissionEarned)} platform commission.
        </p>
        <ActionButton icon={FileText} loading={working === 'snapshot-pdf'} onClick={onDownload}>Download Snapshot PDF</ActionButton>
      </Panel>
      <Panel title="Highlights">
        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard label="Top Service" value={bi.summary.topService} compact />
          <KpiCard label="Top Area" value={bi.summary.topArea} compact />
          <KpiCard label="Monthly Growth" value={`${bi.summary.monthlyGrowth}%`} compact />
          <KpiCard label="Complaints" value={bi.summary.complaints} compact />
        </div>
      </Panel>
    </div>
  );
}

function DataArchive({ archive, audit, onOpen }) {
  const grouped = archive.reduce((groups, item) => {
    groups[item.month] ||= [];
    groups[item.month].push(item);
    return groups;
  }, {});
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <Panel title="Generated Reports">
        <div className="grid gap-3">
          {Object.entries(grouped).map(([month, reports]) => (
            <div key={month} className="rounded-lg border border-slate-200 p-3">
              <p className="font-bold text-slate-950">{month}</p>
              <div className="mt-2 grid gap-2">
                {reports.map((report) => (
                  <button key={report.id} type="button" onClick={() => onOpen(report)} className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 text-left text-sm hover:bg-slate-100">
                    <span>{report.title} <span className="text-slate-500">({report.format})</span></span>
                    <span className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!archive.length && <EmptyState text="No archived reports yet. Generate an investor report or snapshot first." />}
        </div>
      </Panel>
      <Panel title="Export Audit">
        <div className="grid gap-2">
          {audit.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-bold text-slate-950">{item.type}</p>
              <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
            </div>
          ))}
          {!audit.length && <EmptyState text="No export activity recorded in this browser yet." />}
        </div>
      </Panel>
    </div>
  );
}

function ExportCenter({ datasets, working, onExport }) {
  return (
    <div className="grid gap-3">
      {Object.entries(datasets).map(([name, rows]) => (
        <div key={name} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold capitalize text-slate-950">{name.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-slate-600">{rows.length} records. Sensitive document URLs and passwords are excluded.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SmallButton loading={working === `export-${name}-csv`} onClick={() => onExport(name, 'csv')}>CSV</SmallButton>
            <SmallButton loading={working === `export-${name}-xlsx`} onClick={() => onExport(name, 'xlsx')}>Excel</SmallButton>
            <SmallButton loading={working === `export-${name}-json`} onClick={() => onExport(name, 'json')}>JSON</SmallButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function BackupCenter({ bi, working, onBackup }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <Panel title="Create Full Backup">
        <p className="text-sm leading-6 text-slate-600">
          Generates a standard ZIP backup with sanitized database exports, manifest, metadata, CSV files, and SHA-256 checksum.
          It excludes CNIC images, signed URLs, private documents, passwords, and storage media.
        </p>
        <ActionButton icon={DatabaseBackup} loading={working === 'backup-full'} onClick={onBackup}>Create Full Backup</ActionButton>
      </Panel>
      <Panel title="Security Posture">
        <div className="grid gap-3">
          {[
            'Admin-only dashboard access via existing admin session and RLS.',
            'Investor reports exclude sensitive personal data.',
            'Standard backups exclude private documents and signed URLs.',
            'Future encrypted cloud backups can reuse this manifest/checksum format.'
          ].map((item) => (
            <p key={item} className="flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <ShieldCheck className="mt-0.5 shrink-0 text-brand-700" size={17} />
              {item}
            </p>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold text-slate-950">Selected range: {bi.range.start.toLocaleDateString()} - {bi.range.end.toLocaleDateString()}</p>
      </Panel>
    </div>
  );
}

function KpiCard({ label, value, compact = false }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`${compact ? 'text-xl' : 'text-2xl'} mt-1 break-words font-bold text-brand-700`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-950">
        <Activity size={17} className="text-brand-700" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function BarList({ rows }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-700">{row.label}</span>
            <span className="text-slate-500">{row.value}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
      {!rows.length && <EmptyState text="No matching data yet." />}
    </div>
  );
}

function ActionButton({ icon: Icon, loading, onClick, children }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50">
      <Icon size={17} />
      {loading ? 'Working...' : children}
    </button>
  );
}

function SmallButton({ loading, onClick, children }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">
      {loading ? '...' : children}
    </button>
  );
}

function EmptyState({ text }) {
  return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{text}</p>;
}

function healthLabel(score) {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Stable';
  if (score >= 40) return 'Needs attention';
  return 'High risk';
}

function rupees(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
