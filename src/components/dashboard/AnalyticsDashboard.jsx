import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { getAnalyticsTimeseries, getAnalyticsBreakdown } from '../../lib/api';

const PRESETS = [
  { label: 'Today', days: 1, granularity: 'day' },
  { label: 'Yesterday', days: 1, offset: 1, granularity: 'day' },
  { label: 'This Week', days: 7, weekAlign: true, granularity: 'day' },
  { label: 'Last 7 days', days: 7, granularity: 'day' },
  { label: 'Last 14 days', days: 14, granularity: 'day' },
  { label: 'Last 28 days', days: 28, granularity: 'day' },
  { label: 'This Month', monthAlign: true, granularity: 'day' },
  { label: 'Last 30 days', days: 30, granularity: 'day' },
  { label: 'Last 3 months', days: 90, granularity: 'week' },
  { label: 'Last 6 months', days: 180, granularity: 'week' },
  { label: 'Last 12 months', days: 365, granularity: 'month' },
];

const METRICS = [
  { id: 'total_requests', label: 'Total Requests', color: '#0f766e', formatter: v => v },
  { id: 'completed_requests', label: 'Completed', color: '#10b981', formatter: v => v },
  { id: 'completion_rate', label: 'Completion Rate', color: '#f59e0b', formatter: v => `${v.toFixed(1)}%` },
  { id: 'new_customers', label: 'New Customers', color: '#3b82f6', formatter: v => v },
  { id: 'new_workers', label: 'New Workers', color: '#8b5cf6', formatter: v => v },
  { id: 'revenue', label: 'Revenue', color: '#ef4444', formatter: v => `Rs ${v.toLocaleString('en-PK')}` },
];

