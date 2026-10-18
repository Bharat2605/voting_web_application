import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import PartyLogo from '../components/PartyLogo.jsx';

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [justVoted, setJustVoted] = useState(false);


  const alreadyVoted = Boolean(user?.isVoted) || justVoted;
  const isAdmin = user?.role === 'admin';

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/candidate');
      setCandidates(data);
    } catch (err) {
      setError('Could not load candidates. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const castVote = async () => {
    if (!selected) return;
    setVoting(true);
    setError('');
    try {
      await api.get(`/candidate/vote/${selected}`);
      setJustVoted(true);
      await refreshProfile();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not record your vote.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <Loader label="Loading candidates" />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <p className="text-xs tracking-widest text-ballot mb-3">GENERAL ELECTION &middot; OFFICIAL BALLOT</p>
      <h1 className="font-serif text-3xl mb-2">
        {isAdmin ? 'Candidate overview' : 'Cast your vote'}
      </h1>
      <p className="text-ink/50 text-sm mb-10">
        {isAdmin
          ? 'Admins manage the candidate list from the Admin panel and do not vote.'
          : alreadyVoted
          ? 'Thank you — your vote has been recorded and cannot be changed.'
          : 'Select one candidate below, then cast your vote. You can only vote once.'}
      </p>


     
      {justVoted && (
        <div className="mb-10 border border-ballot/30 bg-ballot/5 px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 shrink-0 rounded-full border-2 border-ballot flex items-center justify-center animate-stamp">
            <span className="text-ballot text-lg">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Your vote has been cast</p>
            <p className="text-xs text-ink/50">Check the Results page to see live tallies.</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-6 text-sm text-ballot bg-ballot/5 border border-ballot/20 px-4 py-2.5">{error}</p>
      )}

      {candidates.length === 0 ? (
        <p className="text-ink/45 text-sm border border-line px-6 py-10 text-center">
          No candidates have been added yet.
        </p>
      ) : (
        <ul className="border border-line divide-y divide-line">
          {candidates.map((c, i) => {
            const isSelected = selected === c._id;
            const disabled = isAdmin || alreadyVoted;
            return (
              <li key={c._id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelected(c._id)}
                  className={`w-full flex items-center gap-5 px-6 py-5 text-left transition-colors duration-150 ${
                    disabled ? 'cursor-not-allowed' : 'hover:bg-ink/[0.03]'
                  } ${isSelected ? 'bg-ballot/[0.04]' : ''}`}
                >
                  <span className="font-serif text-ink/30 text-lg w-6 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-ballot' : 'border-ink/25'
                    }`}
                  >
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-ballot" />}
                  </span>
                   <PartyLogo src={c.partyLogo} party={c.party} />
                  <span className="flex-1">
                    <span className="block text-ink font-medium">{c.name}</span>
                    <span className="block text-ink/45 text-sm">{c.party}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!isAdmin && !alreadyVoted && candidates.length > 0 && (
        <button
          onClick={castVote}
          disabled={!selected || voting }
          className="btn-primary w-full mt-8"
        >
          {voting ? 'Casting your vote…' : 'Cast your vote'}
        </button>
      )}
    </div>
  );
}
