import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--green-dark)',
            letterSpacing: '-0.5px',
          }}>
            Imarticus
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            background: 'var(--lime-bg)',
            color: 'var(--green-dark)',
            padding: '3px 10px',
            borderRadius: 6,
            letterSpacing: '0.5px',
          }}>
            LMS
          </span>
        </Link>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14 }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--green-dark)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                Dashboard
              </Link>
              <Link to="/summarizer" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--green-dark)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                AI Tools
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  padding: '7px 18px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'var(--text-body)',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--green-dark)'; e.target.style.color = 'var(--green-dark)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-body)'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', fontWeight: 500 }}
                onMouseEnter={e => e.target.style.color = 'var(--green-dark)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'var(--green-dark)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = 'var(--primary-dark)'}
                onMouseLeave={e => e.target.style.background = 'var(--green-dark)'}
              >
                Apply Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
