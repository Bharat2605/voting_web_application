import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';

export default function Registrations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/user/registration');
        setRows(data.registrations || []);
      } catch (err) {
        setError(err?.response?.data?.error || 'Could not load registrations.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Search by name or by Aadhar number.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || String(r.aadharCardNumber).includes(q)
    );
  }, [rows, search]);

  if (loading) return <Loader label="Loading registrations" />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-brass mb-3">ADMIN</p>
      <h1 className="font-serif text-3xl mb-2">Registrations</h1>
      <p className="text-ink/50 text-sm mb-8">
        {rows.length} registered voter{rows.length === 1 ? '' : 's'}.
      </p>

      {error && (
        <p className="mb-6 text-sm px-4 py-2.5 border text-ballot bg-ballot/5 border-ballot/20">{error}</p>
      )}

      {!error && (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or Aadhar number"
            className="field-input mb-4"
          />

          {filtered.length === 0 ? (
            <p className="text-ink/45 text-sm border border-line px-6 py-10 text-center">
              {rows.length === 0 ? 'No registrations yet.' : 'No matching registrations.'}
            </p>
          ) : (
            <div className="border border-line overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-ink/50">
                  <tr>
                    <th className="px-6 py-3 font-normal w-16">#</th>
                    <th className="px-6 py-3 font-normal">Name</th>
                    <th className="px-6 py-3 font-normal">Aadhar card number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((r, i) => (
                    <tr key={r.id}>
                      <td className="px-6 py-3.5 text-ink/45">{i + 1}</td>
                      <td className="px-6 py-3.5 text-ink font-medium">{r.name}</td>
                      <td className="px-6 py-3.5 text-ink/70 tabular-nums">{r.aadharCardNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}