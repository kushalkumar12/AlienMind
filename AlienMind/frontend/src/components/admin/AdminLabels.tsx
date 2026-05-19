import React, { useEffect, useState } from 'react';
import type { Labels } from '../../types';

type Setting = {
  key: string;
  value: string;
  publicSetting: boolean;
  iconData?: string;
};

interface AdminLabelsProps {
  onUpdate: (newLabels: Labels) => void;
}

export default function AdminLabels({ onUpdate }: AdminLabelsProps) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/admin/all')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateSetting(key: string, value: string, publicSetting: boolean) {
    try {
      const response = await fetch(`/api/settings/admin/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, publicSetting, iconData: null }),
      });
      if (!response.ok) throw new Error('Update failed');
      const updated: Setting = await response.json();
      setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      onUpdate({ [key]: value });
      setEditingKey(null);
      setMessage({ type: 'success', text: `Updated "${key}"` });
      setTimeout(() => setMessage(null), 2500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update setting' });
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #d5dbdb', boxShadow: 'none' }}>
      {message && (
        <div className={`message ${message.type}`} style={{ marginBottom: '12px' }}>
          <strong>{message.type === 'success' ? '✓' : '✕'}</strong>
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ marginBottom: '16px', borderBottom: '1px solid #eaeded', paddingBottom: '12px' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#16191f' }}>Platform Labels</h1>
        <p style={{ margin: 0, color: '#545b64', fontSize: '13px' }}>Manage all platform content, features, and configurations</p>
      </div>

      {loading ? (
        <div style={{ fontSize: '13px', color: '#545b64' }}>Loading settings…</div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #eaeded', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#16191f' }}>
            <thead style={{ background: '#fafafa', borderBottom: '1px solid #eaeded' }}>
              <tr>
                <th style={{ padding: '8px 12px', fontWeight: 700, width: '25%', borderRight: '1px solid #eaeded' }}>Key</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, width: '50%', borderRight: '1px solid #eaeded' }}>Value</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, width: '15%', borderRight: '1px solid #eaeded' }}>Visibility</th>
                <th style={{ padding: '8px 12px', fontWeight: 700, width: '10%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) =>
                editingKey === setting.key ? (
                  <tr key={setting.key} style={{ background: '#f2f8fd', borderBottom: '1px solid #eaeded' }}>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <form
                        style={{ display: 'flex', gap: '16px', padding: '12px 16px', alignItems: 'flex-start' }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          updateSetting(setting.key, fd.get('value') as string, fd.get('public') === 'on');
                        }}
                      >
                        <input type="hidden" name="key" value={setting.key} />
                        <div style={{ width: '25%' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0052cc' }}>{setting.key}</span>
                        </div>
                        <div style={{ width: '50%' }}>
                          <textarea name="value" defaultValue={setting.value} rows={2}
                            style={{ width: '100%', padding: '6px', borderRadius: '2px', border: '1px solid #8c8c8c', fontSize: '13px', outline: 'none', resize: 'vertical' }} required />
                        </div>
                        <div style={{ width: '10%' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input type="checkbox" name="public" defaultChecked={setting.publicSetting} style={{ margin: 0 }} />
                            Public
                          </label>
                        </div>
                        <div style={{ width: '15%', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setEditingKey(null)}
                            style={{ background: '#fff', border: '1px solid #8c8c8c', borderRadius: '2px', padding: '2px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#16191f' }}>
                            Cancel
                          </button>
                          <button type="submit"
                            style={{ background: '#ec7211', border: '1px solid #ec7211', borderRadius: '2px', padding: '2px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
                            Save
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={setting.key} style={{ borderBottom: '1px solid #eaeded' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#0052cc', verticalAlign: 'top', borderRight: '1px solid #eaeded' }}>{setting.key}</td>
                    <td style={{ padding: '8px 12px', verticalAlign: 'top', wordBreak: 'break-word', borderRight: '1px solid #eaeded' }}>{setting.value}</td>
                    <td style={{ padding: '8px 12px', verticalAlign: 'top', borderRight: '1px solid #eaeded' }}>
                      <span style={{ background: setting.publicSetting ? '#e6f4ea' : '#f1f3f4', color: setting.publicSetting ? '#137333' : '#5f6368', padding: '2px 6px', borderRadius: '2px', fontSize: '11px', fontWeight: 600 }}>
                        {setting.publicSetting ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', verticalAlign: 'top', textAlign: 'center' }}>
                      <button onClick={() => setEditingKey(setting.key)}
                        style={{ background: '#fff', border: '1px solid #8c8c8c', borderRadius: '2px', padding: '2px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#16191f' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
