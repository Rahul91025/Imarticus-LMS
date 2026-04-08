import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Otp() {
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const savedEmail = useMemo(() => sessionStorage.getItem('otpEmail') || '', []);
  const [email, setEmail] = useState(savedEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // await verifyOtp(email, otp);
      sessionStorage.removeItem('otpEmail');
      localStorage.setItem('pendingPayment', 'true');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
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
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)' }}>Verify OTP</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
          Enter the OTP sent to your email to finish login
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="6-digit OTP"
            required
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            style={inputStyle}
          />

          {error && (
            <p style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Verifying...' : 'Verify and Login'}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>login</Link>
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
