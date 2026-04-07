import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [type, setType] = useState('default');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSummarize() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError('');
      setSummary('');
      const res = await api.post('/ai/summarize', { text, type });
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/dashboard" className="text-sm text-[var(--primary)] font-semibold">← Back to Dashboard</Link>

      <h1 className="text-3xl font-bold text-[var(--dark)] mt-4">AI Summarizer</h1>
      <p className="text-[var(--text-muted)] mt-2">Paste your notes or documents and get a quick summary</p>

      <div className="mt-6 space-y-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your text here..."
          rows={8}
          className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-[var(--cream-light)] outline-none focus:border-[var(--primary)] resize-none"
        />

        <div className="flex gap-3 items-center">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white outline-none"
          >
            <option value="default">Standard Summary</option>
            <option value="bullets">Bullet Points</option>
            <option value="short">Short (2-3 lines)</option>
          </select>

          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition disabled:opacity-50"
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        {summary && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-bold text-[var(--dark)] mb-3">Summary</h3>
            <div className="text-sm text-[var(--text-muted)] leading-7 whitespace-pre-line">{summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