export function AnalyticsDashboard() {
  const [activePreset, setActivePreset] = useState(PRESETS[5]); // Last 28 days default
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isCustom, setIsCustom] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState(['total_requests', 'completed_requests', 'new_customers', 'new_workers', 'revenue']);
  
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [, setBreakdown] = useState({ top_services: [], top_areas: [] });
  const [error, setError] = useState(null);

  // Compute actual dates
  const dateRange = useMemo(() => {
    let end = new Date();
    const start = new Date();

    if (isCustom && customRange.start && customRange.end) {
      start.setTime(new Date(customRange.start).getTime());
      end.setTime(new Date(customRange.end).getTime());

      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const granularity = diffDays <= 60 ? 'day' : diffDays <= 180 ? 'week' : 'month';

      const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const prevStart = new Date(prevEnd.getTime() - (end - start));

      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        prevStart: prevStart.toISOString().split('T')[0],
        prevEnd: prevEnd.toISOString().split('T')[0],
        granularity
      };
    } else {
      const preset = activePreset;

      if (preset.weekAlign) {
        const dayOfWeek = end.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(start.getDate() + mondayOffset);
      } else if (preset.monthAlign) {
        start.setDate(1);
        end = new Date(end.getFullYear(), end.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (preset.offset) {
        end.setDate(end.getDate() - preset.offset);
        start.setDate(start.getDate() - preset.offset);
      }

      if (!preset.weekAlign && !preset.monthAlign) {
        start.setDate(start.getDate() - (preset.days || 0) + 1);
      }

      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);

      if (preset.monthAlign) {
        prevStart.setMonth(prevStart.getMonth() - 1);
        prevStart.setDate(1);
        const prevEnd2 = new Date(end);
        prevEnd2.setMonth(prevEnd2.getMonth() - 1);
        prevEnd2.setDate(0);
        prevEnd2.setHours(23, 59, 59, 999);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          prevStart: prevStart.toISOString().split('T')[0],
          prevEnd: prevEnd2.toISOString().split('T')[0],
          granularity: preset.granularity
        };
      }

      if (preset.weekAlign) {
        prevStart.setDate(prevStart.getDate() - 6);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          prevStart: prevStart.toISOString().split('T')[0],
          prevEnd: new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          granularity: preset.granularity
        };
      }

      prevStart.setDate(prevStart.getDate() - (preset.days || 0) + 1);

      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        prevStart: prevStart.toISOString().split('T')[0],
        prevEnd: prevEnd.toISOString().split('T')[0],
        granularity: preset.granularity
      };
    }
  }, [activePreset, isCustom, customRange]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [currSeries, prevSeries, breakdownData] = await Promise.all([
          getAnalyticsTimeseries(dateRange.start, dateRange.end, dateRange.granularity),
          compareEnabled
            ? getAnalyticsTimeseries(dateRange.prevStart, dateRange.prevEnd, dateRange.granularity)
            : Promise.resolve([]),
          getAnalyticsBreakdown(dateRange.start, dateRange.end)
        ]);

        // Post-process series to add calculated metrics (e.g. completion rate)
        const processSeries = (series) => series.map(row => {
          const compRate = row.total_requests > 0 
            ? (row.completed_requests / row.total_requests) * 100 
            : 0;
          return { ...row, completion_rate: compRate };
        });

        setCurrentData(processSeries(currSeries));
        setPreviousData(processSeries(prevSeries));
        setBreakdown(breakdownData);
      } catch (err) {
        console.error("Analytics Error", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    
       if (dateRange.start && dateRange.end) {
      fetchData();
    }
  }, [dateRange, compareEnabled]);

  const toggleMetric = (id) => {
    setActiveMetrics(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Calculate Aggregates
  const aggregates = useMemo(() => {
    const sum = (data, key) => data.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
    const compute = (data) => {
      const totalReq = sum(data, 'total_requests');
      const compReq = sum(data, 'completed_requests');
      return {
        total_requests: totalReq,
        completed_requests: compReq,
        completion_rate: totalReq > 0 ? (compReq / totalReq) * 100 : 0,
        new_customers: sum(data, 'new_customers'),
        new_workers: sum(data, 'new_workers'),
        revenue: sum(data, 'revenue')
      };
    };

    const curr = compute(currentData);
    const prev = compute(previousData);

    const result = {};
    METRICS.forEach(m => {
      const val = curr[m.id];
      const prevVal = prev[m.id];
      let change = null;
      
      if (m.id === 'completion_rate') {
        // Absolute change for percentages
        if (prevVal > 0 || val > 0) {
          change = val - prevVal;
        }
      } else {
        if (prevVal > 0) {
          change = ((val - prevVal) / prevVal) * 100;
        }
      }
      
      result[m.id] = { value: val, change };
    });
    return result;
  }, [currentData, previousData]);

  // Chart Formatter
  const formatXAxis = (tickItem) => {
    const d = new Date(tickItem);
    if (dateRange.granularity === 'month') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (dateRange.granularity === 'week') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-800">
          <Activity className="text-brand-700" size={24} />
          <h2 className="text-lg font-bold">Performance Dashboard</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm">
            <Calendar size={16} className="text-slate-500" />
            <select 
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
              value={isCustom ? 'custom' : activePreset.label}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setActivePreset(PRESETS.find(p => p.label === e.target.value));
                }
              }}
            >
              {PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
           {isCustom && (
            <div className="flex items-center gap-2">
              <input type="date" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} />
              <span className="text-slate-500">to</span>
              <input type="date" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} />
            </div>
          )}

          <button
            type="button"
            onClick={() => setCompareEnabled((v) => !v)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
              compareEnabled
                ? 'border-brand-300 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={14} className={compareEnabled ? 'text-brand-700' : 'text-slate-400'} />
            Compare
          </button>
        </div>
      </div>

      {error && <div className="rounded border-l-4 border-red-500 bg-red-50 p-4 text-red-800">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {METRICS.map(metric => {
          const isActive = activeMetrics.includes(metric.id);
          const { value, change } = aggregates[metric.id] || { value: 0, change: 0 };
          const isPositive = change >= 0;

          return (
            <button
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                isActive 
                  ? 'border-brand-300 bg-brand-50 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: metric.color }} />
              )}
              <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900" style={{ color: isActive ? metric.color : undefined }}>
                  {metric.formatter(value)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {change !== null && change !== 0 ? (
                  <>
                    {isPositive ? <TrendingUp size={14} className="text-emerald-600" /> : <TrendingDown size={14} className="text-red-600" />}
                    <span className={isPositive ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  </>
                ) : change === 0 ? (
                  <span className="text-slate-400">No change</span>
                ) : (
                  <span className="text-slate-400">New period</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-bold text-slate-800">
          Performance Over Time
          {compareEnabled && previousData.length > 0 && (
            <span className="ml-3 text-sm font-medium text-slate-500">
              (comparing to {dateRange.prevStart} - {dateRange.prevEnd})
            </span>
          )}
        </h3>
        
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : currentData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={
                compareEnabled && previousData.length > 0
                  ? currentData.map((curr, i) => {
                      const prev = previousData[i] || {};
                      const merged = { ...curr };
                      METRICS.forEach(m => { merged[`${m.id}_prev`] = prev[m.id] ?? null; });
                      return merged;
                    })
                  : currentData
              } margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="period"
                  tickFormatter={formatXAxis}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                {METRICS.map(metric => {
                  if (!activeMetrics.includes(metric.id)) return null;
                  const isRightAxis = metric.id === 'revenue' || metric.id === 'completion_rate';
                  return (
                    <Line
                      key={metric.id}
                      yAxisId={isRightAxis ? "right" : "left"}
                      type="monotone"
                      name={metric.label}
                      dataKey={metric.id}
                      stroke={metric.color}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  );
                })}
                {compareEnabled && previousData.length > 0 && METRICS.map(metric => {
                  if (!activeMetrics.includes(metric.id)) return null;
                  const isRightAxis = metric.id === 'revenue' || metric.id === 'completion_rate';
                  return (
                    <Line
                      key={`${metric.id}_prev`}
                      yAxisId={isRightAxis ? "right" : "left"}
                      type="monotone"
                      name={`${metric.label} (Previous)`}
                      strokeDasharray="5 5"
                      opacity={0.5}
                      dataKey={`${metric.id}_prev`}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-slate-500">
            No data available for this period.
          </div>
        )}
      </div>


    </div>
  );
}
