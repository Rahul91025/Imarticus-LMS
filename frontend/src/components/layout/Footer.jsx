import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'AI Summarizer', to: '/summarizer' },
  ];

  return (
    <footer style={{
      background: 'var(--green-dark)',
      color: 'white',
      paddingTop: 48,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr',
        gap: 40,
        paddingBottom: 40,
      }}>

        {}
        <div>
          <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Imarticus Learning</p>
          <p style={{ marginTop: 12, fontSize: 13, opacity: 0.65, lineHeight: 1.6, maxWidth: 300 }}>
            India's leading professional education company offering industry-relevant courses in Finance, Analytics, and Technology.
          </p>
        </div>

        {}
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Links</p>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{ display: 'block', fontSize: 14, opacity: 0.75, marginBottom: 10, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.75}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {}
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</p>
          <p style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.7 }}>
            Powai, Mumbai<br />
            Maharashtra, India<br />
            info@imarticus.org
          </p>
        </div>
      </div>

      {}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        opacity: 0.5,
      }}>
        © {year} Imarticus Learning. All rights reserved.
      </div>
    </footer>
  );
}
