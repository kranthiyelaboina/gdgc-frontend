import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LeftBracket, RightBracket } from '../../assets';
import AnimatedText from '../common/AnimatedText';

const Hero = ({ animationsReady = true }) => {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <section
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={LeftBracket}
        alt=""
        role="presentation"
        className="left-bracket"
        style={{
          position: 'absolute',
          left: '8%',
          top: '58%',
          width: 'clamp(80px, 12vw, 180px)',
          height: 'auto',
          zIndex: 2,
          transform: `translateY(calc(-50% + ${parallaxOffset}px))`,
          animation: animationsReady ? 'slideInFromLeft 2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both, floatLeft 6s ease-in-out infinite 2.3s' : 'none',
          filter: 'drop-shadow(0 0 30px rgba(66, 133, 244, 0.3))',
          opacity: 0,
          visibility: animationsReady ? 'visible' : 'hidden',
        }}
      />

      <img
        src={RightBracket}
        alt=""
        role="presentation"
        className="right-bracket"
        style={{
          position: 'absolute',
          right: '8%',
          top: '58%',
          width: 'clamp(80px, 12vw, 180px)',
          height: 'auto',
          zIndex: 2,
          transform: `translateY(calc(-50% + ${parallaxOffset}px))`,
          animation: animationsReady ? 'slideInFromRight 2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both, floatRight 6s ease-in-out infinite 2.3s' : 'none',
          filter: 'drop-shadow(0 0 30px rgba(52, 168, 83, 0.3))',
          opacity: 0,
          visibility: animationsReady ? 'visible' : 'hidden',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            animation: animationsReady ? 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both' : 'none',
            marginBottom: '24px',
            marginTop: '40px',
            opacity: 0,
            visibility: animationsReady ? 'visible' : 'hidden',
          }}
        >
          <AnimatedText size="large" />
        </div>

        <p
          style={{
            maxWidth: '850px',
            fontSize: 'clamp(13px, 2.5vw, 18px)',
            lineHeight: 1.8,
            color: '#444444',
            textAlign: 'center',
            marginBottom: '50px',
            marginTop: '20px',
            animation: animationsReady ? 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both' : 'none',
            opacity: 0,
            visibility: animationsReady ? 'visible' : 'hidden',
          }}
        >
          Google Developer Groups on Campus (GDGC) IARE is a student-driven tech community that empowers developers to learn, build, and innovate through workshops, hackathons, and events. We explore emerging technologies like AI, Web3, Cloud, and Mobile Development, fostering collaboration, creativity, and a vibrant campus tech culture.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <motion.button
            whileTap={{ 
              y: -1,
              transition: { duration: 0.1 }
            }}
            whileHover={{ 
              y: -3,
              transition: { duration: 0.3 }
            }}
            className="hero-btn hero-btn-yellow"
            style={{
              width: '170px',
              height: '50px',
              background: '#FDD835',
              color: '#000000',
              borderRadius: '100px',
              border: '6px solid #E8AB07',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              animation: animationsReady ? 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.9s both' : 'none',
              opacity: 0,
              visibility: animationsReady ? 'visible' : 'hidden',
              boxShadow: '0 6px 20px rgba(232, 171, 7, 0.4)',
              position: 'relative',
              zIndex: 1,
            }}
            onClick={() => navigate('/events')}
          >
            Explore Events
          </motion.button>

          <motion.button
            whileTap={{ 
              y: -1,
              transition: { duration: 0.1 }
            }}
            whileHover={{ 
              y: -3,
              transition: { duration: 0.3 }
            }}
            className="hero-btn hero-btn-white"
            style={{
              width: '170px',
              height: '50px',
              background: '#FFFFFF',
              border: '4px solid #E0E0E0',
              color: '#333333',
              borderRadius: '100px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              animation: animationsReady ? 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 1.1s both' : 'none',
              opacity: 0,
              visibility: animationsReady ? 'visible' : 'hidden',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1,
            }}
            onClick={() => window.open('https://chat.whatsapp.com/CXyC9ia93S39spQ1cX5h9g?mode=ems_wa_t', '_blank')}
          >
            Join Community
          </motion.button>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateY(-50%) translateX(-150%) scale(1.4);
            opacity: 0;
          }
          55% {
            transform: translateY(-50%) translateX(18%) scale(1.4);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateY(-50%) translateX(150%) scale(1.4);
            opacity: 0;
          }
          55% {
            transform: translateY(-50%) translateX(-18%) scale(1.4);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes floatLeft {
          0%, 100% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-50%) translateX(-10px) rotate(-3deg);
          }
        }

        @keyframes floatRight {
          0%, 100% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-50%) translateX(10px) rotate(3deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          border-radius: 100px;
          transition: all 0.5s;
        }

        .hero-btn-yellow::after {
          background: #FDD835;
        }

        .hero-btn-white::after {
          background: white;
        }

        .hero-btn:hover::after {
          transform: scaleX(1.4) scaleY(1.6);
          opacity: 0;
        }

        @media (max-width: 1024px) {
          .left-bracket {
            left: 3% !important;
            width: clamp(100px, 10vw, 140px) !important;
          }
          .right-bracket {
            right: 3% !important;
            width: clamp(100px, 10vw, 140px) !important;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 0 24px !important;
          }
          
          section > div:first-child > div:first-child {
            margin-top: 10px !important;
          }
          
          .left-bracket {
            left: 2% !important;
            top: 48% !important;
            width: clamp(85px, 17vw, 105px) !important;
            opacity: 0.8 !important;
          }
          
          .right-bracket {
            right: 2% !important;
            top: 48% !important;
            width: clamp(85px, 17vw, 105px) !important;
            opacity: 0.8 !important;
          }
          
          section > div:last-child {
            padding: 0 20px !important;
          }
          
          section p {
            font-size: clamp(13px, 2.2vw, 15px) !important;
            line-height: 1.65 !important;
            max-width: 85% !important;
            margin-bottom: 36px !important;
            text-align: center !important;
            padding: 0 16px !important;
          }
          
          section button {
            width: 100% !important;
            max-width: 280px !important;
            height: 52px !important;
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          section {
            padding: 0 20px !important;
          }
          
          section > div:first-child > div:first-child {
            margin-top: 5px !important;
          }
          
          .left-bracket {
            left: 1% !important;
            top: 45% !important;
            width: clamp(75px, 19vw, 90px) !important;
          }
          
          .right-bracket {
            right: 1% !important;
            top: 45% !important;
            width: clamp(75px, 19vw, 90px) !important;
          }
          
          section p {
            font-size: clamp(11px, 2vw, 13px) !important;
            line-height: 1.6 !important;
            max-width: 80% !important;
            padding: 0 12px !important;
          }
          
          section button {
            max-width: 260px !important;
            height: 50px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
