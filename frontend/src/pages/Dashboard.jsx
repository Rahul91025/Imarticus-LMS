import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled')
      .then(res => setEnrollments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--dark)]">Dashboard</h1>
      <p className="text-[var(--text-muted)] mt-2">Welcome back, {user?.name}</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <p className="text-sm text-[var(--text-muted)]">Enrolled Courses</p>
          <p className="text-2xl font-bold mt-1">{enrollments.length}</p>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <p className="text-sm text-[var(--text-muted)]">Payment Status</p>
          <p className="text-2xl font-bold mt-1">{user?.hasPaid ? '✓ Paid' : 'Pending'}</p>
        </div>
        <Link to="/summarizer" className="bg-[var(--primary)] text-white rounded-xl p-5 hover:bg-[var(--primary-dark)] transition">
          <p className="text-sm opacity-80">AI Tool</p>
          <p className="text-xl font-bold mt-1">Summarizer →</p>
        </Link>
      </div>

      <h2 className="text-xl font-bold mt-10 text-[var(--dark)]">My Courses</h2>

      {loading && <p className="mt-4 text-[var(--text-muted)]">Loading...</p>}

      {!loading && enrollments.length === 0 && (
        <div className="mt-4 bg-white border border-[var(--border)] rounded-xl p-6 text-center">
          <p className="text-[var(--text-muted)]">No courses yet.</p>
          <Link to="/" className="text-[var(--primary)] font-semibold text-sm mt-2 inline-block">Browse courses →</Link>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {enrollments.map(enrollment => (
          <Link
            key={enrollment._id}
            to={`/course/${enrollment.course._id}`}
            className="block bg-white border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)] transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{enrollment.course.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{enrollment.course.category} • {enrollment.course.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--primary)]">{enrollment.progress}%</p>
                <p className="text-xs text-[var(--text-muted)]">progress</p>
              </div>
            </div>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div className="bg-[var(--primary)] h-2 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
