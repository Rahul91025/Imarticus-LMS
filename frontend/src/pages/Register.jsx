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
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--dark)]">Create Account</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Register to access the LMS and AI tools
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text" placeholder="Full name" required
            value={form.name} onChange={e => update('name', e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />
          <input
            type="email" placeholder="Email address" required
            value={form.email} onChange={e => update('email', e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />
          <input
            type="password" placeholder="Password" required
            value={form.password} onChange={e => update('password', e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />
          <input
            type="password" placeholder="Confirm password" required
            value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)]"
          />

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Already have an account? <Link to="/login" className="text-[var(--primary)] font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
