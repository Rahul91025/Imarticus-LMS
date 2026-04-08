import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const data = await login(email, password);
      if (data.requiresOtp) {
        sessionStorage.setItem('otpEmail', email);
        if (data.devOtp) {
          sessionStorage.setItem('devOtp', data.devOtp);
        } else {
          sessionStorage.removeItem('devOtp');
        }
        if (data.mailError) {
          sessionStorage.setItem('otpMailError', data.mailError);
        } else {
          sessionStorage.removeItem('otpMailError');
        }
        navigate('/otp');
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '80vh', padding: '40px 24px',
      background: 'linear-gradient(135deg, #f0f7e4, #f5f9ee)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: 'white',
        border: '1px solid var(--border)', borderRadius: 20, padding: 36,
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>Welcome Back</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
          Sign in to continue learning
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email" placeholder="Email address" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          New here?{' '}
          <Link to="/register" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  background: '#fafbfc',
};
