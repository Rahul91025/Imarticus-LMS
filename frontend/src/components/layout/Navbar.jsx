import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-[var(--dark)]">
          <span className="text-[var(--primary)]">Imarticus</span> LMS
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--dark)] transition">Dashboard</Link>
              <Link to="/summarizer" className="text-[var(--text-muted)] hover:text-[var(--dark)] transition">AI Tools</Link>
              <button
                onClick={handleLogout}
                className="bg-[var(--cream-light)] border border-[var(--border)] px-4 py-1.5 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[var(--text-muted)] hover:text-[var(--dark)] transition">Login</Link>
              <Link
                to="/register"
                className="bg-[var(--primary)] text-white px-4 py-1.5 rounded-lg hover:bg-[var(--primary-dark)] transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
