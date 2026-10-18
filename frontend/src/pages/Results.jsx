import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import PartyLogo from '../components/PartyLogo.jsx';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/candidate/vote/count');
      setResults(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not load results right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000); // live-ish refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader label="Tallying votes" />;

  const totalVotes = results.reduce((sum, r) => sum + (r.count || 0), 0);
  const maxVotes = Math.max(1, ...results.map((r) => r.count || 0));

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-ballot mb-3">LIVE RESULTS</p>
      <div className="flex items-end justify-between mb-2">
        <h1 className="font-serif text-3xl">Current standings</h1>
        {lastUpdated && (
          <span className="text-xs text-ink/40">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      <p className="text-ink/50 text-sm mb-10">
        {totalVotes} vote{totalVotes === 1 ? '' : 's'} counted so far. This page refreshes automatically.
      </p>

      {error && (
        <p className="mb-6 text-sm text-ballot bg-ballot/5 border border-ballot/20 px-4 py-2.5">{error}</p>
      )}

      {results.length === 0 ? (
        <p className="text-ink/45 text-sm border border-line px-6 py-10 text-center">
          No votes have been cast yet.
        </p>
      ) : (
        <ul className="space-y-6">
          {results.map((r, i) => {
            const pct = totalVotes > 0 ? Math.round(((r.count || 0) / totalVotes) * 100) : 0;
            const barPct = Math.max(3, Math.round(((r.count || 0) / maxVotes) * 100));
            return (
              <li key={`${r.party}-${i}`}>
                <div className="flex items-baseline justify-between mb-1.5">
                                   <span className="text-ink font-medium flex items-center gap-3">
                    <PartyLogo src={r.partyLogo} party={r.party} size={28} />
                    {r.name ? `${r.name} · ${r.party}` : r.party}
                  </span>
                  <span className="text-sm text-ink/50 tabular-nums">
                    {r.count} vote{r.count === 1 ? '' : 's'} &middot; {pct}%
                  </span>
                </div>
                <div className="h-2.5 bg-line/60 w-full">
                  <div
                    className="h-full bg-ballot transition-all duration-700 ease-out"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
