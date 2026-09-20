import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  name: '',
  age: '',
  email: '',
  mobile: '',
  address: '',
  aadharCardNumber: '',
  password: '',
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        aadharCardNumber: Number(form.aadharCardNumber),
      };
      await signup(payload);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not create your account. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-xl">
        <h1 className="font-serif text-3xl mb-1">Register to vote</h1>
        <p className="text-ink/50 text-sm mb-8">
          Your details are verified against your Aadhar card. Every citizen gets exactly one vote.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label" htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} className="field-input" placeholder="As per Aadhar" />
            </div>
            <div>
              <label className="field-label" htmlFor="age">Age</label>
              <input id="age" name="age" type="number" min="18" required value={form.age} onChange={handleChange} className="field-input" placeholder="18+" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="field-input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="field-label" htmlFor="mobile">Mobile number</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} className="field-input" placeholder="10-digit number" />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="address">Address</label>
            <input id="address" name="address" required value={form.address} onChange={handleChange} className="field-input" placeholder="House no., street, city, state" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label" htmlFor="aadharCardNumber">Aadhar card number</label>
              <input id="aadharCardNumber" name="aadharCardNumber" type="text" inputMode="numeric" required value={form.aadharCardNumber} onChange={handleChange} className="field-input" placeholder="12-digit number" />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Create password</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className="field-input" placeholder="At least 6 characters" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-ballot bg-ballot/5 border border-ballot/20 px-4 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating your account…' : 'Create account & continue'}
          </button>
        </form>

        <p className="text-sm text-ink/50 mt-8">
          Already registered?{' '}
          <Link to="/login" className="text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ballot hover:text-ballot">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
