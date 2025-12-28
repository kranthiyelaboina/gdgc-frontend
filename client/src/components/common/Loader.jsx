import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading.json';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lottieRef = useRef();

  useEffect(() => {
    setIsReady(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(3);
    }
  }, [isReady]);

  const sizes = {
    small: isMobile ? '98vw' : 500,
    medium: isMobile ? '98vw' : 800,
    large: isMobile ? '98vw' : 1100,
  };

  const lottieSize = sizes[size];

  const containerStyle = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        paddingTop: isMobile ? '30vh' : '12vh',
        overflow: 'hidden',
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      };

  if (!isReady) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: isMobile ? lottieSize : '100%',
          maxWidth: isMobile ? lottieSize : lottieSize,
          height: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
