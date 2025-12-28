import { useState, useEffect } from 'react';
import Hero from '../components/sections/Hero';
import CoreTeam from '../components/sections/CoreTeam';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground';
import LottieIntro from '../components/common/LottieIntro2';
import CalendarButton from '../components/common/CalendarButton';
import DevelopersModal from '../components/common/DevelopersModal';

const HomePage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [showDevelopersModal, setShowDevelopersModal] = useState(false);

  useEffect(() => {
    if (!showIntro) {
      setAnimationsReady(true);
    }
  }, [showIntro]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
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

  const handleEasterEggTrigger = () => {
    setShowDevelopersModal(true);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ 
        opacity: showIntro ? 0 : 1,
        visibility: showIntro ? 'hidden' : 'visible',
        transition: 'none'
      }}>
        <PageBackground animationsReady={animationsReady} />
        
        <div>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <Navbar 
            animationsReady={animationsReady}
            onEasterEggTrigger={handleEasterEggTrigger}
          />
          <main id="main-content">
            <Hero animationsReady={animationsReady} />
            <CoreTeam />
          </main>
          <Footer />
        </div>

        <CalendarButton animationsReady={animationsReady} />
      </div>

      {showIntro && <LottieIntro onComplete={handleIntroComplete} />}
      
      <DevelopersModal 
        isOpen={showDevelopersModal} 
        onClose={() => setShowDevelopersModal(false)} 
      />
    </div>
  );
};

export default HomePage;
