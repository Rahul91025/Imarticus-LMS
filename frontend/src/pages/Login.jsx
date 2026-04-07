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
      await login(email, password);
      localStorage.setItem('pendingPayment', 'true');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--dark)]">Welcome Back</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Sign in to continue learning
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email" placeholder="Email address" required
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />
          <input
            type="password" placeholder="Password" required
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--text-muted)]">
          New here? <Link to="/register" className="text-[var(--primary)] font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
