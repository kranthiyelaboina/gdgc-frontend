/**
 * @version 5.0.0-Quantum
 * @author Google Developer Group (Experience Engineering)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  useSpring 
} from 'framer-motion';
import { 
  FaSearch, FaFilter, FaSort, FaUsers, FaTrophy, FaMedal, 
  FaGamepad, FaStar, FaTimes, FaChevronLeft, FaChevronRight, 
  FaRocket, FaCrown, FaBolt, FaCode, FaGoogle, FaGlobeAmericas 
} from 'react-icons/fa';
import { MdRefresh, MdVerified, MdTimer, MdInsights, MdOutlineScience } from 'react-icons/md';
import { RiTeamFill, RiCodeBoxFill, RiVipCrown2Fill, RiDashboard3Line } from 'react-icons/ri';

// --- ORIGINAL IMPORTS (PRESERVED) ---
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground'; 
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';
// Service logic preserved exactly as requested
import { getStudyJamsData, transformApiDataToTeams, calculateProgressPercent } from '../services/studyJamsService';
import logo from '../assets/logo.png'; 

// =================================================================================================
// 1. QUANTUM DESIGN TOKEN SYSTEM
// =================================================================================================

const THEME = {
  colors: {
    bg: '#020203', // Deep Space Void
    surface: '#0A0A0C',
    surfaceHighlight: '#141418',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    glass: 'rgba(20, 20, 25, 0.4)',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.4)',
      accent: '#8AB4F8'
    },
    brand: {
      blue: '#4285F4',
      red: '#EA4335',
      yellow: '#FBBC05',
      green: '#34A853',
      // Neon Variants
      blueNeon: '0 0 20px rgba(66, 133, 244, 0.6)',
      redNeon: '0 0 20px rgba(234, 67, 53, 0.6)',
      yellowNeon: '0 0 20px rgba(251, 188, 5, 0.6)',
      greenNeon: '0 0 20px rgba(52, 168, 83, 0.6)',
    }
  },
  gradients: {
    google: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
    googleFlow: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
    blue: 'linear-gradient(135deg, #4285F4 0%, #1967D2 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    silver: 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)',
    bronze: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    glass: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
    darkGlass: 'linear-gradient(180deg, rgba(10, 10, 12, 0.8) 0%, rgba(2, 2, 3, 0.9) 100%)'
  },
  shadows: {
    card: '0 20px 50px -10px rgba(0,0,0,0.7)',
    glow: '0 0 80px rgba(66, 133, 244, 0.15)',
    inner: 'inset 0 0 20px rgba(255, 255, 255, 0.02)'
  }
};

const ITEMS_PER_PAGE = 5;

// =================================================================================================
// 2. GLOBAL CSS ENGINE (STYLES & ANIMATIONS)
// =================================================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

    :root {
      --g-blue: #4285F4;
      --g-red: #EA4335;
      --g-yellow: #FBBC05;
      --g-green: #34A853;
    }

    body {
      background-color: ${THEME.colors.bg};
      color: ${THEME.colors.text.primary};
      font-family: 'Outfit', sans-serif;
      overflow-x: hidden;
      margin: 0;
    }

    /* --- CUSTOM SCROLLBAR --- */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #020203; }
    ::-webkit-scrollbar-thumb { 
      background: linear-gradient(180deg, var(--g-blue), var(--g-green)); 
      border-radius: 10px; 
    }
    ::-webkit-scrollbar-thumb:hover { background: var(--g-blue); }

    /* --- ANIMATION KEYFRAMES --- */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes pulse-glow {
      0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
      70% { box-shadow: 0 0 0 20px rgba(66, 133, 244, 0); }
      100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
    }

    @keyframes spin-slow {
      100% { transform: rotate(360deg); }
    }

    @keyframes spin-reverse {
      100% { transform: rotate(-360deg); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-150%); }
      100% { transform: translateX(150%); }
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    /* --- UTILITY CLASSES --- */
    .text-gradient {
      background: linear-gradient(135deg, #FFFFFF 0%, #A0A0A0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text-gradient-google {
      background: linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4);
      background-size: 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientFlow 8s ease infinite;
    }

    .text-gradient-gold {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .glass-panel {
      background: rgba(15, 15, 20, 0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .glass-panel:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(20, 20, 25, 0.7);
    }

    .custom-scrollbar { overflow-y: auto; }

    .hover-shimmer { position: relative; overflow: hidden; }
    .hover-shimmer::after {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: translateX(-150%);
      transition: transform 0.5s;
    }
    .hover-shimmer:hover::after {
      transform: translateX(150%);
      transition: transform 0.8s ease-in-out;
    }

    .scanline-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1) 51%);
      background-size: 100% 4px;
      pointer-events: none;
      opacity: 0.3;
      z-index: 1;
    }

    /* --- RESPONSIVE OVERRIDES --- */
    @media (max-width: 1200px) {
      .main-grid { grid-template-columns: 1fr !important; }
      .desktop-details { display: none !important; }
      .hero-section { flex-direction: column !important; text-align: center !important; }
    }
  `}</style>
);

// =================================================================================================
// 3. QUANTUM PHYSICS CANVAS (BACKGROUND)
// =================================================================================================

const QuantumField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let animationFrame;

    // Configuration
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 180;
    const MOUSE_RADIUS = 250;
    
    let mouse = { x: null, y: null };
    const colors = [THEME.colors.brand.blue, THEME.colors.brand.red, THEME.colors.brand.yellow, THEME.colors.brand.green];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 2 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseSize = this.size;
      }
      
      update() {
        // Movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interaction
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < MOUSE_RADIUS) {
             const forceDirectionX = dx / distance;
             const forceDirectionY = dy / distance;
             const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
             const directionX = forceDirectionX * force * this.size;
             const directionY = forceDirectionY * force * this.size;
             
             this.vx -= directionX * 0.03;
             this.vy -= directionY * 0.03;
          }
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
      }
    }

    let particles = [];
    const init = () => {
      particles = [];
      for(let i=0; i<PARTICLE_COUNT; i++) particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        
        // Connect particles
        for (let j = index; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist/CONNECTION_DIST * 0.15})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }} />;
};

// =================================================================================================
// 4. HIGH-FIDELITY VISUAL COMPONENTS
// =================================================================================================

// --- 4.1 3D Holographic Stat Card ---
const QuantumStatCard = ({ icon, label, value, color, delay }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="glass-panel"
        style={{
          borderRadius: 24,
          padding: '28px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          rotateX, rotateY,
          cursor: 'default',
          borderTop: `1px solid ${color}`,
          background: `linear-gradient(180deg, ${color}10 0%, rgba(255,255,255,0.02) 100%)`
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - rect.left - rect.width / 2);
          y.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        whileHover={{ scale: 1.03 }}
      >
        {/* Glow Effect */}
        <div style={{ position: 'absolute', top: -50, left: 0, right: 0, height: 100, background: color, filter: 'blur(60px)', opacity: 0.3 }} />
        
        <div style={{ fontSize: '42px', color: color, marginBottom: '16px', filter: `drop-shadow(0 0 15px ${color})`, position: 'relative', zIndex: 2 }}>
          {icon}
        </div>
        
        <div style={{ fontSize: '44px', fontWeight: 800, color: 'white', lineHeight: 1, fontFamily: 'Space Grotesk', marginBottom: '8px', position: 'relative', zIndex: 2, textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
          {value.toLocaleString()}
        </div>
        
        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, position: 'relative', zIndex: 2 }}>
          {label}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- 4.2 Quantum Button ---
const QuantumButton = ({ children, onClick, active, icon: Icon, variant = 'default', disabled }) => {
  const variants = {
    default: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'white' },
    primary: { bg: THEME.gradients.blue, border: 'transparent', color: 'white' },
    gold: { bg: THEME.gradients.gold, border: 'transparent', color: 'black' }
  };
  const v = variants[variant] || variants.default;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, boxShadow: `0 0 25px ${variant === 'primary' ? THEME.colors.brand.blueGlow : 'rgba(255,255,255,0.1)'}` } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        background: active ? THEME.gradients.google : v.bg,
        border: `1px solid ${v.border}`,
        padding: '14px 28px',
        borderRadius: 14,
        color: v.color,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'Outfit',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}
    >
      {/* Shimmer Overlay */}
      <div className="hover-shimmer" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && <Icon size={16} />}
        {children}
      </div>
    </motion.button>
  );
};

// --- 4.3 High-Fidelity Leaderboard Card (Visual Replacement) ---
const QuantumTeamCard = ({ team, rank, maxPoints, onSelect, isSelected }) => {
  const isTop3 = rank <= 3;
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const rankColor = isTop3 ? medalColors[rank - 1] : 'rgba(255,255,255,0.1)';
  const efficiency = Math.min((team.avgPointsPerMember / maxPoints) * 100, 100);

  return (
    <motion.div
      layout
      onClick={onSelect}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 10, scale: 1.005 }}
      style={{ width: '100%', marginBottom: 16, cursor: 'pointer', position: 'relative' }}
    >
      {/* Active State Glow */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: -2, borderRadius: 22, background: THEME.colors.brand.blue, filter: 'blur(15px)', opacity: 0.4, zIndex: -1 }} 
          />
        )}
      </AnimatePresence>
      
      <div className="glass-panel" style={{ 
        borderRadius: 20, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24,
        border: isSelected ? `1px solid ${THEME.colors.brand.blue}` : '1px solid rgba(255,255,255,0.08)',
        background: isSelected ? 'rgba(66, 133, 244, 0.08)' : 'rgba(255,255,255,0.02)'
      }}>
        {/* Rank Indicator */}
        <div style={{ 
          width: 60, height: 60, borderRadius: 16, 
          background: isTop3 ? `linear-gradient(135deg, ${rankColor}40, rgba(0,0,0,0.5))` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isTop3 ? rankColor : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: isTop3 ? rankColor : 'rgba(255,255,255,0.7)',
          boxShadow: isTop3 ? `0 0 20px ${rankColor}30` : 'none'
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk' }}>{rank}</span>
          {isTop3 && <FaCrown size={12} />}
        </div>

        {/* Team Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.5px' }}>{team.teamName}</h3>
            {isTop3 && (
              <motion.div 
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ background: THEME.colors.brand.blue, fontSize: 9, padding: '3px 8px', borderRadius: 4, fontWeight: 800, letterSpacing: 1 }}
              >
                ELITE
              </motion.div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: THEME.colors.text.secondary }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaUsers size={12} /> {team.memberCount} Agents</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaBolt size={12} color={THEME.colors.brand.yellow} /> {Math.round(team.avgPointsPerMember)} Efficiency</span>
          </div>
        </div>

        {/* Metrics (Desktop) */}
        <div style={{ display: 'none', '@media(min-width:900px)': {display:'flex'}, gap: 40 }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: 20, fontWeight: 700, color: THEME.colors.brand.green }}>{team.totalBadges}</div>
             <div style={{ fontSize: 10, color: THEME.colors.text.muted, letterSpacing: 1, fontWeight: 600 }}>BADGES</div>
          </div>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: 20, fontWeight: 700, color: THEME.colors.brand.red }}>{team.totalArcadeGames}</div>
             <div style={{ fontSize: 10, color: THEME.colors.text.muted, letterSpacing: 1, fontWeight: 600 }}>GAMES</div>
          </div>
        </div>

        {/* Total Points Bar */}
        <div style={{ textAlign: 'right', minWidth: 120, marginLeft: 10 }}>
           <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk', color: 'white', textShadow: `0 0 15px ${THEME.colors.brand.blue}` }}>
             {team.totalPoints.toLocaleString()}
           </div>
           <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
             <motion.div 
               initial={{ width: 0 }} animate={{ width: `${efficiency}%` }} 
               style={{ height: '100%', background: THEME.gradients.google, borderRadius: 2 }} 
             />
           </div>
        </div>
        
        <FaChevronRight color="rgba(255,255,255,0.3)" size={14} />
      </div>
    </motion.div>
  );
};

// --- 4.4 Quantum Details Panel (Visual Replacement) ---
const QuantumDetailsPanel = ({ team, rank }) => {
  if (!team) return null;

  return (
    <div className="glass-panel" style={{ borderRadius: 24, overflow: 'hidden', position: 'sticky', top: 20, boxShadow: THEME.shadows.card }}>
      {/* Decorative Top Bar */}
      <div style={{ height: 4, background: THEME.gradients.google }} />
      
      {/* Header */}
      <div style={{ padding: 32, background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
           <div>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(251, 188, 5, 0.1)', border: '1px solid rgba(251, 188, 5, 0.3)', fontSize: 11, fontWeight: 800, marginBottom: 16, color: THEME.colors.brand.yellow }}>
               <RiVipCrown2Fill /> CURRENT RANK #{rank}
             </div>
             <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>{team.teamName}</h2>
           </div>
           <div style={{ width: 70, height: 70, borderRadius: '50%', background: THEME.gradients.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, boxShadow: '0 0 30px rgba(66, 133, 244, 0.4)', border: '2px solid rgba(255,255,255,0.2)' }}>
             {team.teamName.charAt(0)}
           </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ padding: 24, borderRight: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <FaTrophy size={28} color={THEME.colors.brand.yellow} style={{ marginBottom: 12, filter: 'drop-shadow(0 0 10px rgba(251, 188, 5, 0.4))' }} />
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk' }}>{team.totalPoints.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: THEME.colors.text.muted, letterSpacing: 1.5, fontWeight: 600 }}>TOTAL POINTS</div>
         </div>
         <div style={{ padding: 24, textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <FaBolt size={28} color={THEME.colors.brand.blue} style={{ marginBottom: 12, filter: 'drop-shadow(0 0 10px rgba(66, 133, 244, 0.4))' }} />
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk' }}>{Math.round(team.avgPointsPerMember)}</div>
            <div style={{ fontSize: 11, color: THEME.colors.text.muted, letterSpacing: 1.5, fontWeight: 600 }}>AVG SCORE</div>
         </div>
      </div>

      {/* Members List */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <div style={{ fontSize: 12, fontWeight: 800, color: THEME.colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Squad Roster</div>
           <div style={{ fontSize: 12, color: THEME.colors.text.secondary }}><FaUsers style={{marginRight:6}}/> {team.members.length}</div>
        </div>
        
        <div className="custom-scrollbar" style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 6 }}>
           {team.members.sort((a,b) => b.points - a.points).map((m, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
               style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', marginBottom: 10, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)' }}
             >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.isLead ? THEME.colors.brand.red : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, boxShadow: m.isLead ? '0 0 15px rgba(234, 67, 53, 0.4)' : 'none' }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                     {m.isLead && <span style={{ fontSize: 9, background: THEME.colors.brand.red, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>LEAD</span>}
                   </div>
                   <div style={{ fontSize: 12, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontWeight: 700, color: THEME.colors.brand.blue, fontSize: 16 }}>{m.points}</div>
                   <div style={{ fontSize: 9, opacity: 0.4 }}>PTS</div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

// =================================================================================================
// 5. MAIN PAGE CONTROLLER
// =================================================================================================

const StudyJamsPage = () => {
  // --- STATE MANAGEMENT (Preserved 100%) ---
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [maxPoints, setMaxPoints] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTopPerformers, setShowTopPerformers] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // --- BUSINESS LOGIC (Preserved 100%) ---
  useEffect(() => { fetchTeamsData(); }, []);
  
  useEffect(() => { 
      filterAndSortTeams(); 
      setCurrentPage(1); 
  }, [teams, searchTerm]);

  const fetchTeamsData = async () => {
      setLoading(true);
      try {
          const response = await getStudyJamsData();
          if (!response || !response.data) {
              showToastMessage('No Study Jams data available.', 'info');
              setTeams([]); setMaxPoints(0); setLoading(false); return;
          }
          const transformedTeams = transformApiDataToTeams(response.data);
          if (transformedTeams.length === 0) {
              showToastMessage('No active teams found.', 'info');
              setTeams([]); setMaxPoints(0); setLoading(false); return;
          }
          const maxPts = Math.max(...transformedTeams.map(t => t.avgPointsPerMember || 0), 1);
          setMaxPoints(maxPts);
          const teamsWithProgress = calculateProgressPercent(transformedTeams);
          setTeams(teamsWithProgress);
          setLastUpdated(new Date());
          if (teamsWithProgress.length > 0) setSelectedTeam(teamsWithProgress[0]);
      } catch (error) {
          showToastMessage(error.message || 'Error loading data', 'error');
          setTeams([]);
      } finally {
          setLoading(false);
      }
  };

  const filterAndSortTeams = () => {
      let result = [...teams];
      if (searchTerm) {
          result = result.filter(team => 
              team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              team.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
      }
      result.sort((a, b) => (b.avgPointsPerMember || 0) - (a.avgPointsPerMember || 0));
      setFilteredTeams(result);
  };

  const showToastMessage = (message, type = 'success') => {
      setToastMessage(message); setToastType(type); setShowToast(true);
  };

  const getTopPerformers = () => {
      const allMembers = [];
      teams.forEach(team => {
          team.members.forEach(member => {
              allMembers.push({ ...member, teamName: team.teamName, team: team.team });
          });
      });
      return allMembers.sort((a, b) => b.points - a.points).slice(0, 20);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTeams = filteredTeams.slice(startIndex, endIndex);

  const goToPage = (p) => { 
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // =============================================================================================
  // 6. VISUAL RENDER
  // =============================================================================================

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: THEME.colors.bg }}>
      <GlobalStyles />
      <QuantumField />
      <PageBackground animationsReady={true} />
      
      <div style={{ position: 'relative', zIndex: 50 }}><Navbar /></div>

      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '140px 40px 80px', position: 'relative', zIndex: 10 }}>
        
        {/* --- HERO SECTION --- */}
        <div className="hero-section" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60, marginBottom: 80 }}>
          
          {/* MASSIVE GLOWING REACTOR LOGO (TOP LEFT) - ENHANCED */}
          <motion.div 
            initial={{ scale: 0, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 80, duration: 0.8 }}
            style={{ 
              width: 220, height: 220, borderRadius: 50, 
              background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)', 
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `
                0 0 80px rgba(66, 133, 244, 0.25),
                0 0 120px rgba(66, 133, 244, 0.15),
                0 20px 60px rgba(0, 0, 0, 0.6),
                inset 0 0 60px rgba(66, 133, 244, 0.08),
                inset 0 -20px 40px rgba(52, 168, 83, 0.05)
              `,
              position: 'relative', flexShrink: 0
            }}
          >
            {/* Animated Glow Pulse Behind Card */}
            <motion.div 
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: 70,
                background: 'radial-gradient(circle, rgba(66, 133, 244, 0.3) 0%, rgba(52, 168, 83, 0.15) 40%, transparent 70%)',
                filter: 'blur(25px)',
                zIndex: -1
              }}
            />
            
            {/* Inner Glowing Border */}
            <div style={{
              position: 'absolute',
              inset: 8,
              borderRadius: 42,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.02)'
            }} />
            
            {/* Logo with Enhanced Animation */}
            <motion.img 
              src={logo} 
              alt="GDGC IARE Logo" 
              animate={{ 
                scale: [1, 1.03, 1],
                filter: [
                  'drop-shadow(0 0 30px rgba(255,255,255,0.4)) drop-shadow(0 0 60px rgba(66, 133, 244, 0.3))',
                  'drop-shadow(0 0 40px rgba(255,255,255,0.5)) drop-shadow(0 0 80px rgba(66, 133, 244, 0.4))',
                  'drop-shadow(0 0 30px rgba(255,255,255,0.4)) drop-shadow(0 0 60px rgba(66, 133, 244, 0.3))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ 
                width: 120, 
                height: 120, 
                objectFit: 'contain',
                position: 'relative',
                zIndex: 2
              }} 
              onError={(e) => {e.target.style.display='none'}} 
            />
            
            {/* Corner Accent Dots */}
            <div style={{ position: 'absolute', top: 20, right: 20, width: 6, height: 6, borderRadius: '50%', background: THEME.colors.brand.blue, boxShadow: `0 0 10px ${THEME.colors.brand.blue}` }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, width: 6, height: 6, borderRadius: '50%', background: THEME.colors.brand.green, boxShadow: `0 0 10px ${THEME.colors.brand.green}` }} />
            <div style={{ position: 'absolute', top: 20, left: 20, width: 4, height: 4, borderRadius: '50%', background: THEME.colors.brand.red, boxShadow: `0 0 8px ${THEME.colors.brand.red}` }} />
            <div style={{ position: 'absolute', bottom: 20, right: 20, width: 4, height: 4, borderRadius: '50%', background: THEME.colors.brand.yellow, boxShadow: `0 0 8px ${THEME.colors.brand.yellow}` }} />
            
            {/* Bottom Label */}
            <div style={{
              position: 'absolute',
              bottom: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}>
              GDGC IARE
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(52, 168, 83, 0.1)', border: '1px solid rgba(52, 168, 83, 0.3)', marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.colors.brand.green, boxShadow: '0 0 10px #34A853' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: THEME.colors.brand.green }}>LIVE DATA UPLINK ACTIVE</span>
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 4vw, 72px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px 0', letterSpacing: '-0.03em', fontFamily: 'Outfit' }}>
              Study Jams <br />
              <span className="text-gradient-google">Leaderboard</span>
            </h1>
            <p style={{ fontSize: 18, color: THEME.colors.text.secondary, maxWidth: 600, lineHeight: 1.6 }}>
              Monitor real-time squad progress, badge acquisitions, and arcade completions across the global network.
            </p>
          </motion.div>
        </div>

        {/* --- STATS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 60 }}>
          <QuantumStatCard delay={0.1} icon={<FaUsers />} label="Active Teams" value={filteredTeams.length} color={THEME.colors.brand.blue} />
          <QuantumStatCard delay={0.2} icon={<FaBolt />} label="Total Points" value={filteredTeams.reduce((a,b)=>a+b.totalPoints,0)} color={THEME.colors.brand.yellow} />
          <QuantumStatCard delay={0.3} icon={<FaMedal />} label="Badges Minted" value={filteredTeams.reduce((a,b)=>a+b.totalBadges,0)} color={THEME.colors.brand.green} />
          <QuantumStatCard delay={0.4} icon={<FaGamepad />} label="Arcade Runs" value={filteredTeams.reduce((a,b)=>a+b.totalArcadeGames,0)} color={THEME.colors.brand.red} />
        </div>

        {/* --- CONTROL BAR --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel"
          style={{ padding: 24, borderRadius: 24, marginBottom: 40, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
             <FaSearch style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
             <input 
               type="text" placeholder="Search specific squad or agent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 60px', borderRadius: 16, color: 'white', outline: 'none', fontSize: 16, fontFamily: 'Outfit' }}
               onFocus={(e) => e.target.style.borderColor = THEME.colors.brand.blue}
               onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
             />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <QuantumButton onClick={() => setShowTopPerformers(true)} icon={FaStar} variant="gold">Hall of Fame</QuantumButton>
            <QuantumButton onClick={fetchTeamsData} icon={MdRefresh} variant="default">Sync</QuantumButton>
          </div>
        </motion.div>

        {/* --- MAIN CONTENT --- */}
        {loading ? (
          <div style={{ padding: 100, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loader />
            <p style={{ marginTop: 32, letterSpacing: 3, fontSize: 12, opacity: 0.5, textTransform: 'uppercase' }}>Establishing Secure Uplink...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="glass-panel" style={{ padding: 100, textAlign: 'center', borderRadius: 32, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <FaSearch size={64} style={{ opacity: 0.2, marginBottom: 24 }} />
            <h3 style={{ fontSize: 24, fontWeight: 700 }}>No squads found in this sector.</h3>
            <p style={{ opacity: 0.5 }}>Try adjusting your search parameters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 40, alignItems: 'start' }} className="responsive-grid">
            
            {/* LEFT: LEADERBOARD LIST */}
            <div>
              <AnimatePresence mode="wait">
                {currentTeams.map((team, index) => (
                  <QuantumTeamCard 
                    key={team.team} 
                    team={team} 
                    rank={startIndex + index + 1} 
                    maxPoints={maxPoints}
                    isSelected={selectedTeam?.team === team.team}
                    onSelect={() => {
                      setSelectedTeam({ ...team, actualRank: startIndex + index + 1 });
                      if(window.innerWidth < 1200) setShowMobileDetails(true);
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40 }}>
                   <QuantumButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} icon={FaChevronLeft} variant="default" />
                   <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 14, fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)' }}>
                      PAGE {currentPage} / {totalPages}
                   </div>
                   <QuantumButton onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} icon={FaChevronRight} variant="default" />
                </div>
              )}
            </div>

            {/* RIGHT: DETAILS (Desktop Sticky) */}
            <div className="desktop-details">
               <AnimatePresence mode="wait">
                 <motion.div key={selectedTeam ? selectedTeam.team : 'empty'} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <QuantumDetailsPanel team={selectedTeam || currentTeams[0]} rank={selectedTeam?.actualRank || startIndex + 1} maxPoints={maxPoints} />
                 </motion.div>
               </AnimatePresence>
            </div>

          </div>
        )}
      </main>

      <div style={{ position: 'relative', zIndex: 50 }}><Footer /></div>
      
      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

      {/* --- MODALS --- */}
      
      {/* 1. Top Performers Hall of Fame */}
      <AnimatePresence>
        {showTopPerformers && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(30px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
             onClick={() => setShowTopPerformers(false)}
           >
              <motion.div 
                className="glass-panel"
                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 900, maxHeight: '85vh', borderRadius: 40, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${THEME.colors.brand.yellow}40`, boxShadow: '0 0 100px rgba(251, 188, 5, 0.1)' }}
              >
                 {/* Modal Header */}
                 <div style={{ padding: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(251, 188, 5, 0.05), transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: THEME.gradients.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: 24 }}><FaTrophy /></div>
                      <div>
                        <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1 }}>Hall of Fame</h2>
                        <p style={{ margin: '6px 0 0 0', color: THEME.colors.brand.yellow, fontWeight: 700, letterSpacing: 2, fontSize: 12, textTransform: 'uppercase' }}>ELITE PERFORMERS ACROSS ALL SQUADS</p>
                      </div>
                    </div>
                    <QuantumButton onClick={() => setShowTopPerformers(false)} icon={FaTimes} variant="default" />
                 </div>
                 
                 {/* List */}
                 <div className="custom-scrollbar" style={{ overflowY: 'auto', padding: 40 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                      {getTopPerformers().map((p, i) => (
                        <motion.div 
                          key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
                          style={{ 
                            padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: i < 3 ? `1px solid ${THEME.colors.brand.yellow}40` : '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', gap: 20
                          }}
                        >
                          <div style={{ 
                            width: 50, height: 50, borderRadius: 14, 
                            background: i < 3 ? THEME.gradients.gold : 'rgba(255,255,255,0.1)', 
                            color: i < 3 ? 'black' : 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                            boxShadow: i < 3 ? '0 0 20px rgba(251, 188, 5, 0.4)' : 'none'
                          }}>
                            {i < 3 ? <FaCrown /> : i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{p.name}</div>
                            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{p.teamName}</div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 10, opacity: 0.7 }}>
                               <span style={{display:'flex', alignItems:'center', gap:4}}><FaMedal color={THEME.colors.brand.green} /> {p.badges}</span>
                               <span style={{display:'flex', alignItems:'center', gap:4}}><FaGamepad color={THEME.colors.brand.red} /> {p.arcadeGames}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.brand.blue, fontFamily: 'Space Grotesk' }}>{p.points}</div>
                        </motion.div>
                      ))}
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Mobile Details Modal */}
      <AnimatePresence>
        {showMobileDetails && selectedTeam && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 9999, display: 'flex', alignItems: 'end', justifyContent: 'center' }}
            onClick={() => setShowMobileDetails(false)}
          >
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               onClick={e => e.stopPropagation()} 
               style={{ width: '100%', maxWidth: 600, background: '#0A0A0C', borderRadius: '30px 30px 0 0', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
             >
                <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
                   <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                </div>
                <div style={{ overflowY: 'auto' }}>
                  <QuantumDetailsPanel team={selectedTeam} rank={selectedTeam.actualRank} maxPoints={maxPoints} />
                </div>
                <div style={{ padding: 20, background: '#0A0A0C', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                   <QuantumButton onClick={() => setShowMobileDetails(false)} style={{ width: '100%', justifyContent: 'center' }}>Close Panel</QuantumButton>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Overrides for Layout */}
      <style>{`
        @media (max-width: 1200px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
          .desktop-details { display: none !important; }
          .hero-section { flex-direction: column !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
};

export default StudyJamsPage;