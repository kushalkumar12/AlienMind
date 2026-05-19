import React, { useEffect, useState } from 'react';
import type { TimeRange, ReportCategory } from '../../types';
import { REPORT_CATEGORIES, TIME_RANGES } from '../../constants/data';

type Metrics = {
  totalUsers: number;
  candidates: number;
  companies: number;
  interviewers: number;
  completedSessions: number;
  activeSessions: number;
  totalResults: number;
};

/** Maps live metric values onto the static report category list */
function applyMetrics(base: ReportCategory[], m: Metrics): ReportCategory[] {
  const live: Record<string, string> = {
    users:      m.totalUsers.toLocaleString(),
    interviews: (m.activeSessions + m.completedSessions).toLocaleString(),
    candidates: m.candidates.toLocaleString(),
    companies:  m.companies.toLocaleString(),
    sessions:   m.completedSessions.toLocaleString(),
  };
  return base.map((cat) => live[cat.id] ? { ...cat, value: live[cat.id] } : cat);
}

export default function AdminReports() {
  const [selectedId, setSelectedId]   = useState('users');
  const [timeRange, setTimeRange]     = useState<TimeRange>('1W');
  const [categories, setCategories]   = useState<ReportCategory[]>(REPORT_CATEGORIES);
  const [metricsError, setMetricsError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: Metrics) => setCategories(applyMetrics(REPORT_CATEGORIES, m)))
      .catch(() => setMetricsError(true));
  }, []);

  const selected = categories.find((r) => r.id === selectedId)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f2f5' }}>
      {/* Time-range toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #d5dbdb', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: '#545b64', marginRight: '6px', fontWeight: 600 }}>Range:</span>
        {TIME_RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTimeRange(key)}
            style={{
              padding: '3px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              background: timeRange === key ? '#0052cc' : '#fff',
              color: timeRange === key ? '#fff' : '#16191f',
              border: `1px solid ${timeRange === key ? '#0052cc' : '#d5dbdb'}`,
              borderRadius: '2px',
              fontWeight: timeRange === key ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
        {timeRange === 'CUSTOM' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
            <input type="date" style={{ padding: '2px 6px', fontSize: '12px', border: '1px solid #d5dbdb', borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', color: '#545b64' }}>to</span>
            <input type="date" style={{ padding: '2px 6px', fontSize: '12px', border: '1px solid #d5dbdb', borderRadius: '2px' }} />
          </div>
        )}
      </div>

      {metricsError && (
        <div style={{ padding: '6px 16px', background: '#fdf3e7', borderBottom: '1px solid #f5cba7', fontSize: '12px', color: '#c45000' }}>
          ⚠ Could not reach backend — showing last known values.
        </div>
      )}

      {/* Finder-style two-pane body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT list pane */}
        <div style={{ width: '240px', flexShrink: 0, background: '#fff', borderRight: '1px solid #d5dbdb', overflowY: 'auto' }}>
          <div style={{ padding: '8px 12px', background: '#f7f8f8', borderBottom: '1px solid #eaeded', fontSize: '11px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Report Categories
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px',
                borderBottom: '1px solid #f3f4f5', cursor: 'pointer',
                background: selectedId === cat.id ? '#e8f0fb' : 'transparent',
                borderLeft: selectedId === cat.id ? '3px solid #0052cc' : '3px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: selectedId === cat.id ? 600 : 400, color: selectedId === cat.id ? '#0052cc' : '#16191f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: '11px', color: cat.positive ? '#137333' : '#d13212', fontWeight: 600, marginTop: '1px' }}>
                  {cat.delta} vs prev
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#16191f', flexShrink: 0 }}>{cat.value}</span>
            </div>
          ))}
        </div>

        {/* RIGHT detail pane */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{selected.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#16191f' }}>{selected.label}</h2>
              <span style={{ fontSize: '12px', color: '#545b64' }}>
                Showing data for: <strong>{TIME_RANGES.find((t) => t.key === timeRange)?.label}</strong>
              </span>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#16191f', lineHeight: 1 }}>{selected.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: selected.positive ? '#137333' : '#d13212', marginTop: '2px' }}>
                {selected.positive ? '▲' : '▼'} {selected.delta.replace(/[+−]/, '')} from previous period
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eaeded', borderRadius: '4px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase', marginBottom: '12px' }}>
              Trend — {TIME_RANGES.find((t) => t.key === timeRange)?.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '6px', borderBottom: '1px solid #eaeded' }}>
              {selected.bars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div title={`${h}%`} style={{ width: '100%', background: i === selected.bars.length - 1 ? '#0052cc' : '#c5cacd', height: `${h}%`, transition: 'height 0.3s ease', borderRadius: '2px 2px 0 0', minHeight: '4px' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#8d9096' }}>{d}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Peak',    value: selected.bars.reduce((a, b) => Math.max(a, b), 0) + '%' },
              { label: 'Average', value: Math.round(selected.bars.reduce((a, b) => a + b, 0) / selected.bars.length) + '%' },
              { label: 'Low',     value: selected.bars.reduce((a, b) => Math.min(a, b), 100) + '%' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '12px', background: '#fff', border: '1px solid #eaeded', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#16191f', marginTop: '4px' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
