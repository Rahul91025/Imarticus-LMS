import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Home() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/courses/featured')
      .then(res => setCourse(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user && course && !user.hasPaid && !paying && localStorage.getItem('pendingPayment')) {
      localStorage.removeItem('pendingPayment');
      handlePay();
    }
  }, [user, course]); // eslint-disable-line

  async function verifyAndGo(payload) {
    await api.post('/payment/verify', { ...payload, courseId: course?._id });
    await refreshProfile();
    setMsg('Payment done! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 1000);
  }

  async function handlePay() {
    if (!course) return;
    if (!user) return navigate('/register');
    if (user.hasPaid) return navigate('/dashboard');

    try {
      setPaying(true);
      setMsg('');
      const { data: order } = await api.post('/payment/create-order', { courseId: course._id });

      if (order.mock) {
        await verifyAndGo({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_sig',
          mock: true
        });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay');

      new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Imarticus Learning',
        description: course.title,
        order_id: order.orderId,
        handler: async response => await verifyAndGo(response),
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#c54023' }
      }).open();
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (location.state?.autoPay && user && course && !user.hasPaid && !paying) {
      navigate('/', { replace: true, state: {} });
      handlePay();
    }
  }, [location.state?.autoPay, user, course]);

  if (loading) return <div className="flex justify-center items-center h-96">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            {course?.category || 'Undergraduate Program'}
          </span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-bold leading-tight text-[var(--dark)]">
            {course?.title || 'UG Program in Finance & Business'}
          </h1>
          <p className="mt-4 text-[var(--text-muted)] leading-7">
            {course?.description || 'Become real-world ready through depth in Finance, global immersions, boardroom simulations, market labs, and GenAI decision-making.'}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handlePay}
              disabled={paying}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50"
            >
              {paying ? 'Processing...' : `Apply & Pay ₹${course?.price || 500}`}
            </button>
            <a href="#syllabus" className="border border-[var(--border)] px-6 py-3 rounded-lg font-semibold hover:border-[var(--primary)] transition">
              View Syllabus
            </a>
          </div>

          {msg && (
            <p className="mt-4 p-3 bg-white border border-[var(--border)] rounded-lg text-sm">{msg}</p>
          )}
        </div>

        <div className="bg-[var(--dark)] text-white rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Quick Facts</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Duration', value: course?.duration || '3 Years' },
              { label: 'Practice hours', value: course?.practiceHours || '500+' },
              { label: 'Test fee', value: `₹${course?.price || 500}` },
              { label: 'AI Tools', value: 'Included' }
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights */}
      {course?.highlights && course.highlights.length > 0 && (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {course.highlights.map(h => (
            <div key={h} className="bg-white border border-[var(--border)] rounded-xl p-4 text-sm">
              ✓ {h}
            </div>
          ))}
        </div>
      )}

      {/* Syllabus */}
      <div id="syllabus" className="mt-14">
        <h2 className="text-2xl font-bold text-[var(--dark)]">Course Syllabus</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {(course?.syllabus || []).map(item => (
            <div key={item.title} className="bg-white border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)] leading-6">{item.content}</p>
              {item.duration && <p className="mt-2 text-xs text-[var(--primary)]">{item.duration}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-[var(--dark)]">How to Get Started</h2>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          {[
            { n: '1', title: 'Browse', desc: 'Check out the course details above' },
            { n: '2', title: 'Register', desc: 'Create your learner account' },
            { n: '3', title: `Pay ₹${course?.price || 500}`, desc: 'Complete the test payment' },
            { n: '4', title: 'Learn', desc: 'Access courses and AI tools' }
          ].map(step => (
            <div key={step.n} className="bg-[var(--cream-light)] border border-[var(--border)] rounded-xl p-5">
              <span className="text-3xl font-black text-[var(--primary)] opacity-20">{step.n}</span>
              <h3 className="font-bold mt-1">{step.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
