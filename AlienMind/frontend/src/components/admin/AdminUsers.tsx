import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: 'CANDIDATE' | 'COMPANY' | 'INTERVIEWER' | 'ADMIN';
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  CANDIDATE:  'Candidate',
  COMPANY:    'Company',
  INTERVIEWER:'Interviewer',
  ADMIN:      'Admin',
};

export default function AdminUsers() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [query, setQuery]       = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: AdminUser[]) => { setUsers(data); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.toLowerCase().includes(query.toLowerCase())
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px', borderBottom: '1px solid #eaeded', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#16191f' }}>Manage Users</h1>
          <p style={{ margin: 0, color: '#545b64', fontSize: '13px' }}>
            {loading ? 'Loading…' : `${users.length} accounts`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #8c8c8c', borderRadius: '2px', padding: '4px 8px', background: '#fff' }}>
          <Search size={14} color="#545b64" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search name, email, role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '220px' }}
          />
        </div>
      </div>

      {error && (
        <div className="message error" style={{ marginBottom: '12px' }}>
          <strong>✕</strong> <span>Failed to load users: {error}</span>
        </div>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #eaeded', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#16191f' }}>
          <thead style={{ background: '#fafafa', borderBottom: '1px solid #eaeded' }}>
            <tr>
              {['ID', 'Name', 'Email', 'Role', 'Joined', 'Actions'].map((h, i) => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 700, borderRight: i < 5 ? '1px solid #eaeded' : undefined, textAlign: i === 5 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#545b64' }}>Loading users from database…</td></tr>
            )}
            {!loading && filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded', color: '#545b64', fontFamily: 'monospace' }}>{u.id}</td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded', color: '#0052cc', fontWeight: 600 }}>{u.fullName}</td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>{u.email}</td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded' }}>
                  <span style={{
                    background: u.role === 'ADMIN' ? '#fdf3e7' : u.role === 'COMPANY' ? '#e8f0fb' : '#f0faf0',
                    color:      u.role === 'ADMIN' ? '#c45000' : u.role === 'COMPANY' ? '#0052cc' : '#137333',
                    padding: '2px 7px', borderRadius: '2px', fontSize: '11px', fontWeight: 700,
                  }}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', borderRight: '1px solid #eaeded', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button style={{ background: '#fff', border: '1px solid #8c8c8c', borderRadius: '2px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#16191f' }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#545b64' }}>No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
