import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiAward, FiBarChart2, FiGlobe, FiMapPin, FiCheck } from 'react-icons/fi';

import heroImg from '../assets/images/hero.png';
import classroomImg from '../assets/images/classroom.png';
import globalImg from '../assets/images/global.png';
import boardroomImg from '../assets/images/boardroom.png';
import mumbaiImg from '../assets/images/mumbai.png';

function loadRazorpay() {
  return new Promise(ok => {
    if (window.Razorpay) return ok(true);
    let s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => ok(true);
    s.onerror = () => ok(false);
    document.body.appendChild(s);
  });
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let start = 0;
        let step = Math.ceil(end / (duration / 30));
        let timer = setInterval(() => {
          start += step;
          if (start >= end) { start = end; clearInterval(timer); }
          setCount(start);
        }, 30);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState('');

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const [openFaq, setOpenFaq] = useState(null);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
  }, [user, course]);

  async function verifyAndGo(payload) {
    await api.post('/payment/verify', { ...payload, courseId: course?._id });
    await refreshProfile();
    setMsg('Payment done! Redirecting…');
    setTimeout(() => navigate('/dashboard'), 1000);
  }

  async function handlePay() {
    if (!course) return;
    if (!user) return navigate('/register');
    if (user.hasPaid) return navigate('/dashboard');

    try {
      setPaying(true);
      setMsg('');
      let { data: order } = await api.post('/payment/create-order', { courseId: course._id });

      if (order.mock) {
        await verifyAndGo({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_sig',
          mock: true,
        });
        return;
      }

      let loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load Razorpay');

      new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Imarticus Learning',
        description: course.title,
        order_id: order.orderId,
        handler: async r => await verifyAndGo(r),
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#1a4731' },
      }).open();
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  }

  const quickFacts = [
    { icon: <FiCalendar size={24} />, title: '3-Year Full-Time', desc: 'UG Program with opt-in Residence' },
    { icon: <FiAward size={24} />, title: 'BBA Degree', desc: 'Pursued independently in parallel' },
    { icon: <FiBarChart2 size={24} />, title: 'ACCA & CFA', desc: 'Integrated curriculum' },
    { icon: <FiGlobe size={24} />, title: 'Immersions', desc: 'IIM Vizag, Singapore & Explore India' },
    { icon: <FiMapPin size={24} />, title: 'Located in', desc: 'Powai, Mumbai — India\'s financial hub' },
  ];

  const edgeCards = [
    {
      img: classroomImg,
      title: 'Razorsharp & deep Finance Expertise',
      text: 'A 3-year journey with deep specialisations in Fintech, Financial Analysis, and Global Accounting; including ACCA and CFA-integrated tracks.',
      bg: 'lime',
    },
    {
      img: globalImg,
      title: 'An understanding that\'s both Global and Grounded',
      text: 'With immersions from Singapore to small-town India, you\'ll develop a rare, real understanding of how markets work — not just in theory, but in culture and context.',
      bg: 'dark',
    },
    {
      img: boardroomImg,
      title: 'AI-enabled Decision Making',
      text: 'From DCF models to pitch decks, you\'ll learn how to think, build, and lead with GenAI tools — mastering the tech that\'s redefining global finance.',
      bg: 'lime',
    },
    {
      img: mumbaiImg,
      title: 'Built for the Human Behind the Professional',
      text: 'Through immersive experiences, cultural exchanges, and mentor circles, we help young adults grow into confident, empathetic, and self-aware individuals.',
      bg: 'dark',
    },
  ];

  const placementCompanies = [
    { name: 'JP Morgan', count: '5000+' },
    { name: 'KPMG', count: '1500+' },
    { name: 'Deloitte', count: '1500+' },
    { name: 'EY', count: '1200+' },
    { name: 'PwC', count: '900+' },
  ];

  const testimonials = [
    { name: 'Anandu Nandakumar', text: 'The learning experience at Imarticus was really good. Our domain trainers were excellent, and they helped me a lot in improving my communication skills.' },
    { name: 'Ankita Jethwa', text: 'My experience with Imarticus was great. It significantly helped me build my career in Investment Banking. The curriculum was very helpful.' },
    { name: 'Harsh Soni', text: 'It was such an incredible journey of joy and learning. Throughout my experience with Imarticus, I learned new things and got the correct idea about the industry.' },
    { name: 'Priyanka Bhanage', text: 'The trainers and mentors at Imarticus are supportive. It is an excellent opportunity to explore your career in Finance.' },
    { name: 'Raj Jaiswal', text: 'I want to thank the Imarticus Learning team for helping me secure my dream job at a young age.' },
  ];

  const faqs = [
    {
      q: 'Will I be able to pursue a master\'s degree later?',
      a: 'Yes! You can pursue MBA programmes in India (CAT, NMAT, SNAP, XAT) and abroad (GMAT, GRE). You can also go for professional certifications like CA, CS, CPA, CFM, CFA, ACCA, and more.',
    },
    {
      q: 'What career pathways does ISFB prepare me for?',
      a: 'ISFB prepares you for placements in corporate roles at Investment Banking, Consulting, Fintech, Wealth Management. Also supports entrepreneurship backed by BlinC\'s ₹25Cr Venture Fund and Global Masters via Ambitio partnership.',
    },
    {
      q: 'Is the BBA degree UGC-recognised?',
      a: 'Yes, the online BBA offered through recommended colleges like NMIMS & Symbiosis is fully UGC-recognised and accepted by companies, government bodies, and academic institutions globally.',
    },
    {
      q: 'What\'s the application fee?',
      a: `The application fee is ₹${course?.price || 500}. This is a one-time fee to start your admission process.`,
    },
  ];

  const roles = [
    { title: 'Management Consulting', salary: '₹12.5 LPA', jobs: '3,800+' },
    { title: 'Financial Strategy Analyst', salary: '₹10 LPA', jobs: '2,600+' },
    { title: 'Strategy Analyst', salary: '₹9 LPA', jobs: '5,200+' },
    { title: 'Business Analyst', salary: '₹7 LPA', jobs: '1,000+' },
  ];

  useEffect(() => {
    let timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--green-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>

      {}
      <section style={{ background: 'linear-gradient(135deg, #f0f7e4 0%, #e8f5d4 50%, #f5f9ee 100%)', padding: '60px 0 40px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'center' }}>

          {}
          <div className="animate-fadeUp">
            <span className="badge">Round 3 · Deadline 30th April 2026</span>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginTop: 20, color: 'var(--text-dark)' }}>
              India's Only UG Program in Finance & Business that gets you{' '}
              <span className="serif-accent" style={{ fontSize: '3rem' }}>Real-World Ready</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--text-body)', maxWidth: 520, lineHeight: 1.7 }}>
              3-year full-time program at Powai, Mumbai. Deep specialisations in Fintech, Financial Analysis, and Global Accounting with ACCA & CFA-integrated tracks.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? 'Processing…' : `Apply Now · ₹${course?.price || 500}`}
              </button>
              <a href="#syllabus" className="btn btn-outline">Download Brochure</a>
            </div>
            {msg && <p style={{ marginTop: 16, padding: '12px 16px', background: 'white', borderRadius: 10, fontSize: 14, border: '1px solid var(--border)' }}>{msg}</p>}
          </div>

          {}
          <div className="animate-fadeUp delay-200" style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text-dark)' }}>Start Your Journey</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Fill in your details and our team will guide you.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                style={inputStyle}
              />
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
              Already Registered?{' '}
              <span onClick={() => navigate('/login')} style={{ color: 'var(--green-dark)', fontWeight: 600, cursor: 'pointer' }}>Login here</span>
            </p>
          </div>
        </div>

        {}
        <div className="container" style={{ marginTop: 40, overflow: 'hidden', borderRadius: 20 }}>
          <img src={heroImg} alt="ISFB Students" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 20 }} />
        </div>
      </section>


      {}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
          {quickFacts.map((fact, i) => (
            <div key={i} style={{ padding: '28px 20px', borderRight: i < 4 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
              <span style={{ color: 'var(--green-dark)' }}>{fact.icon}</span>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-dark)', marginTop: 8 }}>{fact.title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{fact.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ maxWidth: 500, marginBottom: 48 }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.2 }}>
              You Graduate with the ISFB <span className="serif-accent" style={{ fontSize: '2.6rem' }}>Edge</span>
            </h2>
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 16 }}>
              We've built your learning journey keeping the best possible tenets in mind
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {edgeCards.map((card, i) => (
              <div
                key={i}
                className={card.bg === 'lime' ? 'card-green' : 'card-dark'}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}
              >
                <img src={card.img} alt={card.title} style={{ borderRadius: 16, width: '100%', height: 260, objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>{card.title}</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, opacity: 0.85 }}>{card.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn btn-primary" onClick={handlePay}>
              Start Your Journey
            </button>
          </div>
        </div>
      </section>


      {}
      <section style={{ background: 'var(--green-dark)', color: 'white', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            <Counter end={50000} suffix="+" />  Placements in Fortune 500 Companies
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, marginTop: 40 }}>
            {placementCompanies.map((co, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 16px' }}>
                <p style={{ fontSize: 28, fontWeight: 800 }}>{co.count}</p>
                <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Placements at {co.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Our <span className="serif-accent" style={{ fontSize: '2.4rem' }}>R.E.A.L.</span> Pedagogy
            </h2>
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
              Built to collapse the distance between classroom concepts and boardroom decisions. Every insight is pressure-tested through real-world simulations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { letter: 'R', title: 'Real Experiences', desc: 'Closed-door CXO strategy sessions, industry roundtables and boardroom immersions' },
              { letter: 'E', title: 'Exposure', desc: 'Global to grassroot immersions — Singapore, IIM Visakhapatnam, and Explore India Mission' },
              { letter: 'A', title: 'Application', desc: 'Harvard-style case simulations, DCF models, deal-maker competitions and peer debates' },
              { letter: 'L', title: 'Learning', desc: 'Master foundations with Ivy-league trained professors, IIM stalwarts and finance scholars' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', width: 56, height: 56, lineHeight: '56px', borderRadius: 14, background: 'var(--lime-bg)', color: 'var(--green-dark)', fontSize: 24, fontWeight: 800 }}>
                  {item.letter}
                </span>
                <h4 style={{ marginTop: 16, fontWeight: 700, fontSize: 16 }}>{item.title}</h4>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 40 }}>
            Real Experiences via <span className="serif-accent">Global to Grassroot</span> Immersions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                title: 'Singapore Immersion',
                points: ['Field trips to a Trade Port, Big 4 office & a Fintech Startup', 'Cultural Immersion at Universal Studios, Sentosa Island', 'Learn Global Markets & Trade Regulations'],
                color: 'var(--lime-bg)',
              },
              {
                title: 'IIM Visakhapatnam',
                points: ['20+ hours of intensive academic sessions by senior IIM professors', 'Visit logistics parks, SEZs, and industrial hubs', 'Learn Capital Budgeting, Risk-Return & M&A'],
                color: 'var(--green-dark)',
                dark: true,
              },
              {
                title: 'Explore India Mission',
                points: ['Work with an NGO & study grassroot finance ecosystems', 'Combine finance, social impact & strategy', 'Propose sustainable solutions to real-world problems'],
                color: 'var(--lime-bg)',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.color,
                  color: item.dark ? 'white' : 'var(--text-dark)',
                  borderRadius: 20,
                  padding: '36px 28px',
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{item.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {item.points.map((p, j) => (
                    <li key={j} style={{ fontSize: 14, lineHeight: 1.6, display: 'flex', gap: 8 }}>
                      <span style={{ flexShrink: 0, marginTop: 3 }}>✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      {}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.2 }}>
                Learning at the ISFB Campus, <span className="serif-accent">Mumbai</span>
              </h2>
              <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Your journey begins at our Powai campus — in the heart of India's financial capital, surrounded by global corporates, banks, and fintechs. Here, classroom theory collides with the real world every day.
              </p>
              <p style={{ marginTop: 12, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                You'll learn from IIM professors, Ivy-league trained academics, Fortune 500 leaders, and fintech innovators, while living a campus life that blends community, culture, and competition.
              </p>
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={handlePay}>
                Start Your Journey
              </button>
            </div>
            <img src={mumbaiImg} alt="Mumbai Campus" style={{ borderRadius: 20, width: '100%', height: 360, objectFit: 'cover' }} />
          </div>
        </div>
      </section>


      {}
      <section className="section" id="syllabus" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 12 }}>
            Roles our alumni own <span className="serif-accent">today,</span> and you could tomorrow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 36 }}>
            After graduating from ISFB, you join a network of 50,000+ alumni at Fortune 500 companies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {roles.map((role, i) => (
              <div key={i} className="card">
                <h4 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-dark)' }}>{role.title}</h4>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-dark)' }}>{role.salary}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average CTC</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-dark)' }}>{role.jobs}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Job Postings</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button className="btn btn-primary" onClick={handlePay}>Start Your Journey</button>
          </div>
        </div>
      </section>


      {}
      <section style={{ background: 'white', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
            {[
              { num: 50000, suffix: '+', label: 'Alumni hired by Fortune 500' },
              { num: 4000, suffix: '+', label: 'Alumni at the Big 4' },
              { num: 1000, suffix: '+', label: 'Companies hire from us yearly' },
              { num: 75000, suffix: '+', label: 'Alumni network strength' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 24 }}>
                <p className="stat-number"><Counter end={s.num} suffix={s.suffix} /></p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {}
      <section className="section" style={{ background: 'var(--green-dark)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 40 }}>What our students say</h2>

          <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', minHeight: 180 }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  position: i === activeTestimonial ? 'relative' : 'absolute',
                  top: 0, left: 0, right: 0,
                  opacity: i === activeTestimonial ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  pointerEvents: i === activeTestimonial ? 'auto' : 'none',
                }}
              >
                <p style={{ fontSize: 18, lineHeight: 1.8, fontStyle: 'italic', opacity: 0.9 }}>
                  "{t.text}"
                </p>
                <p style={{ marginTop: 20, fontWeight: 700, fontSize: 15 }}>— {t.name}</p>
              </div>
            ))}
          </div>

          {}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{
                  width: i === activeTestimonial ? 28 : 10,
                  height: 10,
                  borderRadius: 5,
                  border: 'none',
                  background: i === activeTestimonial ? 'var(--green-light)' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </section>


      {}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #1a4731, #0d6b56)', borderRadius: 24, padding: '56px 48px', color: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(180,211,109,0.2)', color: 'var(--green-light)' }}>Entrepreneurship</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 16, lineHeight: 1.2 }}>
                  Powered by BlinC Invest's ₹25 Cr Finance Venture Fund
                </h2>
                <p style={{ marginTop: 16, fontSize: 15, opacity: 0.85, lineHeight: 1.7 }}>
                  At ISFB we don't just talk about entrepreneurship. We invest in it. In partnership with Blinc Invest, we've pledged a ₹25 Crore fund to back ventures built by our students.
                </p>
                <button className="btn" style={{ marginTop: 24, background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 700 }} onClick={handlePay}>
                  Start Your Journey
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { title: 'Venture Fund', desc: 'India\'s largest fund within a UG program' },
                  { title: 'Startup Studio', desc: 'Year-round venture lab with 1:1 guidance' },
                  { title: 'Curriculum', desc: 'Cap tables, unit economics & term sheets' },
                  { title: 'Co-Founders', desc: 'Find co-founders across campus' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 16px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</h4>
                    <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 32, textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  background: 'white',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                  boxShadow: openFaq === i ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--text-dark)',
                    textAlign: 'left',
                  }}
                >
                  {faq.q}
                  <span style={{ fontSize: 20, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 16 }}>+</span>
                </button>
                <div style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}>
                  <p style={{ padding: '0 24px 18px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {}
      <section style={{ background: 'linear-gradient(135deg, #1a4731, #0d6b56)', padding: '64px 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, maxWidth: 600, margin: '0 auto', lineHeight: 1.3 }}>
            Ready to become <span className="serif-accent" style={{ color: 'var(--green-light)' }}>Real-World Ready?</span>
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, opacity: 0.8, maxWidth: 500, margin: '12px auto 0' }}>
            Download the full curriculum and see exactly what you'll master, semester by semester.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" style={{ background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 700 }} onClick={handlePay}>
              Apply Now · ₹{course?.price || 500}
            </button>
            <a href="#syllabus" className="btn" style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white', background: 'transparent' }}>
              Download Curriculum
            </a>
          </div>
        </div>
      </section>

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
  transition: 'border 0.2s',
};
