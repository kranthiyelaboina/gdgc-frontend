import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChromaGrid from './ChromaGrid';
import PageBackground from './PageBackground';
import { AiOutlineClose } from 'react-icons/ai';
import safwanImg from '../../assets/coreteam/safwan.png';
import kranthiImg from '../../assets/coreteam/kranthi.jpg';
import akshithImg from '../../assets/coreteam/akshith.jpg';
import azaruddinImg from '../../assets/coreteam/Azaruddin.png';

const DevelopersModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const developers = [
    {
      image: safwanImg,
      title: 'Safwan',
      subtitle: 'UI/UX Designer',
      handle: '@safwanishere',
      borderColor: '#4285F4',
      gradient: 'linear-gradient(145deg, #4285F4, #000)',
      url: 'https://github.com/safwanishere',
      imageScale: 1.3
    },
    {
      image: kranthiImg,
      title: 'Kranthi',
      subtitle: 'Full-Stack Dev',
      handle: '@kranthiyelaboina',
      borderColor: '#34A853',
      gradient: 'linear-gradient(210deg, #34A853, #000)',
      url: 'https://github.com/kranthiyelaboina'
    },
    {
      image: akshithImg,
      title: 'Akshith',
      subtitle: 'Backend Dev',
      handle: '@akshtih',
      borderColor: '#FBBC05',
      gradient: 'linear-gradient(165deg, #FBBC05, #000)',
      url: 'https://github.com/akshtih'
    },
    {
      image: azaruddinImg,
      title: 'Azaruddin',
      subtitle: 'Frontend Dev',
      handle: '@mohammadazaruddinshaik',
      borderColor: '#EA4335',
      gradient: 'linear-gradient(195deg, #EA4335, #000)',
      url: 'https://github.com/mohammadazaruddinshaik',
      imageScale: 1.4
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
          }}
          onClick={onClose}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0
          }}>
            <PageBackground animationsReady={true} />
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1400px',
              maxHeight: '90vh',
              borderRadius: '24px',
              padding: '40px',
              overflow: 'auto',
              zIndex: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                color: 'black',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <AiOutlineClose size={24} />
            </button>

            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #4285F4 0%, #34A853 25%, #FBBC05 50%, #EA4335 75%, #4285F4 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '0 0 10px 0',
                  animation: 'flowGradient 6s ease-in-out infinite'
                }}
              >
                Site Developers
              </h2>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  color: '#4a5568',
                  margin: 0
                }}
              >
                Meet the team behind GDGC IARE's digital presence
              </p>
            </div>

            <div style={{ minHeight: '400px' }}>
              <ChromaGrid 
                items={developers} 
                radius={250}
                damping={0.5}
                fadeOut={0.7}
              />
            </div>
          </motion.div>

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

            @media (max-width: 768px) {
              .chroma-grid-container {
                padding: 20px !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DevelopersModal;
