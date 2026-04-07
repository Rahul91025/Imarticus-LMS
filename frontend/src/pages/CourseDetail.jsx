import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}`),
      api.get('/courses/enrolled')
    ]).then(([courseRes, enrollRes]) => {
      setCourse(courseRes.data);
      const found = enrollRes.data.find(e => e.course._id === id);
      if (found) setEnrollment(found);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function markComplete(moduleTitle) {
    try {
      const res = await api.put(`/courses/${id}/progress`, { moduleTitle });
      setEnrollment(res.data);
    } catch (err) {
      console.error('Failed to update progress');
    }
  }

  if (loading) return <div className="flex justify-center items-center h-96">Loading...</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/dashboard" className="text-sm text-[var(--primary)] font-semibold">← Back to Dashboard</Link>

      <h1 className="text-3xl font-bold text-[var(--dark)] mt-4">{course.title}</h1>
      <p className="text-[var(--text-muted)] mt-2">{course.description}</p>

      <div className="flex gap-4 mt-4 text-sm">
        <span className="bg-[var(--cream-light)] border border-[var(--border)] px-3 py-1 rounded-lg">{course.duration}</span>
        <span className="bg-[var(--cream-light)] border border-[var(--border)] px-3 py-1 rounded-lg">{course.category}</span>
      </div>

      {enrollment && (
        <div className="mt-6 bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Your Progress</p>
            <p className="text-xl font-bold text-[var(--primary)]">{enrollment.progress}%</p>
          </div>
          <div className="mt-2 bg-gray-100 rounded-full h-2">
            <div className="bg-[var(--primary)] h-2 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mt-8 text-[var(--dark)]">Modules</h2>
      <div className="mt-4 space-y-3">
        {(course.syllabus || []).map(module => {
          const done = enrollment?.completedModules?.includes(module.title);
          return (
            <div key={module.title} className="bg-white border border-[var(--border)] rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{module.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1 leading-6">{module.content}</p>
                  {module.duration && <p className="text-xs text-[var(--primary)] mt-2">{module.duration}</p>}
                </div>
                <button
                  onClick={() => !done && markComplete(module.title)}
                  disabled={done}
                  className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 transition ${
                    done
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  }`}
                >
                  {done ? '✓ Done' : 'Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
