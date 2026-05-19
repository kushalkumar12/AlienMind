import React from 'react';

export default function AdminSettings() {
  return (
    <div style={{ padding: '20px', border: '1px solid #d5dbdb', boxShadow: 'none' }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #eaeded', paddingBottom: '12px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#16191f' }}>System Settings</h1>
        <p style={{ margin: 0, color: '#545b64', fontSize: '13px' }}>Global configuration and maintenance toggles</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#16191f', border: '1px solid #eaeded' }}>
        <thead style={{ background: '#fafafa', borderBottom: '1px solid #eaeded' }}>
          <tr>
            <th style={{ padding: '8px 12px', fontWeight: 700, width: '70%', borderRight: '1px solid #eaeded' }}>Setting</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, width: '30%' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Maintenance Mode',           description: 'Disable non-admin logins and display a maintenance banner.', type: 'checkbox' as const, defaultChecked: false },
            { label: 'New User Registration',       description: 'Allow new candidates and companies to create accounts.',     type: 'checkbox' as const, defaultChecked: true },
            { label: 'Max Interview Duration (min)',description: 'Automatically end sessions after this limit.',               type: 'number' as const,   defaultValue: 60 },
          ].map(({ label, description, type, defaultChecked, defaultValue }) => (
            <tr key={label} style={{ borderBottom: '1px solid #eaeded' }}>
              <td style={{ padding: '12px', borderRight: '1px solid #eaeded' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ color: '#545b64', fontSize: '12px' }}>{description}</div>
              </td>
              <td style={{ padding: '12px' }}>
                {type === 'checkbox' ? (
                  <input type="checkbox" defaultChecked={defaultChecked} style={{ margin: 0, cursor: 'pointer' }} />
                ) : (
                  <input type="number" defaultValue={defaultValue} style={{ padding: '4px 8px', borderRadius: '2px', border: '1px solid #8c8c8c', width: '80px', fontSize: '13px' }} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
