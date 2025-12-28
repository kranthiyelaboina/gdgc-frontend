import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedTextWithHover = ({ size = 'default' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const texts = ['IARE', "'25"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sizeStyles = {
    default: {
      fontSize: '28px',
      padding: '4px 12px',
      minWidth: '80px',
    },
    large: {
      fontSize: '96px',
      padding: '8px 32px',
      minWidth: '280px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.default;

  return (
    <div
      className="animated-text-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'large' ? '24px' : '8px',
        fontSize: currentSize.fontSize,
        fontWeight: 900,
        letterSpacing: size === 'large' ? '-2px' : '1px',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        style={{
          color: size === 'large' ? '#1a1a1a' : '#ffffff',
          fontFamily: size === 'large' ? 'Poppins, Inter, sans-serif' : 'inherit',
          position: 'relative',
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -5 : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        GDGC
        {isHovered && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4285f4, #34a853, #f9ab00, #ea4335)',
              borderRadius: '2px',
              transformOrigin: 'left',
            }}
          />
        )}
      </motion.span>
      <motion.div
        className="animated-text-pill"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#ffd427',
          borderRadius: size === 'large' ? '24px' : '8px',
          padding: currentSize.padding,
          minWidth: currentSize.minWidth,
          display: 'flex',
          justifyContent: 'center',
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
          rotate: isHovered ? [0, -2, 2, -2, 0] : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            style={{
              color: '#000000',
              fontWeight: 900,
              display: 'block',
              fontFamily: size === 'large' ? 'Poppins, Inter, sans-serif' : 'inherit',
            }}
          >
            {texts[currentIndex]}
          </motion.span>
        </AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: size === 'large' ? '24px' : '8px',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .animated-text-container {
            gap: 14px !important;
            font-size: 52px !important;
          }
          .animated-text-pill {
            min-width: 150px !important;
            padding: 6px 22px !important;
            border-radius: 18px !important;
          }
        }

        @media (max-width: 480px) {
          .animated-text-container {
            gap: 10px !important;
            font-size: 40px !important;
          }
          .animated-text-pill {
            min-width: 120px !important;
            padding: 5px 18px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedTextWithHover;
