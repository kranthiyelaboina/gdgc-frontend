import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineInstagram } from 'react-icons/ai';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../assets';
import { getStudyJamsVisibility } from '../../services/siteSettingsService';

const Navbar = ({ animationsReady = true, onEasterEggTrigger, onSecretAdminClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyJamsVisible, setStudyJamsVisible] = useState(null); // null = loading, true/false = loaded
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const clickCount = useRef(0);
  const clickTimeout = useRef(null);

  // Fetch Study Jams visibility on mount
  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const visibility = await getStudyJamsVisibility();
        setStudyJamsVisible(visibility);
      } catch (error) {
        console.error('Error fetching Study Jams visibility:', error);
        // Default to visible on error
        setStudyJamsVisible(true);
      } finally {
        setVisibilityLoaded(true);
      }
    };
    fetchVisibility();
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = 100;
          const progress = Math.min(scrollY / maxScroll, 1);
          
          setScrollProgress(progress);
          setScrolled(scrollY > 10);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allNavLinks = [
    { name: 'Events', path: '/events' },
    { name: 'Quiz', path: '/quiz' },
    { name: 'Study Jams', path: '/studyjams' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Contact', path: '/contact' },
  ];

  // Filter out Study Jams if visibility is false or still loading
  const navLinks = allNavLinks.filter(link => {
    if (link.name === 'Study Jams') {
      // Only show if explicitly visible (true), hide if false or null (loading)
      return studyJamsVisible === true;
    }
    return true;
  });

  const handleNavClick = (link) => {
    if (link.external) {
      window.open(link.path, '_blank', 'noopener,noreferrer');
    }
    setMobileMenuOpen(false);
  };

  const handleQuizClick = (e) => {
    // Only trigger secret admin access when on quiz page
    if (location.pathname === '/quiz' && onSecretAdminClick) {
      e.preventDefault();
      onSecretAdminClick();
    }
  };

  const handleInstagramClick = (e) => {
    e.preventDefault();
    window.open('https://www.instagram.com/gdgc.iare/', '_blank', 'noopener,noreferrer');
    setMobileMenuOpen(false);
  };

  const handleJoinUsClick = (e) => {
    e.preventDefault();
    window.open('https://gdg.community.dev/gdg-on-campus-institute-of-aeronautical-engineering-hyderabad-india/', '_blank', 'noopener,noreferrer');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    if (location.pathname !== '/') {
      return;
    }
    
    e.preventDefault();
    clickCount.current += 1;

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }

    if (clickCount.current === 3) {
      clickCount.current = 0;
      if (onEasterEggTrigger) {
        onEasterEggTrigger();
      }
    } else {
      clickTimeout.current = setTimeout(() => {
        clickCount.current = 0;
      }, 800);
    }
  };

  return (
    <>
      <nav
        className={`main-nav ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="main navigation"
        style={{
          '--scroll-progress': scrollProgress,
        }}
      >
        <Link
          to="/"
          className="logo-link"
          aria-label="Home"
          onClick={handleLogoClick}
        >
          <img
            src={Logo}
            alt="GDGC IARE Logo"
            className="logo-img"
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </Link>

        <div className="desktop-nav">
          {navLinks.map((link) => (
            link.external ? (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="nav-link-btn"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#34a853')}
                onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? '#333333' : 'rgba(0, 0, 0, 0.7)')}
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className="nav-link"
                onClick={link.name === 'Quiz' ? handleQuizClick : undefined}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#34a853')}
                onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? '#333333' : 'rgba(0, 0, 0, 0.7)')}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="active-indicator" />
                )}
              </Link>
            )
          ))}
        </div>

        <a
          href="https://www.instagram.com/gdgc.iare?igsh=NTRkdTh5eTQ4M3dl"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-link"
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Instagram Profile"
        >
          <AiOutlineInstagram 
            size={scrolled ? 24 : 28} 
            color="#ea4335"
          />
        </a>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: 'auto',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <HiMenu size={28} color="#333333" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1999,
                backdropFilter: 'blur(2px)',
              }}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '58%',
              height: '100vh',
              maxHeight: '100vh',
              background: 'white',
              zIndex: 2000,
              padding: '80px 30px 30px',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
            className="mobile-menu"
          >
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
            aria-label="Close menu"
          >
            <HiX size={32} color="#333333" />
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              flex: '0 1 auto',
              overflowY: 'auto',
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#333333',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseDown={(e) => e.currentTarget.style.color = '#4285f4'}
              onMouseUp={(e) => e.currentTarget.style.color = '#333333'}
            >
              Home
            </Link>
            {navLinks.map((link, index) => (
              link.external ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#333333',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(e) => {
                    if (link.name === 'Quiz') handleQuizClick(e);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#333333',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseDown={(e) => e.currentTarget.style.color = '#4285f4'}
                  onMouseUp={(e) => e.currentTarget.style.color = '#333333'}
                >
                  {link.name}
                </Link>
              )
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '280px',
              paddingTop: '20px',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
              flexShrink: 0,
              borderTop: '1px solid #e5e5e5',
            }}
          >
            <button
              onClick={handleJoinUsClick}
              style={{
                flex: '0 0 80%',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(66, 133, 244, 0.3)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.3)';
              }}
            >
              Join Us
            </button>
            <button
              onClick={handleInstagramClick}
              style={{
                flex: '0 0 calc(20% - 12px)',
                background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(225, 48, 108, 0.3)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(225, 48, 108, 0.3)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(225, 48, 108, 0.3)';
              }}
              aria-label="Instagram"
            >
              <AiOutlineInstagram size={24} color="white" />
            </button>
          </motion.div>
        </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .main-nav {
          position: fixed;
          top: calc(20px - (4px * var(--scroll-progress, 0)));
          left: 50%;
          z-index: 10000;
          max-width: calc(920px - (100px * var(--scroll-progress, 0)));
          width: calc(100% - 40px - (20px * var(--scroll-progress, 0)));
          background: rgba(255, 255, 255, calc(0.95 * var(--scroll-progress, 0)));
          backdrop-filter: blur(calc(12px * var(--scroll-progress, 0)));
          box-shadow: 0 4px calc(24px * var(--scroll-progress, 0)) rgba(0, 0, 0, calc(0.1 * var(--scroll-progress, 0)));
          border: 1px solid rgba(255, 255, 255, calc(0.3 * var(--scroll-progress, 0)));
          border-radius: 50px;
          padding: calc(12px - (2px * var(--scroll-progress, 0))) calc(40px - (4px * var(--scroll-progress, 0)));
          height: calc(64px - (6px * var(--scroll-progress, 0)));
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translateX(-50%) scale(calc(1 - (0.02 * var(--scroll-progress, 0))));
          transform-origin: top center;
          will-change: transform;
          transition: none;
          animation: ${animationsReady ? 'navFadeIn 0.8s ease-out' : 'none'};
          opacity: ${animationsReady ? 1 : 0};
        }
        
        @keyframes navFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .logo-link {
          display: flex;
          align-items: center;
          position: absolute;
          left: calc(40px - (4px * var(--scroll-progress, 0)));
          will-change: transform;
          transform: scale(calc(1 - (0.1 * var(--scroll-progress, 0))));
          transition: none;
        }

        .logo-img {
          height: 80px;
          width: auto;
          max-width: 220px;
          display: block;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          transform: translateZ(0);
          will-change: transform;
          transition: transform 0.3s ease;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0;
          position: absolute;
          left: 50%;
          will-change: transform;
          transform: translateX(-50%) scale(calc(1 - (0.04 * var(--scroll-progress, 0))));
          transition: none;
        }

        .nav-link,
        .nav-link-btn {
          margin: 0 calc(24px - (4px * var(--scroll-progress, 0)));
          font-size: 16px;
          font-weight: 600;
          color: rgba(0, 0, 0, calc(0.7 + (0.15 * var(--scroll-progress, 0))));
          text-decoration: none;
          cursor: pointer;
          position: relative;
          background: none;
          border: none;
          text-shadow: 0 1px 2px rgba(255, 255, 255, calc(0.3 - (0.3 * var(--scroll-progress, 0))));
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          will-change: color, margin;
          transition: color 0.15s ease;
          white-space: nowrap;
        }

        .active-indicator {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #f9ab00;
          border-radius: 2px;
        }

        .instagram-link {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          right: calc(40px - (4px * var(--scroll-progress, 0)));
          will-change: transform;
          transform: scale(calc(1 - (0.1 * var(--scroll-progress, 0))));
          transition: transform 0.3s ease;
        }

        .instagram-link svg {
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          transform: translateZ(0);
        }

        @media (max-width: 768px) {
          .main-nav {
            padding: 16px 20px !important;
            width: calc(100% - 40px) !important;
            height: 72px !important;
            top: 16px !important;
            z-index: 1998 !important;
          }
          
          .logo-link {
            position: static !important;
            left: auto !important;
            transform: none !important;
          }
          
          .logo-img {
            height: 75px !important;
            max-width: 230px !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .instagram-link {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
          }

          .mobile-menu {
            width: 58% !important;
            min-width: 280px !important;
            padding: 80px 30px max(30px, env(safe-area-inset-bottom)) !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-menu {
            width: 63% !important;
            min-width: 260px !important;
            padding: 80px 24px max(24px, env(safe-area-inset-bottom)) !important;
          }
        }

        @media (max-height: 700px) {
          .mobile-menu {
            padding: 70px 30px max(20px, env(safe-area-inset-bottom)) !important;
          }
        }

        @media (max-height: 600px) {
          .mobile-menu {
            padding: 60px 24px max(16px, env(safe-area-inset-bottom)) !important;
          }
          
          .mobile-menu a,
          .mobile-menu button {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
