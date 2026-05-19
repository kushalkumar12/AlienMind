import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import type { AuthMode, Labels, Role, SessionUser } from '../../types';
import { DEFAULT_LABELS } from '../../constants/data';

interface AuthScreenProps {
  authMode: AuthMode;
  labels: Labels;
  role: Role;
  onSubmit: (user: SessionUser) => void;
}

export default function AuthScreen({ authMode, labels, role, onSubmit }: AuthScreenProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [skills, setSkills] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isRegister = authMode === 'register';
  const label = (key: string) => labels[key] ?? DEFAULT_LABELS[key] ?? key;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        const registerData: Record<string, unknown> = {
          fullName,
          email,
          password,
          role,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          summary: '',
          rankTitle: '',
          pricePerInterview: 0,
          companyName: '',
          hiringFocus: '',
        };

        if (role === 'CANDIDATE') registerData.summary = 'Preparing for interviews';
        if (role === 'COMPANY') {
          registerData.companyName = companyName;
          registerData.hiringFocus = 'Tech roles';
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(err.message || `Registration failed: ${response.status}`);
        }

        const result = await response.json();
        setMessage({ type: 'success', text: result.message || `Registered as ${result.data?.fullName}! You can now log in.` });
        setTimeout(() => navigate(`/${role.toLowerCase()}/login`), 1500);
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(err.message || 'Login failed');
        }

        const result = await response.json();
        const userData = result.data;
        setMessage({ type: 'success', text: result.message || `Welcome back, ${userData.fullName}!` });
        setTimeout(() => onSubmit({ name: userData.fullName, email: userData.email, role: userData.role, userId: userData.id }), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="brand large">
          <Video size={34} />
          <span>{label('app.name')}</span>
        </div>
        <h1>
          {role === 'COMPANY'
            ? 'AlienMind Hiring best working professional.'
            : role === 'ADMIN'
            ? 'AlienMind Administration'
            : label('auth.hero.title')}
        </h1>
        <p>
          {role === 'COMPANY'
            ? 'Find and recruit top pre-vetted candidates directly.'
            : role === 'ADMIN'
            ? 'Secure login for platform administrators.'
            : label('auth.hero.subtitle')}
        </p>
      </section>

      <section className="auth-panel">
        {message && (
          <div className={`message ${message.type}`}>
            <strong>{message.type === 'success' ? '✓' : '✕'}</strong>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={submit}>
          {isRegister && (
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Anika Sharma" required />
            </label>
          )}

          {role === 'ADMIN' ? (
            <>
              <label>
                Identity
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Identity" required />
              </label>
              <label>
                Key
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Key" required />
              </label>
            </>
          ) : (
            <>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. anika@example.com" required />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </label>
            </>
          )}

          {isRegister && role === 'COMPANY' && (
            <label>
              Company name
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. NovaTech" required />
            </label>
          )}

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create account' : 'Login'}
          </button>

          <div className="auth-links">
            {isRegister ? (
              <button type="button" className="ghost-button" onClick={() => { navigate(`/${role.toLowerCase()}/login`); setMessage(null); }}>
                Back to Login
              </button>
            ) : (
              <>
                {role !== 'ADMIN' && (
                  <button type="button" className="ghost-button" onClick={() => { navigate(`/${role.toLowerCase()}/register`); setMessage(null); }}>
                    Register
                  </button>
                )}
                {role !== 'ADMIN' && (
                  <button type="button" className="ghost-button" onClick={(e) => { e.preventDefault(); alert('Forgot password functionality coming soon.'); }}>
                    Forgot Password?
                  </button>
                )}
              </>
            )}
          </div>
        </form>

        <p className="auth-note">
          Backend endpoints ready at /api/auth/login and /api/auth/register. Ensure Spring Boot is running on port 8080.
        </p>
      </section>
    </main>
  );
}
