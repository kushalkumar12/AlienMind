import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Issue = { id: number; summary: string; detail: string; reporter: string; age: string; resolved: boolean };

const PLACEHOLDER_ISSUES: Issue[] = [
  { id: 4092, summary: 'Video feed frozen during interview #4092', detail: 'The candidate reported that my video feed completely froze 10 minutes in…', reporter: 'NovaTech Hiring', age: '2 hours',  resolved: false },
  { id: 4080, summary: 'Cannot update company billing details',    detail: 'The save button on the billing page is unresponsive on Firefox…',          reporter: 'Acme Corp',      age: '1 day',    resolved: true },
];

export default function AdminIssues() {
  return (
    <div style={{ padding: '20px', border: '1px solid #d5dbdb', boxShadow: 'none' }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #eaeded', paddingBottom: '12px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#16191f' }}>Reported Issues</h1>
        <p style={{ margin: 0, color: '#545b64', fontSize: '13px' }}>Review and resolve user-submitted bugs and reports</p>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #eaeded', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#16191f' }}>
          <thead style={{ background: '#fafafa', borderBottom: '1px solid #eaeded' }}>
            <tr>
              <th style={{ padding: '8px 12px', fontWeight: 700, width: '10%',  borderRight: '1px solid #eaeded' }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, width: '50%',  borderRight: '1px solid #eaeded' }}>Summary</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, width: '20%',  borderRight: '1px solid #eaeded' }}>Reporter</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, width: '10%',  borderRight: '1px solid #eaeded' }}>Age</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, width: '10%',  textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {PLACEHOLDER_ISSUES.map((issue) => (
              <tr key={issue.id} style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>
                  {issue.resolved ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#137333', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Resolved
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d13212', fontWeight: 600 }}>
                      <AlertCircle size={12} /> Open
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>
                  <div style={{ fontWeight: 600, color: '#0052cc', marginBottom: '2px' }}>{issue.summary}</div>
                  <div style={{ color: '#545b64', fontSize: '12px' }}>{issue.detail}</div>
                </td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>{issue.reporter}</td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>{issue.age}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button style={{ background: '#fff', border: '1px solid #8c8c8c', borderRadius: '2px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#16191f' }}>
                    {issue.resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
