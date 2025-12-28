import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground';

const TrueFocus = ({
  sentence = 'COMING SOON',
  manualMode = false,
  blurAmount = 6,
  animationDuration = 0.8,
  pauseBetweenAnimations = 1.5
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      );

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    });
  }, [currentIndex, words.length]);

  const handleMouseEnter = index => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  const currentColor = googleColors[currentIndex % googleColors.length];

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        
        return (
          <span
            key={index}
            ref={el => (wordRefs.current[index] = el)}
            style={{
              position: 'relative',
              fontSize: 'clamp(3rem, 12vw, 8rem)',
              fontWeight: 900,
              cursor: 'pointer',
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
              letterSpacing: '0.02em',
              background: 'linear-gradient(90deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 75%, #4285F4 100%)',
              backgroundSize: '400% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'flowGradient 6s ease-in-out infinite'
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0
        }}
        transition={{
          duration: animationDuration,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          boxSizing: 'border-box'
        }}
      >
        {}
        <span
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            border: '4px solid',
            borderColor: currentColor,
            borderRadius: '4px',
            top: '-16px',
            left: '-16px',
            borderRight: '0',
            borderBottom: '0',
            filter: `drop-shadow(0 0 8px ${currentColor}80)`,
            transition: `border-color ${animationDuration}s ease, filter ${animationDuration}s ease`
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            border: '4px solid',
            borderColor: currentColor,
            borderRadius: '4px',
            top: '-16px',
            right: '-16px',
            borderLeft: '0',
            borderBottom: '0',
            filter: `drop-shadow(0 0 8px ${currentColor}80)`,
            transition: `border-color ${animationDuration}s ease, filter ${animationDuration}s ease`
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            border: '4px solid',
            borderColor: currentColor,
            borderRadius: '4px',
            bottom: '-16px',
            left: '-16px',
            borderRight: '0',
            borderTop: '0',
            filter: `drop-shadow(0 0 8px ${currentColor}80)`,
            transition: `border-color ${animationDuration}s ease, filter ${animationDuration}s ease`
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            border: '4px solid',
            borderColor: currentColor,
            borderRadius: '4px',
            bottom: '-16px',
            right: '-16px',
            borderLeft: '0',
            borderTop: '0',
            filter: `drop-shadow(0 0 8px ${currentColor}80)`,
            transition: `border-color ${animationDuration}s ease, filter ${animationDuration}s ease`
          }}
        />
      </motion.div>
    </div>
  );
};

const LeaderboardPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageBackground animationsReady={true} />
      <Navbar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '140px 40px 80px',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
        zIndex: 1,
        gap: '60px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            textAlign: 'center',
            maxWidth: '700px',
            padding: '0 20px'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: '#202124',
            marginBottom: '16px',
            lineHeight: 1.3
          }}>
            Register Now to be Part of the{' '}
            <span style={{
              background: 'linear-gradient(90deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 75%, #4285F4 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'flowGradient 4s ease-in-out infinite'
            }}>
              GDGC IARE Leaderboard
            </span>!
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: '#5f6368',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Join our community and showcase your skills. Track your progress and compete with fellow developers!
          </p>

          <motion.a
            href="https://forms.gle/kDk9JGogiJ8aH4GF6"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 12px 35px rgba(66, 133, 244, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 40px',
              fontSize: '17px',
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
              border: 'none',
              borderRadius: '50px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(66, 133, 244, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Register Now
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        >
          <TrueFocus 
            sentence="COMING SOON"
            manualMode={false}
            blurAmount={6}
            animationDuration={0.8}
            pauseBetweenAnimations={1.5}
          />
        </motion.div>
      </main>

      <Footer />

      <style>{`
        @keyframes flowGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @media (max-width: 1024px) {
          main {
            padding: 130px 32px 70px !important;
            gap: 50px !important;
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 110px 24px 60px !important;
            gap: 40px !important;
          }
          span[style*="fontSize: 'clamp"] {
            font-size: clamp(2.5rem, 10vw, 6rem) !important;
          }
          div[style*="gap: '2rem'"] {
            gap: 1.5rem !important;
          }
          h2 {
            font-size: clamp(1.5rem, 3.5vw, 2rem) !important;
          }
          p {
            font-size: clamp(0.95rem, 2.2vw, 1.05rem) !important;
          }
          a[style*="padding: '16px 40px'"] {
            padding: 14px 32px !important;
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 100px 20px 50px !important;
            gap: 35px !important;
          }
          span[style*="fontSize: 'clamp"] {
            font-size: clamp(2rem, 10vw, 5rem) !important;
          }
          div[style*="gap: '2rem'"] {
            gap: 1rem !important;
          }
          div[style*="width: '24px'"] {
            width: 20px !important;
            height: 20px !important;
          }
          h2 {
            font-size: clamp(1.3rem, 3vw, 1.8rem) !important;
            margin-bottom: 12px !important;
          }
          p {
            font-size: clamp(0.9rem, 2vw, 1rem) !important;
            margin-bottom: 24px !important;
          }
          a[style*="padding: '16px 40px'"] {
            padding: 12px 28px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;
