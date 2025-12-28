import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const LottieIntro = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/gdgc.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Lottie animation loaded successfully:', data);
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
        setError(error.message);
        setTimeout(() => {
          sessionStorage.setItem('gdgcIntroShown', 'true');
          onComplete();
        }, 1000);
      }
    };

    loadAnimation();
  }, [onComplete]);

  useEffect(() => {
    if (!animationData) return;

    const animationTimer = setTimeout(() => {
      setFadeOut(true);
      sessionStorage.setItem('gdgcIntroShown', 'true');
      
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 2000);

    return () => {
      clearTimeout(animationTimer);
    };
  }, [onComplete, animationData]);

  if (!animationData) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `rgba(255, 255, 255, ${fadeOut ? 0 : 0.95})`,
        backdropFilter: `blur(${fadeOut ? 0 : 10}px)`,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out, background-color 0.8s ease-out, backdrop-filter 0.8s ease-out',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
        }}
      >
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default LottieIntro;
