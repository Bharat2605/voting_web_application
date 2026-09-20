import { useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await api.put('/user/profile/password', form);
      setStatus({ type: 'success', message: 'Password updated successfully.' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.error || err?.response?.data?.err || 'Could not update your password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const rows = [
    ['Full name', user.name],
    ['Age', user.age],
    ['Email', user.email || '—'],
    ['Mobile', user.mobile || '—'],
    ['Address', user.address],
    ['Aadhar card number', user.aadharCardNumber],
    ['Role', user.role === 'admin' ? 'Administrator' : 'Voter'],
    ['Voting status', user.isVoted ? 'Vote cast' : 'Not yet voted'],
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-ballot mb-3">YOUR ACCOUNT</p>
      <h1 className="font-serif text-3xl mb-10">Profile</h1>

      <dl className="border border-line divide-y divide-line mb-14">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between px-6 py-4 text-sm">
            <dt className="text-ink/50">{label}</dt>
            <dd className="text-ink font-medium text-right">{String(value)}</dd>
          </div>
        ))}
      </dl>

      <h2 className="font-serif text-2xl mb-1">Change password</h2>
      <p className="text-ink/50 text-sm mb-6">Use your current password to set a new one.</p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
        <div>
          <label className="field-label" htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            value={form.currentPassword}
            onChange={handleChange}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={form.newPassword}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        {status && (
          <p
            className={`text-sm px-4 py-2.5 border ${
              status.type === 'success'
                ? 'text-ink bg-ink/5 border-ink/15'
                : 'text-ballot bg-ballot/5 border-ballot/20'
            }`}
          >
            {status.message}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-outline w-full">
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
