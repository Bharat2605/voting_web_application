import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm tracking-wide pb-1 border-b transition-colors duration-150 ${
      isActive ? 'border-ballot text-ink' : 'border-transparent text-ink/55 hover:text-ink'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-6 h-6 rounded-full border-[1.5px] border-ballot flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-ballot" />
          </span>
          <span className="font-serif text-lg text-ink">Bharat&nbsp;Vote</span>
        </Link>

        {user && (
          <nav className="hidden sm:flex items-center gap-7">
            <NavLink to="/" end className={linkClass}>Candidates</NavLink>
            <NavLink to="/results" className={linkClass}>Results</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>Admin</NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:inline text-xs text-ink/45 tracking-wide">
                {user.name} &middot; {user.role === 'admin' ? 'Admin' : 'Voter'}
              </span>
              <button onClick={handleLogout} className="text-sm text-ink/60 hover:text-ballot transition-colors">
                Log out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-ink/70 hover:text-ink">Log in</Link>
              <Link to="/signup" className="btn-primary !px-4 !py-2 text-xs">Register to vote</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
