import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiCheckCircle, FiCpu } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Upload State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    api.get('/courses/enrolled')
      .then(res => setEnrollments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(console.error);
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedCourse) return;
    setUploading(true);
    setUploadMsg('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/courses/${selectedCourse}/module/${selectedModule}/document`, formData);
      setUploadMsg('Document successfully uploaded and attached to the course!');
      setFile(null);
    } catch (err) {
      setUploadMsg('Failed to upload document.');
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-dark)' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>Welcome back, {user?.name}</p>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>

        {}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 16, padding: '24px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBookOpen size={20} color="var(--green-dark)" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enrolled Courses</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: 'var(--text-dark)' }}>{enrollments.length}</p>
        </div>

        {}
        <div style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 16, padding: '24px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCheckCircle size={20} color={user?.hasPaid ? '#16a34a' : '#d97706'} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Payment Status</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: user?.hasPaid ? '#16a34a' : '#d97706' }}>
            {user?.hasPaid ? '✓ Paid' : 'Pending'}
          </p>
        </div>

        {}
        <Link to="/summarizer" style={{
          background: 'var(--green-dark)', color: 'white',
          borderRadius: 16, padding: '24px 20px',
          display: 'block', transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,71,49,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiCpu size={20} color="white" />
            <span style={{ fontSize: 13, color: 'white', opacity: 0.85 }}>AI Tool</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: 'white' }}>Summarizer →</p>
        </Link>
      </div>

      {}
      <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 40, color: 'var(--text-dark)' }}>My Courses</h2>

      {loading && <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading...</p>}

      {!loading && enrollments.length === 0 && (
        <div style={{
          marginTop: 16, background: 'white', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32, textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)' }}>No courses yet.</p>
          <Link to="/" style={{ color: 'var(--green-dark)', fontWeight: 600, fontSize: 14, marginTop: 8, display: 'inline-block' }}>
            Browse courses →
          </Link>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {enrollments.map(enrollment => (
          <Link
            key={enrollment._id}
            to={`/learn/${enrollment.course._id}`}
            style={{
              display: 'block', background: 'white', border: '1px solid var(--border)',
              borderRadius: 16, padding: 20, textDecoration: 'none', color: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-dark)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>{enrollment.course.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {enrollment.course.category} • {enrollment.course.duration}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-dark)' }}>{enrollment.progress}%</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>progress</p>
              </div>
            </div>
            <div style={{ marginTop: 12, background: '#f3f4f6', borderRadius: 999, height: 8 }}>
              <div style={{
                background: 'var(--green-dark)', height: 8, borderRadius: 999,
                width: `${enrollment.progress}%`, transition: 'width 0.3s',
              }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Admin Panel for Uploading PDF */}
      <div style={{ marginTop: 64, padding: 32, background: '#fff', border: '2px solid #1a4731', borderRadius: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a4731', marginBottom: 16 }}>Admin Panel: Upload Course Document</h2>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 24 }}>Upload a PDF document to append it to a specific course module as reading material.</p>
        
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Select Course</label>
            <select 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
          
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Module Index</label>
            <select 
              value={selectedModule} 
              onChange={e => setSelectedModule(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
              disabled={!selectedCourse}
            >
              {courses.find(c => c._id === selectedCourse)?.syllabus.map((m, i) => (
                <option key={i} value={i}>Module {i + 1}: {m.title}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>PDF Document</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '7px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || !selectedCourse || uploading}
            style={{ 
              padding: '10px 24px', borderRadius: 8, border: 'none', 
              background: (!file || !selectedCourse || uploading) ? '#9ca3af' : '#1a4731', 
              color: 'white', fontWeight: 600, cursor: (!file || !selectedCourse || uploading) ? 'default' : 'pointer' 
            }}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
        {uploadMsg && <p style={{ marginTop: 16, color: uploadMsg.includes('failed') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{uploadMsg}</p>}
      </div>

    </div>
  );
}
