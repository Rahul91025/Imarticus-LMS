import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      localStorage.setItem('pendingPayment', 'true');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
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
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>Create Account</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
          Register to access the LMS and AI tools
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text" placeholder="Full name" required
            value={form.name} onChange={e => update('name', e.target.value)}
            style={inputStyle}
          />
          <input
            type="email" placeholder="Email address" required
            value={form.email} onChange={e => update('email', e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" required
            value={form.password} onChange={e => update('password', e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Confirm password" required
            value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
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
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>Sign in</Link>
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
