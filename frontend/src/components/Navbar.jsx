import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm tracking-wide pb-1 border-b transition-colors duration-150 ${
      isActive ? 'border-ballot text-ink' : 'border-transparent text-ink/55 hover:text-ink'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-6 py-3.5 text-base ${isActive ? 'text-ballot font-medium' : 'text-ink/70'}`;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
          <span className="w-6 h-6 rounded-full border-[1.5px] border-ballot flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-ballot" />
          </span>
          <span className="font-serif text-lg text-ink">Bharat&nbsp;Vote</span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <nav className="hidden sm:flex items-center gap-7">
            <NavLink to="/" end className={linkClass}>Candidates</NavLink>
            <NavLink to="/results" className={linkClass}>Results</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
           {user.role === 'admin' && (
  <>
    <NavLink to="/admin" className={linkClass}>Admin</NavLink>
    <NavLink to="/registration" className={linkClass}>Registrations</NavLink>
  </>
)}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:inline text-xs text-ink/45 tracking-wide">
                {user.name} &middot; {user.role === 'admin' ? 'Admin' : 'Voter'}
              </span>
              <button
                onClick={handleLogout}
                className="hidden sm:inline text-sm text-ink/60 hover:text-ballot transition-colors"
              >
                Log out
              </button>
              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-ink transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
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

      {/* Mobile dropdown menu */}
      {user && menuOpen && (
        <nav className="sm:hidden border-t border-line bg-paper">
          <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>Candidates</NavLink>
          <NavLink to="/results" className={mobileLinkClass} onClick={closeMenu}>Results</NavLink>
          <NavLink to="/profile" className={mobileLinkClass} onClick={closeMenu}>Profile</NavLink>
          {user.role === 'admin' && (
  <>
    <NavLink to="/admin" className={mobileLinkClass} onClick={closeMenu}>Admin</NavLink>
    <NavLink to="/registration" className={mobileLinkClass} onClick={closeMenu}>Registrations</NavLink>
  </>
)}
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3.5 text-base text-ballot border-t border-line"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}