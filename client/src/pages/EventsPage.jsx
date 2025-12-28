import { useState, useEffect } from 'react';
import { FaGithub, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { LuCalendarDays } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Loader from '../components/common/Loader';
import PageBackground from '../components/common/PageBackground';
import LottieIntro from '../components/common/LottieIntro2';
import api from '../services/api';
import defaultEventImage from '../assets/default.png';

const TAG_COLORS = {
  workshop: { bg: 'rgba(66, 133, 244, 0.15)', text: '#4285F4', glow: 'rgba(66, 133, 244, 0.3)' },
  hackathon: { bg: 'rgba(219, 68, 55, 0.15)', text: '#DB4437', glow: 'rgba(219, 68, 55, 0.3)' },
  meetup: { bg: 'rgba(244, 180, 0, 0.15)', text: '#F4B400', glow: 'rgba(244, 180, 0, 0.3)' },
  upcoming: { bg: 'rgba(52, 168, 83, 0.15)', text: '#34A853', glow: 'rgba(52, 168, 83, 0.3)' },
  past: { bg: 'rgba(95, 99, 104, 0.1)', text: '#5f6368', glow: 'rgba(95, 99, 104, 0.2)' },
  default: { bg: 'rgba(15, 157, 88, 0.15)', text: '#0F9D58', glow: 'rgba(15, 157, 88, 0.3)' },
};

const EventCard = ({ event, index }) => {
  const [showImagePopup, setShowImagePopup] = useState(false);
  const hasLink = event.referenceUrl && event.referenceUrl.trim() !== '';
  const CardComponent = hasLink ? motion.a : motion.div;
  const linkProps = hasLink ? { href: event.referenceUrl, target: '_blank', rel: 'noopener noreferrer' } : {};
  const eventTypeColor = TAG_COLORS[event.eventType?.toLowerCase()] || TAG_COLORS.default;
  const statusColor = TAG_COLORS[event.status?.toLowerCase()] || TAG_COLORS.default;

  const processImageUrl = (url) => {
    if (!url || url === 'default') return defaultEventImage;
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
    }
    return url;
  };

  const processedImageUrl = processImageUrl(event.imageUrl);

  useEffect(() => {
    if (showImagePopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showImagePopup]);

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowImagePopup(true);
  };

  const handleClosePopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowImagePopup(false);
  };

  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowImagePopup(false);
  };
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  const styles = {
    card: {
      position: 'relative',
      background: 'linear-gradient(90deg, rgba(66, 133, 244, 0.12) 0%, rgba(52, 168, 83, 0.12) 25%, rgba(249, 171, 0, 0.12) 50%, rgba(234, 67, 53, 0.12) 75%, rgba(66, 133, 244, 0.12) 100%)',
      backgroundSize: '300% 100%',
      animation: 'shimmer 4s linear infinite',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      textDecoration: 'none',
      color: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: 'auto',
      padding: '24px',
      boxShadow: '0 10px 25px rgba(66, 133, 244, 0.25)',
      transition: 'all 0.3s ease',
      cursor: hasLink ? 'pointer' : 'default',
      overflow: 'hidden',
    },
    header: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      marginBottom: '8px',
    },
    title: { 
      fontSize: '23px', 
      fontWeight: 700, 
      color: '#374151', 
      margin: '0 0 8px 0', 
      paddingRight: '16px',
    },
    headerTags: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      flexShrink: 0,
    },
    githubIconWrapper: { 
      width: '40px', 
      height: '40px', 
      borderRadius: '50%', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      transition: 'all 0.2s ease',
    },
    description: { 
      fontSize: '15px', 
      color: '#6b7280', 
      lineHeight: 1.6, 
      margin: '0 0 16px 0',
    },
    imageWrapper: { 
      width: '100%',
      marginTop: '16px',
      position: 'relative',
      paddingBottom: '100%', /* Forces 1:1 aspect ratio - more cross-browser compatible than aspectRatio */
      overflow: 'hidden',
      borderRadius: '16px',
    },
    image: { 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%', 
      height: '100%', 
      objectFit: 'cover', 
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s ease',
    },
    viewImageButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      color: '#4285F4',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'all 0.2s ease',
      zIndex: 10,
    },
    footer: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      gap: '16px', 
      marginTop: '16px',
    },
    dateContainer: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      color: '#6b7280', 
      fontSize: '14px',
      fontWeight: 500,
    },
    tag: (colors) => ({ 
      backgroundColor: colors.bg, 
      color: colors.text, 
      padding: '6px 14px', 
      borderRadius: '20px', 
      fontSize: '13px', 
      fontWeight: '600', 
      textTransform: 'capitalize', 
      whiteSpace: 'nowrap',
    }),
  };

  return (
    <>
      <CardComponent 
        {...linkProps}
        style={styles.card}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          y: -8,
          boxShadow: '0 20px 50px -10px rgba(66, 133, 244, 0.4), 0 0 40px rgba(52, 168, 83, 0.3)',
          transition: { duration: 0.3 }
        }}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>{event.eventName}</h3>
          <div style={styles.headerTags}>
            <div style={styles.tag(statusColor)}>{event.status}</div>
            {hasLink && (<div style={styles.githubIconWrapper}><FaGithub size={20} color="#6b7280" /></div>)}
          </div>
        </div>
        
        <p style={styles.description}>{event.description}</p>
        
        <div style={styles.imageWrapper}>
          <img
            src={processedImageUrl}
            alt={event.eventName}
            style={{ ...styles.image, cursor: 'pointer' }}
            onClick={handleImageClick}
          />
        </div>
        
        <div style={styles.footer}>
          <div style={styles.dateContainer}>
            <LuCalendarDays size={16} />
            <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={styles.tag(eventTypeColor)}>{event.eventType}</div>
        </div>
      </CardComponent>

      <AnimatePresence>
        {showImagePopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={processedImageUrl}
                    alt={event.eventName}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      width: 'auto',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                  />
                  <button
                    onClick={handleClosePopup}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.2s ease',
                      zIndex: 10001,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.background = '#DB4437';
                      const svg = e.currentTarget.querySelector('svg');
                      if (svg) svg.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                      const svg = e.currentTarget.querySelector('svg');
                      if (svg) svg.style.color = '#333333';
                    }}
                  >
                    <FaTimes size={20} color="#333333" style={{ transition: 'color 0.2s ease' }} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const ErrorDisplay = ({ message }) => {
    const styles = {
        errorContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: 'rgba(255, 235, 238, 0.8)',
            borderRadius: '24px',
            border: '1px solid #f5c6cb',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '40px auto',
        },
        errorIcon: {
            color: '#DB4437',
            fontSize: '48px',
            marginBottom: '16px',
        },
        errorTitle: {
            color: '#DB4437',
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 8px 0',
        },
        errorMessage: {
            color: '#5f6368',
            fontSize: '16px',
            margin: 0,
        }
    };

    return (
        <div style={styles.errorContainer}>
            <FaExclamationTriangle style={styles.errorIcon} />
            <h2 style={styles.errorTitle}>Oops! Something went wrong.</h2>
            <p style={styles.errorMessage}>{message}</p>
        </div>
    );
};
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [showIntro, setShowIntro] = useState(() => sessionStorage.getItem('gdgcIntroShown') !== 'true');
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    if (!showIntro) {
      setAnimationsReady(true);
    }
  }, [showIntro]);

  useEffect(() => {
    document.body.style.overflow = showIntro ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => {
      setAnimationsReady(true);
    }, 50);
  };

  useEffect(() => {
    const fetchEvents = async (retryCount = 0) => {
      const maxRetries = 2;
      setLoading(true);
      setError(null);
      try {
        console.log(`🔍 Fetching events from backend... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
        const response = await api.get('/events/');
        const data = response.data;
        
        console.log('✅ Events fetched successfully:', data.length, 'events');
        
        const now = new Date();
        const upcomingEvents = data.filter(event => new Date(event.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
        const pastEvents = data.filter(event => new Date(event.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedEvents = [...upcomingEvents, ...pastEvents];
        
        setEvents(sortedEvents);
        setLoading(false);
      } catch (err) {
        console.error(`❌ Failed to fetch events (Attempt ${retryCount + 1}):`, err);
        
        // Retry on timeout or network errors
        if (retryCount < maxRetries && (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('Network Error'))) {
          console.log(`⏳ Retrying in ${(retryCount + 1) * 2} seconds...`);
          setTimeout(() => fetchEvents(retryCount + 1), (retryCount + 1) * 2000);
          return;
        }
        
        console.error("Error details:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || "We couldn't load the events right now. Please check your connection and try again later.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventTags = [...new Set(events.map(event => event.eventType))];

  const styles = {
    main: { padding: '100px 120px 80px 120px', minHeight: '100vh', position: 'relative', overflow: 'hidden' },
    contentWrapper: { position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '60px' },
    mainTitle: { fontSize: '52px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px' },
    gradientText: { background: 'linear-gradient(45deg, #4285F4, #34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    tagsContainer: { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' },
    tag: (colors) => ({ backgroundColor: colors.bg, color: colors.text, padding: '6px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: '500', textTransform: 'capitalize', cursor: 'default' }),
    subtitle: { marginTop: '16px', fontSize: '18px', color: '#5f6368', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 },
    gridContainer: { position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' },
    eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '40px' }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ opacity: showIntro ? 0 : 1, visibility: showIntro ? 'hidden' : 'visible', transition: 'opacity 0.4s ease-in-out' }}>
        <Navbar />
        <main style={styles.main}>
          <PageBackground animationsReady={animationsReady} />
          
          <motion.div 
            style={styles.contentWrapper}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 style={styles.mainTitle}>
              <span style={styles.gradientText}>Events</span>
            </h1>
            {!loading && !error && (
              <motion.div 
                style={styles.tagsContainer}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {eventTags.map(tag => {
                  const tagColor = TAG_COLORS[tag.toLowerCase()] || TAG_COLORS.default;
                  return <span key={tag} style={styles.tag(tagColor)}>{tag}</span>;
                })}
              </motion.div>
            )}
          </motion.div>
          
          <div style={styles.gridContainer}>
            {loading ? (
              <Loader />
            ) : error ? (

              <ErrorDisplay message={error} />
            ) : (
              <section>
                <div style={styles.eventsGrid}>
                  {events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />
        <style>{`
          @keyframes shimmer {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 200% 50%;
            }
          }

          @media (max-width: 1200px) {
            main { padding: 80px 40px 60px 40px !important; }
          }
          @media (max-width: 768px) {
            main { padding: 80px 20px 60px 20px !important; }
            h1 { font-size: 40px !important; }
            div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          }

          @media (max-width: 480px) {
            button[style*="position: absolute"][style*="top: 16px"] {
              top: 12px !important;
              right: 12px !important;
              width: 36px !important;
              height: 36px !important;
            }
          }
        `}</style>
      </div>
      {showIntro && <LottieIntro onComplete={handleIntroComplete} />}
    </div>
  );
};

export default EventsPage;