import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiPlayCircle, FiArrowLeft } from 'react-icons/fi';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {

    api.get(`/courses/${id}`)
      .then(res => setCourse(res.data))
      .catch(err => {
        console.error(err);
        navigate('/dashboard');
      });


    api.get('/courses/enrolled')
      .then(res => {
        const enr = res.data.find(e => e.course._id === id);
        if (enr) {
          setEnrollment(enr);

          if (course && course.syllabus) {
            const firstUncompleted = course.syllabus.findIndex(m => !enr.completedModules.includes(m.title));
            if (firstUncompleted !== -1) setActiveVideoIndex(firstUncompleted);
          }
        } else {

          navigate(`/course/${id}`);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate, course?.syllabus?.length]);

  const markAsComplete = () => {
    if (!course || !enrollment) return;
    const currentModule = course.syllabus[activeVideoIndex];
    if (!enrollment.completedModules.includes(currentModule.title)) {
      api.put(`/courses/${id}/progress`, { moduleTitle: currentModule.title })
        .then(res => {
          setEnrollment(res.data);
          if (activeVideoIndex < course.syllabus.length - 1) {
            setActiveVideoIndex(activeVideoIndex + 1);
          }
        });
    } else {
      if (activeVideoIndex < course.syllabus.length - 1) {
        setActiveVideoIndex(activeVideoIndex + 1);
      }
    }
  };

  const handleSummarize = async () => {
    if (!currentModule?.documentText) return;
    setSummarizing(true);
    setSummary('');
    setSummaryError('');
    try {
      const res = await api.post('/ai/summarize', {
        text: currentModule.documentText,
        type: 'bullets'
      });
      setSummary(res.data.summary);
    } catch (err) {
      setSummaryError('Failed to generate summary.');
    }
    setSummarizing(false);
  };

  useEffect(() => {
    setSummary('');
    setSummaryError('');
  }, [activeVideoIndex]);

  const handleVideoEnded = () => {
    markAsComplete();
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  if (loading || !course) return <div className="d-flex justify-content-center p-5">Loading player...</div>;

  const currentModule = course.syllabus[activeVideoIndex];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>


        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ border: 'none', background: 'transparent', color: '#0d6efd', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div style={{ borderLeft: '2px solid #dee2e6', height: 24, margin: '0 16px' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#212529' }}>{course.title}</h1>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>


          <div style={{ flex: '1 1 65%', minWidth: 300 }}>
            <div style={{
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              aspectRatio: '16/9'
            }}>
              {currentModule?.videoUrl ? (
                <iframe
                  src={getVideoEmbedUrl(currentModule.videoUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Video not available
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, padding: 24, backgroundColor: 'white', borderRadius: 8, border: '1px solid #dee2e6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ display: 'inline-block', backgroundColor: '#0d6efd', color: 'white', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                    Module {activeVideoIndex + 1}
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px 0', color: '#212529' }}>{currentModule?.title}</h2>
                  <p style={{ fontSize: 16, color: '#495057', margin: 0, lineHeight: 1.6 }}>{currentModule?.content}</p>
                </div>

                <button
                  onClick={markAsComplete}
                  disabled={enrollment?.completedModules?.includes(currentModule?.title)}
                  style={{
                    backgroundColor: enrollment?.completedModules?.includes(currentModule?.title) ? '#e9ecef' : '#198754',
                    color: enrollment?.completedModules?.includes(currentModule?.title) ? '#6c757d' : 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: enrollment?.completedModules?.includes(currentModule?.title) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => { if (!enrollment?.completedModules?.includes(currentModule?.title)) e.currentTarget.style.backgroundColor = '#157347' }}
                  onMouseLeave={e => { if (!enrollment?.completedModules?.includes(currentModule?.title)) e.currentTarget.style.backgroundColor = '#198754' }}
                >
                  <FiCheckCircle size={18} />
                  {enrollment?.completedModules?.includes(currentModule?.title) ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>

            {currentModule?.documentText && (
              <div style={{ marginTop: 24, padding: 24, backgroundColor: 'white', borderRadius: 8, border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1a4731' }}>
                    📖 Reading Material: {currentModule.documentTitle || 'Document'}
                  </h3>
                  <button
                    onClick={handleSummarize}
                    disabled={summarizing}
                    style={{
                      background: 'var(--green-gradient, linear-gradient(90deg, #1a4731, #2d6a4f))',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: summarizing ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: summarizing ? 0.7 : 1,
                      transform: summarizing ? 'none' : 'scale(1)',
                      transition: 'transform 0.1s, box-shadow 0.2s',
                      boxShadow: '0 4px 12px rgba(26,71,49,0.3)'
                    }}
                    onMouseEnter={e => { if(!summarizing) e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { if(!summarizing) e.currentTarget.style.transform = 'none' }}
                  >
                    ✨ {summarizing ? 'Summarizing...' : 'Summarise with AI'}
                  </button>
                </div>
                
                {summary && (
                  <div style={{ marginBottom: 20, padding: 20, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ✨ AI Summary
                    </h4>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, color: '#14532d', lineHeight: 1.6 }}>
                      {summary}
                    </pre>
                  </div>
                )}
                
                {summaryError && <p style={{ color: '#dc2626', fontSize: 14 }}>{summaryError}</p>}

                <div style={{ 
                  maxHeight: 300, 
                  overflowY: 'auto', 
                  padding: 16, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#374151',
                  whiteSpace: 'pre-wrap'
                }}>
                  {currentModule.documentText}
                </div>
              </div>
            )}
          </div>


          <div style={{ flex: '1 1 30%', minWidth: 300 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #dee2e6', overflow: 'hidden' }}>

              <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#212529' }}>Course Content</h3>
                <div style={{ marginTop: 8, backgroundColor: '#e9ecef', borderRadius: 999, height: 6 }}>
                  <div style={{
                    backgroundColor: '#198754',
                    height: 6,
                    borderRadius: 999,
                    width: `${enrollment?.progress || 0}%`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                <p style={{ fontSize: 12, color: '#6c757d', marginTop: 6, marginBottom: 0 }}>
                  {enrollment?.progress || 0}% Completed
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {course.syllabus.map((mod, index) => {
                  const isActive = index === activeVideoIndex;
                  const isCompleted = enrollment?.completedModules?.includes(mod.title);

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveVideoIndex(index)}
                      style={{
                        padding: '16px 20px',
                        border: 'none',
                        borderBottom: index !== course.syllabus.length - 1 ? '1px solid #dee2e6' : 'none',
                        backgroundColor: isActive ? '#e7f1ff' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8f9fa' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <div style={{ marginTop: 2 }}>
                        {isCompleted ? (
                          <FiCheckCircle size={18} color="#198754" />
                        ) : isActive ? (
                          <FiPlayCircle size={18} color="#0d6efd" />
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #adb5bd' }} />
                        )}
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0a58ca' : '#212529',
                          margin: '0 0 4px 0'
                        }}>
                          {index + 1}. {mod.title}
                        </h4>
                        <span style={{ fontSize: 12, color: '#6c757d' }}>{mod.duration}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
