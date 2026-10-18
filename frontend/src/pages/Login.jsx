import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// 👁 Eye icons (no extra package needed)
function EyeIcon({ open }) {
  return open ? (
    // Eye open = password visible
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // Eye with slash = password hidden (dots)
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 4.06-5.06" />
      <path d="M9.9 5.24A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ aadharCardNumber: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // 👁 new
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.aadharCardNumber, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid Aadhar number or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-2">
      {/* Left: editorial panel */}
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper px-14 py-16">
        <span className="font-serif text-lg">Bharat&nbsp;Vote</span>
        <div>
          <p className="font-serif text-4xl leading-[1.15] max-w-sm">
            One person, one vote, one voice that counts.
          </p>
          <p className="mt-6 text-paper/55 text-sm max-w-xs leading-relaxed">
            Sign in with your Aadhar card number to view candidates, cast your vote,
            and watch results update live.
          </p>
        </div>
        <p className="text-paper/35 text-xs">Secure &middot; Verified &middot; One vote per citizen</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl mb-1">Welcome back</h1>
          <p className="text-ink/50 text-sm mb-8">Log in to continue to your ballot.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label" htmlFor="aadharCardNumber">Aadhar card number</label>
              <input
                id="aadharCardNumber"
                name="aadharCardNumber"
                type="text"
                inputMode="numeric"
                required
                value={form.aadharCardNumber}
                onChange={handleChange}
                placeholder="e.g. 234567890123"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              {/* 👁 password box + eye button */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="field-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-ink/45 hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-ballot bg-ballot/5 border border-ballot/20 px-4 py-2.5">{error}</p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-ink/50 mt-8">
            Not registered yet?{' '}
            <Link to="/signup" className="text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ballot hover:text-ballot">
              Create your voter account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}