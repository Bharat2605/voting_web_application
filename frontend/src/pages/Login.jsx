import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ aadharCardNumber: '', password: '' });
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
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="field-input"
              />
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
