import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

const emptyForm = { name: '', party: '', age: '' };

export default function AdminPanel() {
  const [candidates, setCandidates] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/candidate'),
        api.get('/candidate/vote/count'),
      ]);
      setCandidates(listRes.data);
      const map = {};
      countRes.data.forEach((r) => {
        map[`${r.name}__${r.party}`] = r.count;
      });
      setCounts(map);
    } catch (err) {
      setError('Could not load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await api.post('/candidate', { ...form, age: Number(form.age) });
      setForm(emptyForm);
      setNotice('Candidate added.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Could not add candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setNotice('');
    setDeletingId(id);
    try {
      await api.delete(`/candidate/${id}`);
      setNotice('Candidate removed.');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Could not remove candidate.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader label="Loading admin panel" />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-brass mb-3">ADMIN</p>
      <h1 className="font-serif text-3xl mb-2">Manage candidates</h1>
      <p className="text-ink/50 text-sm mb-10">
        Add, remove, and keep track of every candidate on the ballot. Admins cannot vote.
      </p>

      <form onSubmit={handleAdd} className="border border-line px-6 py-6 mb-4 space-y-5">
        <h2 className="font-serif text-xl">Add a candidate</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="party">Party</label>
            <input id="party" name="party" required value={form.party} onChange={handleChange} className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="age">Age</label>
            <input id="age" name="age" type="number" required value={form.age} onChange={handleChange} className="field-input" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Adding…' : 'Add candidate'}
        </button>
      </form>

      {(error || notice) && (
        <p className={`mb-6 text-sm px-4 py-2.5 border ${error ? 'text-ballot bg-ballot/5 border-ballot/20' : 'text-ink bg-ink/5 border-ink/15'}`}>
          {error || notice}
        </p>
      )}

      {candidates.length === 0 ? (
        <p className="text-ink/45 text-sm border border-line px-6 py-10 text-center">
          No candidates on the ballot yet — add the first one above.
        </p>
      ) : (
        <ul className="border border-line divide-y divide-line">
          {candidates.map((c) => (
            <li key={c._id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-ink font-medium">{c.name}</p>
                <p className="text-ink/45 text-sm">
                  {c.party} &middot; {counts[`${c.name}__${c.party}`] ?? 0} vote
                  {counts[`${c.name}__${c.party}`] === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c._id)}
                disabled={deletingId === c._id}
                className="text-sm text-ink/50 hover:text-ballot transition-colors"
              >
                {deletingId === c._id ? 'Removing…' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
