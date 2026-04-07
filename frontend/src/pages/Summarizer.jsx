import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiArrowLeft, FiCpu, FiClipboard, FiCheck } from 'react-icons/fi';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [type, setType] = useState('default');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSummarize() {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError('');
      setSummary('');
      let res = await api.post('/ai/summarize', { text, type });
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

      <Link to="/dashboard" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 14, fontWeight: 600, color: 'var(--green-dark)',
      }}>
        <FiArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--lime-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <FiCpu size={22} color="var(--green-dark)" />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-dark)' }}>AI Summarizer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            Paste your notes or documents and get a quick summary
          </p>
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your text here..."
          rows={8}
          style={{
            width: '100%', border: '1px solid var(--border)',
            borderRadius: 14, padding: '14px 18px', fontSize: 14,
            background: '#fafbfc', outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', lineHeight: 1.6,
          }}
        />

        {}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{
              border: '1px solid var(--border)', borderRadius: 10,
              padding: '10px 14px', fontSize: 14, background: 'white',
              outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <option value="default">Standard Summary</option>
            <option value="bullets">Bullet Points</option>
            <option value="short">Short (2-3 lines)</option>
          </select>

          <button
            onClick={handleSummarize}
            disabled={loading || !text.trim()}
            className="btn btn-primary"
            style={{ opacity: (loading || !text.trim()) ? 0.5 : 1, cursor: (loading || !text.trim()) ? 'not-allowed' : 'pointer' }}
          >
            <FiCpu size={16} />
            {loading ? 'Summarizing…' : 'Summarize'}
          </button>
        </div>

        {}
        {error && (
          <p style={{
            fontSize: 13, color: '#dc2626', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 12, padding: 14,
          }}>
            {error}
          </p>
        )}

        {}
        {summary && (
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 16, padding: '24px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-dark)' }}>Summary</h3>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: copied ? '#16a34a' : 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {copied ? <><FiCheck size={14} /> Copied!</> : <><FiClipboard size={14} /> Copy</>}
              </button>
            </div>
            <div style={{
              fontSize: 14, color: 'var(--text-body)', lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}>
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
