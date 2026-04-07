import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
        <p>© 2025 Imarticus Learning. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-[var(--primary)] transition">Home</Link>
          <Link to="/dashboard" className="hover:text-[var(--primary)] transition">Dashboard</Link>
          <Link to="/summarizer" className="hover:text-[var(--primary)] transition">Summarizer</Link>
        </div>
      </div>
    </footer>
  );
}
