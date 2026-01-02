/**
 * @version 3.0.0-Quantum
 * @author Google Developer Group (Experience Engineering)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuizSocket, useLiveQuiz } from '../hooks/useQuizSocket';
// Preserving original imports for compatibility
import PageBackground from '../components/common/PageBackground'; 
import Toast from '../components/common/Toast'; 
import logo from '../assets/logo.png'; 

const THEME = {
    colors: {
        // Environment
        bg: '#020203',
        surface: '#0F0F12',
        surfaceHighlight: '#1A1A1F',
        
        // Typography
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.7)',
            tertiary: 'rgba(255, 255, 255, 0.4)',
            inverse: '#000000'
        },
        
        // Google Brand (Neon/Quantum Variants)
        brand: {
            blue: '#4285F4',
            red: '#EA4335',
            yellow: '#FBBC05',
            green: '#34A853',
            
            // High-Alpha Glows
            blueGlow: 'rgba(66, 133, 244, 0.6)',
            redGlow: 'rgba(234, 67, 53, 0.6)',
            yellowGlow: 'rgba(251, 188, 5, 0.6)',
            greenGlow: 'rgba(52, 168, 83, 0.6)',
            
            // Low-Alpha Dim
            blueDim: 'rgba(66, 133, 244, 0.1)',
            redDim: 'rgba(234, 67, 53, 0.1)',
            yellowDim: 'rgba(251, 188, 5, 0.1)',
            greenDim: 'rgba(52, 168, 83, 0.1)',
        },
        
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.2)',
    },
    
    gradients: {
        // Advanced Holographic Gradients
        primary: 'linear-gradient(135deg, #4285F4 0%, #1967D2 100%)',
        success: 'linear-gradient(135deg, #34A853 0%, #188038 100%)',
        danger: 'linear-gradient(135deg, #EA4335 0%, #B31412 100%)',
        warning: 'linear-gradient(135deg, #FBBC05 0%, #F57F17 100%)',
        
        // Podium Metals
        gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        silver: 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)',
        bronze: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
        
        // UI Surfaces
        darkGlass: 'linear-gradient(180deg, rgba(20, 20, 20, 0.7) 0%, rgba(10, 10, 10, 0.8) 100%)',
        iridescent: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)',
    },
    
    shadows: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.3)',
        neonBlue: '0 0 20px rgba(66, 133, 244, 0.4), 0 0 40px rgba(66, 133, 244, 0.1)',
        neonGreen: '0 0 20px rgba(52, 168, 83, 0.4), 0 0 40px rgba(52, 168, 83, 0.1)',
        neonRed: '0 0 20px rgba(234, 67, 53, 0.4), 0 0 40px rgba(234, 67, 53, 0.1)',
        card: '0 20px 50px rgba(0,0,0,0.5)',
    },
    
    transitions: {
        default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
};

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        /* --- RESET & BASE --- */
        * { box-sizing: border-box; }
        
        body {
            margin: 0;
            padding: 0;
            background-color: ${THEME.colors.bg};
            color: ${THEME.colors.text.primary};
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* --- SCROLLBARS --- */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        /* --- ANIMATION KEYFRAMES --- */

        @keyframes aurora-flow {
            0% { background-position: 50% 50%; }
            100% { background-position: 350% 50%; }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(52, 168, 83, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(52, 168, 83, 0); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(52, 168, 83, 0); }
        }

        @keyframes pulse-ring-red {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(234, 67, 53, 0); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
        }

        @keyframes spin-slow { 
            100% { transform: rotate(360deg); } 
        }

        @keyframes spin { 
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); } 
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes slide-up-fade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }

        @keyframes glitch-skew {
            0% { transform: skew(0deg); }
            20% { transform: skew(-2deg); }
            40% { transform: skew(2deg); }
            60% { transform: skew(-1deg); }
            80% { transform: skew(1deg); }
            100% { transform: skew(0deg); }
        }

        @keyframes pop-in {
            0% { opacity: 0; transform: scale(0.5); }
            70% { transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }

        /* --- UTILITY CLASSES --- */

        .glass-panel {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            transition: border-color 0.3s ease;
        }
        
        .glass-panel:hover {
            border-color: rgba(255, 255, 255, 0.15);
        }
        
        .text-gradient {
            background: linear-gradient(135deg, #FFFFFF 0%, #A0A0A0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .text-gradient-brand {
            background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
            background-size: 300%;
            animation: aurora-flow 10s linear infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hover-lift:hover { transform: translateY(-4px); }

        .animate-enter { 
            animation: slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            opacity: 0;
        }
        
        .no-select { user-select: none; -webkit-user-select: none; }

        /* --- RESPONSIVE STYLES --- */
        @media (max-width: 1400px) {
            .host-main-grid { padding: 20px 30px !important; gap: 24px !important; }
            .host-aside { width: 320px !important; min-width: 280px !important; }
        }
        
        @media (max-width: 1200px) {
            .host-header { height: auto !important; min-height: 80px !important; padding: 12px 20px !important; flex-wrap: wrap !important; gap: 16px !important; }
            .host-header-logo { width: 60px !important; height: 60px !important; }
            .host-header-logo img { height: 40px !important; }
            .host-main-grid { flex-direction: column !important; padding: 16px !important; overflow-y: auto !important; }
            .host-aside { width: 100% !important; max-height: 300px !important; }
            .host-session-code { padding: 8px 20px !important; }
            .host-session-code span:last-child { font-size: 20px !important; }
        }
        
        @media (max-width: 900px) {
            .host-header { justify-content: center !important; }
            .host-header-title { display: none !important; }
            .host-question-grid { grid-template-columns: 1fr !important; }
            .host-timer-column { display: none !important; }
            .host-timer-mobile { display: flex !important; }
            .host-question-text { font-size: 24px !important; }
            .host-options-grid { grid-template-columns: 1fr !important; }
        }
        
        @media (max-width: 600px) {
            .host-header-logo { width: 50px !important; height: 50px !important; }
            .host-header-logo img { height: 32px !important; }
            .host-session-code { padding: 6px 12px !important; }
            .host-session-code span:last-child { font-size: 16px !important; letter-spacing: 0 !important; }
            .host-main-grid { padding: 8px !important; }
            .host-btn { padding: 12px 20px !important; font-size: 12px !important; }
        }
        
        /* Final Leaderboard Mobile Styles */
        @media (max-width: 768px) {
            .final-leaderboard-podium { 
                flex-direction: column !important; 
                align-items: center !important;
                gap: 16px !important;
            }
        }
    `}</style>
);

const QuantumField = ({ active }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationFrame;

        // Physics Config
        const PARTICLE_COUNT = active ? 70 : 35; 
        const CONNECT_DISTANCE = 160;
        const MOUSE_RADIUS = 250;

        let mouse = { x: null, y: null };

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
                const velocityScale = active ? 0.18 : 0.12;
                this.vx = (Math.random() - 0.5) * velocityScale;
                this.vy = (Math.random() - 0.5) * velocityScale;
                this.size = Math.random() * 2 + 1;
                // Random Google Brand Color
                const colors = [THEME.colors.brand.blue, THEME.colors.brand.red, THEME.colors.brand.yellow, THEME.colors.brand.green];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Interactive Mouse Repulsion
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
                        this.vx -= directionX * 0.02;
                        this.vy -= directionY * 0.02;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw Deep Space Radial Gradient
            const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Particles & Network Connections
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx*dx + dy*dy);

                    if (distance < CONNECT_DISTANCE) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/CONNECT_DISTANCE * 0.1})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrame = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [active]);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />;
};
const Icons = {
    Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>,
    Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    Skip: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
    Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Trophy: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-4v4"/><path d="M12 17a5 5 0 0 0 5-5V6H7v6a5 5 0 0 0 5 5z"/><path d="M17 6v3a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V6"/><path d="M7 6v3a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V6"/></svg>,
    Copy: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Crown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-13-4 13z" fill="currentColor" stroke="none"/></svg>,
    Loader: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none"/></svg>,
    // Professional guideline icons
    Monitor: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    TabBlocked: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><line x1="4" y1="20" x2="20" y2="4" strokeWidth="2.5"/></svg>,
    AlertTriangle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Eye: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// --- 4.2 Glass Card ---
const GlassCard = ({ children, className = '', style = {}, hoverEffect = false, tilt = false }) => {
    return (
        <div 
            className={`glass-panel ${hoverEffect ? 'hover-lift' : ''} ${className}`}
            style={{
                borderRadius: '24px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            {/* Iridescent Top Highlight */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                opacity: 0.5
            }} />
            {children}
        </div>
    );
};

// --- 4.3 Neo Button ---
const NeoButton = ({ onClick, children, variant = 'primary', icon: Icon, disabled = false, style = {} }) => {
    const variants = {
        primary: { background: THEME.gradients.primary, shadow: THEME.shadows.neonBlue },
        success: { background: THEME.gradients.success, shadow: THEME.shadows.neonGreen },
        danger: { background: THEME.gradients.danger, shadow: '0 0 20px rgba(234, 67, 53, 0.4)' },
        ghost: { background: 'rgba(255,255,255,0.05)', shadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }
    };

    const activeVariant = variants[variant];
    const [hover, setHover] = useState(false);

    return (
        <button
            onClick={!disabled ? onClick : null}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: activeVariant.background,
                border: activeVariant.border || 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                color: 'white',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '15px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: hover && !disabled ? activeVariant.shadow : 'none',
                transform: hover && !disabled ? 'translateY(-2px)' : 'translateY(0)',
                transition: THEME.transitions.default,
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                ...style
            }}
        >
            {/* Shimmer Effect */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: hover ? 'translateX(100%)' : 'translateX(-100%)',
                transition: 'transform 0.5s ease'
            }} />
            
            {Icon && <Icon />}
            <span>{children}</span>
        </button>
    );
};

// --- 4.4 Glitch Text Title ---
const GlitchText = ({ text, style }) => (
    <div style={{ position: 'relative', display: 'inline-block', color: 'white', fontWeight: 800, whiteSpace: 'nowrap', lineHeight: 1, ...style }}>
        <span style={{ position: 'relative', zIndex: 2, whiteSpace: 'nowrap' }}>{text}</span>
        <span style={{ 
            position: 'absolute', top: 0, left: '2px', color: THEME.colors.brand.blue, 
            zIndex: 1, opacity: 0.7, mixBlendMode: 'screen', animation: 'glitch-skew 3s infinite linear alternate-reverse' 
        , whiteSpace: 'nowrap' }}>{text}</span>
        <span style={{ 
            position: 'absolute', top: 0, left: '-2px', color: THEME.colors.brand.red, 
            zIndex: 1, opacity: 0.7, mixBlendMode: 'screen', animation: 'glitch-skew 2s infinite linear alternate' 
        , whiteSpace: 'nowrap' }}>{text}</span>
    </div>
);

// --- 4.5 Reactor Core Timer ---
const ReactorTimer = ({ timeRemaining, totalTime }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const progress = timeRemaining / totalTime;
    const strokeDashoffset = circumference - progress * circumference;

    // Dynamic coloring based on urgency
    let color = THEME.colors.brand.green;
    let isUrgent = false;
    if (progress < 0.5) color = THEME.colors.brand.yellow;
    if (progress < 0.2) {
        color = THEME.colors.brand.red;
        isUrgent = true;
    }

    return (
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Glowing Aura */}
            <div style={{
                position: 'absolute', inset: -10, borderRadius: '50%', 
                border: `1px solid ${color}`, opacity: 0.3,
                animation: isUrgent ? 'pulse-ring-red 1s infinite' : 'pulse-ring 3s infinite'
            }} />

            <svg width="160" height="160" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 15px ${color})` }}>
                {/* Background Ring */}
                <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                {/* Active Ring */}
                <circle
                    cx="80" cy="80" r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ 
                    fontSize: '48px', fontWeight: 700, fontFamily: 'Space Grotesk', lineHeight: 1,
                    textShadow: `0 0 20px ${color}`
                }}>
                    {timeRemaining}
                </div>
                <div style={{ fontSize: '10px', color: THEME.colors.text.secondary, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>Seconds</div>
            </div>
        </div>
    );
};

// --- 4.6 Connection Badge ---
const ConnectionStatus = ({ connected }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 16px', borderRadius: '50px',
        background: 'rgba(0,0,0,0.3)', 
        border: `1px solid ${connected ? 'rgba(52, 168, 83, 0.3)' : 'rgba(234, 67, 53, 0.3)'}`
    }}>
        <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: connected ? THEME.colors.brand.green : THEME.colors.brand.red,
            boxShadow: connected ? `0 0 10px ${THEME.colors.brand.green}` : 'none',
            animation: connected ? 'pulse-ring 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: connected ? THEME.colors.brand.green : THEME.colors.brand.red }}>
            {connected ? 'QUANTUM UPLINK ONLINE' : 'SIGNAL LOST'}
        </span>
    </div>
);

// --- 4.7 Premium Final Leaderboard Components ---

// Confetti Effect Component
const Confetti = () => {
    const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FFD700', '#FF6B6B', '#9B59B6'];
    const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360
    }));
    
    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
            {confettiPieces.map(piece => (
                <div key={piece.id} style={{
                    position: 'absolute',
                    left: `${piece.left}%`,
                    top: '-20px',
                    width: piece.size,
                    height: piece.size * 0.6,
                    backgroundColor: piece.color,
                    transform: `rotate(${piece.rotation}deg)`,
                    animation: `confetti-fall ${piece.duration}s ease-in-out ${piece.delay}s infinite`,
                    opacity: 0.9,
                    borderRadius: '2px'
                }} />
            ))}
            <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// Podium Card for Top 3
const PodiumCard = ({ rank, user, score, delay, totalParticipants }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;
    
    // Heights for the podium pedestals - more dramatic difference
    const pedestalHeight = isFirst ? 200 : isSecond ? 150 : 110;
    // Much wider card sizes to fill the page
    const cardWidth = isFirst ? 280 : 240;
    const avatarSize = isFirst ? 120 : 100;
    
    // Medal colors and gradients
    const medalConfig = {
        1: { 
            gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
            glow: 'rgba(255, 215, 0, 0.6)',
            bgGradient: 'linear-gradient(180deg, rgba(255,215,0,0.25) 0%, rgba(255,165,0,0.08) 100%)',
            label: '1st',
            icon: '👑'
        },
        2: { 
            gradient: 'linear-gradient(135deg, #E8E8E8 0%, #B8B8B8 50%, #D8D8D8 100%)',
            glow: 'rgba(192, 192, 192, 0.5)',
            bgGradient: 'linear-gradient(180deg, rgba(192,192,192,0.18) 0%, rgba(128,128,128,0.05) 100%)',
            label: '2nd',
            icon: '🥈'
        },
        3: { 
            gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 50%, #CD7F32 100%)',
            glow: 'rgba(205, 127, 50, 0.5)',
            bgGradient: 'linear-gradient(180deg, rgba(205,127,50,0.18) 0%, rgba(139,69,19,0.05) 100%)',
            label: '3rd',
            icon: '🥉'
        }
    };
    
    const config = medalConfig[rank];
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: `podium-rise 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
            animationDelay: `${delay}s`,
            opacity: 0,
            transform: 'translateY(100px) scale(0.8)'
        }}>
            <style>{`
                @keyframes podium-rise {
                    0% { opacity: 0; transform: translateY(100px) scale(0.8); }
                    60% { transform: translateY(-20px) scale(1.05); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes crown-float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-8px) rotate(5deg); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 30px ${config.glow}, 0 0 60px ${config.glow}40; }
                    50% { box-shadow: 0 0 50px ${config.glow}, 0 0 100px ${config.glow}60; }
                }
                @keyframes score-count {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `}</style>
            
            {/* Crown/Icon for winner */}
            {isFirst && (
                <div style={{
                    fontSize: '56px',
                    marginBottom: '12px',
                    animation: 'crown-float 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 4px 20px rgba(255,215,0,0.6))'
                }}>👑</div>
            )}
            
            {/* Profile Card - Wider */}
            <div style={{
                width: cardWidth,
                background: 'rgba(20, 20, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '28px',
                padding: '24px 20px',
                border: `3px solid ${config.glow}`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 50px ${config.glow}40`,
                animation: isFirst ? 'glow-pulse 3s ease-in-out infinite' : 'none',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Avatar with medal border */}
                <div style={{
                    width: avatarSize,
                    height: avatarSize,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    padding: '4px',
                    background: config.gradient,
                    boxShadow: `0 0 40px ${config.glow}`
                }}>
                    {user.userPhoto ? (
                        <img src={user.userPhoto} alt="" style={{
                            width: '100%', height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #1a1a2e'
                        }} />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: isFirst ? '36px' : '28px',
                            color: 'white',
                            border: '4px solid #1a1a2e'
                        }}>
                            {user.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                
                {/* Rank Badge */}
                <div style={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: config.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#1a1a2e',
                    boxShadow: `0 4px 20px ${config.glow}`,
                    border: '3px solid rgba(255,255,255,0.3)'
                }}>
                    {rank}
                </div>
                
                {/* Name */}
                <div style={{
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: isFirst ? '18px' : '16px',
                    color: 'white',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                }}>
                    {user.userName || 'Anonymous'}
                </div>
                
                {/* Score */}
                <div style={{
                    textAlign: 'center',
                    fontFamily: 'Space Grotesk, monospace',
                    fontSize: isFirst ? '32px' : '26px',
                    fontWeight: 800,
                    background: config.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {score?.toLocaleString() || 0}
                </div>
                <div style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    marginTop: '2px'
                }}>
                    points
                </div>
            </div>
            
            {/* Pedestal - Wider and with visible rank */}
            <div style={{
                width: cardWidth + 20,
                height: pedestalHeight,
                background: config.bgGradient,
                borderTop: `4px solid ${config.glow}`,
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0 0 24px 24px',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Shimmer effect */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '200%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                    animation: 'shimmer 3s infinite linear'
                }} />
                
                {/* Rank label on pedestal - MORE VISIBLE */}
                <div style={{
                    position: 'absolute',
                    bottom: '50%',
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    fontSize: isFirst ? '72px' : '56px',
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.25)',
                    fontFamily: 'Space Grotesk, monospace',
                    textShadow: `0 0 30px ${config.glow}30`
                }}>
                    {rank}
                </div>
            </div>
        </div>
    );
};

// Table Row Component with animation
const LeaderboardTableRow = ({ rank, user, score, delay, isEven }) => (
    <tr style={{
        animation: `row-slide-in 0.5s ease-out forwards`,
        animationDelay: `${delay}s`,
        opacity: 0,
        transform: 'translateX(-20px)',
        background: isEven ? 'rgba(255,255,255,0.02)' : 'transparent'
    }}>
        <style>{`
            @keyframes row-slide-in {
                0% { opacity: 0; transform: translateX(-20px); }
                100% { opacity: 1; transform: translateX(0); }
            }
        `}</style>
        <td style={{
            padding: '16px 20px',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, monospace',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.7)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            #{rank}
        </td>
        <td style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user.userPhoto ? (
                    <img src={user.userPhoto} alt="" style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.1)'
                    }} />
                ) : (
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '16px',
                        color: 'white'
                    }}>
                        {user.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
                <span style={{ fontWeight: 600, color: 'white' }}>
                    {user.userName || 'Anonymous'}
                </span>
            </div>
        </td>
        <td style={{
            padding: '16px 20px',
            textAlign: 'center',
            fontFamily: 'Space Grotesk, monospace',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            {user.correctAnswers || 0}/{user.totalAnswers || 0}
        </td>
        <td style={{
            padding: '16px 20px',
            textAlign: 'right',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <span style={{
                fontFamily: 'Space Grotesk, monospace',
                fontSize: '18px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                {score?.toLocaleString() || 0}
            </span>
        </td>
    </tr>
);

// Full Final Leaderboard Screen
const FinalLeaderboardScreen = ({ leaderboard, onReturn, quizTitle }) => {
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const totalParticipants = leaderboard.length;
    
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            position: 'relative',
            overflow: 'auto'
        }}>
            {/* Confetti */}
            <Confetti />
            
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '60px',
                animation: 'fade-in 1s ease-out forwards',
                zIndex: 10
            }}>
                <style>{`
                    @keyframes fade-in {
                        0% { opacity: 0; transform: translateY(-20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes title-glow {
                        0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.3), 0 0 40px rgba(255,215,0,0.1); }
                        50% { text-shadow: 0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.2); }
                    }
                `}</style>
                <div style={{
                    fontSize: '14px',
                    letterSpacing: '6px',
                    color: THEME.colors.brand.yellow,
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                    fontWeight: 600
                }}>
                    🏆 Session Complete 🏆
                </div>
                <h1 style={{
                    fontSize: 'clamp(36px, 8vw, 72px)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                    animation: 'title-glow 3s ease-in-out infinite',
                    letterSpacing: '-2px'
                }}>
                    FINAL STANDINGS
                </h1>
                <div style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '12px'
                }}>
                    {quizTitle || 'Live Quiz'} • {totalParticipants} Participants
                </div>
            </div>
            
            {/* Podium for Top 3 - Wider layout */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 'clamp(16px, 3vw, 40px)',
                marginBottom: '60px',
                flexWrap: 'wrap',
                zIndex: 10,
                width: '100%',
                maxWidth: '1100px',
                padding: '0 20px'
            }}>
                {/* 2nd Place - Left */}
                {top3[1] && <PodiumCard rank={2} user={top3[1]} score={top3[1].score} delay={0.3} totalParticipants={totalParticipants} />}
                
                {/* 1st Place - Center (tallest) */}
                {top3[0] && <PodiumCard rank={1} user={top3[0]} score={top3[0].score} delay={0.1} totalParticipants={totalParticipants} />}
                
                {/* 3rd Place - Right */}
                {top3[2] && <PodiumCard rank={3} user={top3[2]} score={top3[2].score} delay={0.5} totalParticipants={totalParticipants} />}
            </div>
            
            {/* Rest of Leaderboard Table */}
            {rest.length > 0 && (
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    background: 'rgba(20, 20, 30, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    marginBottom: '40px',
                    animation: 'fade-in 1s ease-out forwards',
                    animationDelay: '0.8s',
                    opacity: 0,
                    zIndex: 10
                }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            Other Participants
                        </h3>
                    </div>
                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}>Rank</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}>Participant</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}>Correct</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'right',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rest.map((user, index) => (
                                    <LeaderboardTableRow
                                        key={user.oderId || index}
                                        rank={index + 4}
                                        user={user}
                                        score={user.score}
                                        delay={1 + (index * 0.05)}
                                        isEven={index % 2 === 0}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Return Button */}
            <button
                onClick={onReturn}
                style={{
                    padding: '16px 48px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'white',
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                    border: 'none',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(66, 133, 244, 0.3)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    animation: 'fade-in 1s ease-out forwards',
                    animationDelay: '1.2s',
                    opacity: 0,
                    zIndex: 10
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 15px 50px rgba(66, 133, 244, 0.4)';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 40px rgba(66, 133, 244, 0.3)';
                }}
            >
                Return to Dashboard
            </button>
        </div>
    );
};

// Keep old PodiumAvatar for backwards compatibility (deprecated)
const PodiumAvatar = ({ rank, user, score, delay }) => {
    const isFirst = rank === 1;
    const size = isFirst ? 110 : rank === 2 ? 90 : 80;
    const height = isFirst ? 240 : rank === 2 ? 180 : 140;
    
    // Podium Colors
    const colors = rank === 1 ? ['#FFD700', '#FFA500'] : rank === 2 ? ['#E0E0E0', '#B0B0B0'] : ['#CD7F32', '#8B4513'];

    return (
        <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: `slide-up-fade 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
            animationDelay: `${delay}s`,
            opacity: 0, transform: 'translateY(50px)'
        }}>
            {/* Avatar + Crown */}
            <div style={{ position: 'relative', marginBottom: '20px', animation: isFirst ? 'float 4s ease-in-out infinite' : 'none' }}>
                {isFirst && <div style={{ 
                    position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', 
                    color: '#FFD700', filter: 'drop-shadow(0 0 15px #FFD700)' 
                }}><Icons.Crown /></div>}
                
                <div style={{
                    width: size, height: size, borderRadius: '50%',
                    padding: '4px',
                    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                    boxShadow: `0 0 40px ${colors[0]}40`
                }}>
                    {user.userPhoto ? (
                        <img src={user.userPhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #000' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', border: '3px solid #000' }}>
                            {user.userName.charAt(0)}
                        </div>
                    )}
                </div>
                
                <div style={{
                    position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
                    background: colors[0], color: 'black', fontWeight: 800, fontSize: '12px',
                    padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    border: '2px solid #000'
                }}>#{rank}</div>
            </div>

            {/* Name & Score */}
            <div style={{ textAlign: 'center', marginBottom: '16px', zIndex: 2 }}>
                <div style={{ fontWeight: 700, fontSize: isFirst ? '20px' : '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{user.userName}</div>
                <div style={{ color: colors[0], fontWeight: 600, fontFamily: 'Space Grotesk', fontSize: '14px' }}>{score} PTS</div>
            </div>

            {/* Glowing Pillar */}
            <div style={{
                width: isFirst ? '140px' : '100px',
                height: height,
                background: `linear-gradient(180deg, ${colors[0]}20 0%, transparent 100%)`,
                borderTop: `2px solid ${colors[0]}`,
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px 16px 0 0',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                boxShadow: `0 0 60px -20px ${colors[0]}40`
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)`,
                    animation: 'shimmer 3s infinite linear'
                }} />
            </div>
        </div>
    );
};


const LiveQuizHostPage = () => {
    // --- HOOKS & STATE ---
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Data
    const quizInfo = location.state?.quizInfo;
    const { connect, isConnected, emit } = useQuizSocket();
    const {
        status, participants, currentQuestion, questionIndex, totalQuestions,
        timeRemaining, timeLimit, leaderboard, answerStats, correctAnswer,
        quizComplete, nextQuestion, skipTimer, endSession, getSessionState
    } = useLiveQuiz(true); // true = isHost
    
    // Local State
    const [sessionCode, setSessionCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    
    // UI State
    const [showResults, setShowResults] = useState(false);
    const [toast, setToast] = useState(null); // { msg, type }
    
    // New: Guidelines and Countdown State
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [guidelinesTimeLeft, setGuidelinesTimeLeft] = useState(10);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(3);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [showLeaderboardOverlay, setShowLeaderboardOverlay] = useState(false);
    const guidelinesTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);

    // --- LOGIC: INITIALIZATION ---
    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("Authentication required");
                
                connect({ token });
                
                // Artificial delay for "boot sequence" visual
                await new Promise(r => setTimeout(r, 1500));

                emit('session:create', { quizId }, (res) => {
                    if (res.error) setError(res.error);
                    else {
                        setSessionCode(res.sessionCode);
                        showToast("Session initialized. Quantum link established.", "success");
                    }
                    setLoading(false);
                });
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        init();
    }, [quizId, connect, emit]);

    // --- LOGIC: SYNC ---
    useEffect(() => {
        if (!sessionCode || !isConnected) return;
        const sync = () => getSessionState(sessionCode).catch(() => {});
        const interval = setInterval(sync, 3000);
        return () => clearInterval(interval);
    }, [sessionCode, isConnected, getSessionState]);

    // --- LOGIC: GAME FLOW ---
    useEffect(() => {
        if (correctAnswer && timeRemaining === 0 && !showResults) {
            // Delay showing results slightly for dramatic effect
            const timer = setTimeout(() => setShowResults(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [correctAnswer, timeRemaining]);

    // --- HANDLERS ---
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const copyCode = () => {
        if (!sessionCode) return;
        navigator.clipboard.writeText(sessionCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast("Session Code Copied", "success");
    };

    // Start Quiz: Show guidelines for 10 seconds, then 3 second countdown, then first question
    const startQuizWithGuidelines = async () => {
        setShowGuidelines(true);
        setGuidelinesTimeLeft(10);
        
        // Emit guidelines event to participants
        emit('session:broadcast', { 
            sessionCode, 
            event: 'session:guidelines', 
            data: { timeLeft: 10 } 
        });
        
        // Start 10 second countdown for guidelines
        let timeLeft = 10;
        guidelinesTimerRef.current = setInterval(() => {
            timeLeft -= 1;
            setGuidelinesTimeLeft(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(guidelinesTimerRef.current);
                setShowGuidelines(false);
                startCountdown();
            }
        }, 1000);
    };
    
    // 3 second countdown before first question
    const startCountdown = () => {
        setShowCountdown(true);
        setCountdownValue(3);
        
        // Emit countdown to participants
        emit('session:broadcast', { 
            sessionCode, 
            event: 'session:countdown', 
            data: { count: 3 } 
        });
        
        let count = 3;
        countdownTimerRef.current = setInterval(() => {
            count -= 1;
            setCountdownValue(count);
            
            // Sync countdown with participants
            emit('session:broadcast', { 
                sessionCode, 
                event: 'session:countdown', 
                data: { count } 
            });
            
            if (count <= 0) {
                clearInterval(countdownTimerRef.current);
                setShowCountdown(false);
                // Start first question
                onNext();
            }
        }, 1000);
    };

    const onNext = async () => {
        try {
            setShowLeaderboardOverlay(false); // Hide leaderboard overlay before next question
            await nextQuestion(sessionCode);
            setShowResults(false);
        } catch (e) { showToast("Command failed: " + e, "error"); }
    };
    
    // Reveal leaderboard overlay
    const onRevealLeaderboard = () => {
        setShowLeaderboardOverlay(true);
    };

    const onEnd = async () => {
        if(window.confirm("Terminate quantum session?")) {
            try { await endSession(sessionCode); } catch(e) { showToast(e, "error"); }
        }
    };


    // --- LOADING VIEW ---
    if (loading) return (
        <div style={{ ...styles.fullCenter, flexDirection: 'column' }}>
            <GlobalStyles />
            <QuantumField active={false} />
            <div style={{ position: 'relative', animation: 'pop-in 0.5s ease-out' }}>
                <div style={{ 
                    width: 80, height: 80, border: `4px solid ${THEME.colors.brand.blue}`, 
                    borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' 
                }} />
                <img src={logo} alt="GDGC" style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40 }} />
            </div>
            <h2 style={{ marginTop: 32, letterSpacing: 6, textTransform: 'uppercase', fontSize: 14, opacity: 0.7 }}>Initializing System</h2>
        </div>
    );

    // --- ERROR VIEW ---
    if (error) return (
        <div style={styles.fullCenter}>
            <GlobalStyles />
            <QuantumField active={false} />
            <GlassCard style={{ textAlign: 'center', borderColor: THEME.colors.brand.red, padding: 'clamp(20px, 4vw, 40px) clamp(30px, 5vw, 60px)', margin: '20px', maxWidth: '90vw' }}>
                <div style={{ color: THEME.colors.brand.red, marginBottom: '20px' }}><Icons.Zap /></div>
                <h1 style={{ color: THEME.colors.brand.red, fontSize: 'clamp(24px, 5vw, 40px)', margin: 0 }}>SYSTEM FAILURE</h1>
                <p style={{ margin: '20px 0 40px', opacity: 0.7, fontSize: 'clamp(12px, 1.5vw, 16px)' }}>{error}</p>
                <NeoButton className="host-btn" onClick={() => navigate(-1)} variant="ghost">Return to Safety</NeoButton>
            </GlassCard>
        </div>
    );

    // --- COMPLETION VIEW (STUNNING FINAL LEADERBOARD) ---
    if (quizComplete) return (
        <div style={styles.container}>
            <GlobalStyles />
            <QuantumField active={true} />
            <FinalLeaderboardScreen 
                leaderboard={leaderboard}
                onReturn={() => navigate('/admin/dashboard')}
                quizTitle={quizInfo?.title}
            />
        </div>
    );

    // --- MAIN DASHBOARD LAYOUT ---
    return (
        <div style={styles.container}>
            <GlobalStyles />
            {/* Background Physics */}
            <QuantumField active={status !== 'lobby'} />
            
            {/* --- HEADER --- */}
            <header className="host-header" style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    {/* ENHANCED LOGO: Much Larger size + Glow Container */}
                    <div className="host-header-logo" style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ 
                            position: 'absolute', inset: 0, background: THEME.colors.brand.blue, 
                            filter: 'blur(40px)', opacity: 0.4, borderRadius: '50%' 
                        }} />
                         <div style={{ 
                            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', 
                            border: '2px solid rgba(255,255,255,0.15)', borderRadius: '28px',
                            backdropFilter: 'blur(15px)'
                        }} />
                        <img src={logo} alt="GDGC Logo" style={{ height: '80px', width: 'auto', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(66, 133, 244, 0.4))' }} />
                    </div>
                    
                    <div className="host-header-title">
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                            {quizInfo?.title || 'Live Quiz Event'}
                        </h1>
                        <div style={{ fontSize: '12px', opacity: 0.5, letterSpacing: '2px', marginTop: '6px', textTransform: 'uppercase' }}>
                            {status === 'lobby' ? 'Lobby Phase' : `Question ${questionIndex + 1} of ${totalQuestions}`}
                        </div>
                    </div>
                </div>

                {/* Session Code Pill */}
                <div 
                    onClick={copyCode}
                    className="hover-lift host-session-code"
                    style={{ 
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 40px', borderRadius: '100px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        backdropFilter: 'blur(20px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    <span style={{ fontSize: '10px', color: THEME.colors.brand.blue, fontWeight: 700, letterSpacing: '3px' }}>SESSION CODE</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: 700, letterSpacing: '2px', color: 'white' }}>{sessionCode}</span>
                        {copied ? <Icons.Check /> : <Icons.Copy />}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <ConnectionStatus connected={isConnected} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Icons.Users />
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px' }}>{participants.length}</span>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="host-main-grid" style={styles.mainGrid}>
                
                {/* LEFT: GAME STAGE */}
                <section style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
                    <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        
                        {/* GUIDELINES PHASE */}
                        {showGuidelines && (
                            <div style={{ flex: 1, padding: 'clamp(20px, 4vw, 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                                <div style={{ textAlign: 'center', maxWidth: '900px', width: '100%' }}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '12px', 
                                        background: 'linear-gradient(135deg, #4285F4, #34A853)', 
                                        padding: '12px 24px', borderRadius: '30px', marginBottom: '32px' 
                                    }}>
                                        <Icons.Loader />
                                        <span style={{ fontWeight: 700, fontSize: '18px' }}>Starting in {guidelinesTimeLeft}s</span>
                                    </div>
                                    
                                    <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '40px', fontWeight: 800 }}>
                                        Quiz Guidelines
                                    </h2>
                                    
                                    {/* 2x2 Grid Layout for Guidelines */}
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: '20px', 
                                        textAlign: 'left' 
                                    }}>
                                        {[
                                            { 
                                                Icon: Icons.Monitor, 
                                                title: 'Full-Screen Required', 
                                                desc: 'Participants must stay in full-screen mode',
                                                color: THEME.colors.brand.blue,
                                                bgColor: 'rgba(66, 133, 244, 0.15)'
                                            },
                                            { 
                                                Icon: Icons.TabBlocked, 
                                                title: 'No Tab Switching', 
                                                desc: 'Switching tabs will trigger a warning',
                                                color: THEME.colors.brand.red,
                                                bgColor: 'rgba(234, 67, 53, 0.15)'
                                            },
                                            { 
                                                Icon: Icons.AlertTriangle, 
                                                title: '5 Warning Limit', 
                                                desc: 'Auto-submit after 5 violations',
                                                color: THEME.colors.brand.yellow,
                                                bgColor: 'rgba(251, 188, 5, 0.15)'
                                            },
                                            { 
                                                Icon: Icons.Clock, 
                                                title: 'Timed Questions', 
                                                desc: 'Each question has a strict time limit',
                                                color: THEME.colors.brand.green,
                                                bgColor: 'rgba(52, 168, 83, 0.15)'
                                            }
                                        ].map((rule, i) => (
                                            <div key={i} className="animate-enter" style={{ 
                                                animationDelay: `${i * 0.12}s`,
                                                display: 'flex', alignItems: 'center', gap: '16px',
                                                background: 'rgba(255,255,255,0.03)', 
                                                padding: '24px', 
                                                borderRadius: '20px', 
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <div style={{ 
                                                    width: '56px', 
                                                    height: '56px', 
                                                    borderRadius: '16px',
                                                    background: rule.bgColor,
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: rule.color,
                                                    flexShrink: 0,
                                                    boxShadow: `0 8px 24px ${rule.bgColor}`
                                                }}>
                                                    <rule.Icon />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px', color: 'white' }}>{rule.title}</div>
                                                    <div style={{ opacity: 0.6, fontSize: '13px', lineHeight: 1.4 }}>{rule.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '40px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', width: `${(guidelinesTimeLeft / 10) * 100}%`, 
                                            background: 'linear-gradient(90deg, #4285F4, #34A853)', 
                                            transition: 'width 1s linear', borderRadius: '4px'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* COUNTDOWN PHASE */}
                        {showCountdown && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ 
                                        fontSize: '200px', fontWeight: 900, 
                                        background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                                        backgroundSize: '300% 300%', animation: 'aurora-flow 3s linear infinite',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        textShadow: '0 0 60px rgba(66, 133, 244, 0.5)'
                                    }}>
                                        {countdownValue}
                                    </div>
                                    <p style={{ fontSize: '24px', opacity: 0.7, marginTop: '20px' }}>Get Ready!</p>
                                </div>
                            </div>
                        )}

                        {/* LOBBY STATE */}
                        {status === 'lobby' && !showGuidelines && !showCountdown && (
                            <div className="host-lobby-content" style={{ flex: 1, padding: 'clamp(20px, 4vw, 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 60px)' }}>
                                    <h2 className="text-gradient host-lobby-title" style={{ fontSize: 'clamp(28px, 5vw, 56px)', marginBottom: '24px', fontWeight: 800 }}>Ready to Launch?</h2>
                                    <p className="host-lobby-subtitle" style={{ fontSize: 'clamp(14px, 2vw, 20px)', opacity: 0.7 }}>Instruct players to join at <strong style={{ color: THEME.colors.brand.blue }}>www.gdgciare.tech/quiz</strong></p>
                                    
                                    <div onClick={copyCode} className="host-lobby-code" style={{ marginTop: 'clamp(20px, 3vw, 40px)', fontSize: 'clamp(40px, 10vw, 96px)', fontFamily: 'Space Grotesk', fontWeight: 800, letterSpacing: 'clamp(2px, 1vw, 10px)', textShadow: '0 0 40px rgba(66, 133, 244, 0.3)', cursor: 'pointer' }}>
                                        {sessionCode}
                                    </div>
                                </div>

                                {/* Participant Grid */}
                                <div style={{ width: '100%', flex: 1, minHeight: 0, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: 'clamp(15px, 2vw, 30px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'clamp(10px, 2vw, 20px)' }}>
                                        {participants.map((p, i) => (
                                            <div key={p.oderId} className="animate-enter" style={{ animationDelay: `${i*0.05}s`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1vw, 16px)', background: 'rgba(255,255,255,0.03)', padding: 'clamp(12px, 2vw, 20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                {p.userPhoto ? (
                                                    <img src={p.userPhoto} style={{ width: 'clamp(40px, 5vw, 64px)', height: 'clamp(40px, 5vw, 64px)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                                ) : (
                                                    <div style={{ width: 'clamp(40px, 5vw, 64px)', height: 'clamp(40px, 5vw, 64px)', borderRadius: '50%', background: THEME.gradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(16px, 2vw, 24px)' }}>{p.userName[0]}</div>
                                                )}
                                                <span style={{ fontSize: 'clamp(11px, 1.2vw, 14px)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{p.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {participants.length === 0 && (
                                        <div style={{ height: '100%', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.3 }}>
                                            <div style={{ animation: 'spin-slow 3s linear infinite', marginBottom: '20px' }}><Icons.Loader /></div>
                                            <span style={{ letterSpacing: '2px', fontSize: 'clamp(10px, 1.2vw, 14px)' }}>AWAITING CONNECTIONS...</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 'clamp(20px, 3vw, 40px)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <NeoButton variant="ghost" onClick={() => setShowParticipantsModal(true)} icon={Icons.Eye} style={{ padding: 'clamp(12px, 2vw, 20px) clamp(20px, 4vw, 40px)', fontSize: 'clamp(14px, 1.5vw, 18px)' }}>
                                        Show Participants ({participants.length})
                                    </NeoButton>
                                    <NeoButton className="host-btn" onClick={startQuizWithGuidelines} disabled={participants.length === 0} icon={Icons.Play} style={{ padding: 'clamp(12px, 2vw, 20px) clamp(30px, 5vw, 60px)', fontSize: 'clamp(14px, 1.5vw, 18px)' }}>START SESSION</NeoButton>
                                </div>
                            </div>
                        )}

                        {/* QUESTION / RESULTS STATE */}
                        {status !== 'lobby' && !showGuidelines && !showCountdown && (
                            <div className="host-question-content" style={{ flex: 1, padding: 'clamp(20px, 4vw, 50px)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                                
                                {showResults ? (
                                    /* RESULTS VIEW */
                                    <div className="animate-enter host-results-view" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px, 4vw, 40px)', flexWrap: 'wrap', gap: '16px' }}>
                                            <h2 style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700, margin: 0 }}>Distribution Analysis</h2>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'clamp(6px, 1vw, 10px) clamp(12px, 2vw, 24px)', borderRadius: '100px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', fontSize: 'clamp(12px, 1.5vw, 16px)' }}>
                                                {answerStats?.answered || 0} Total Responses
                                            </div>
                                        </div>

                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2vw, 24px)', justifyContent: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                                            {currentQuestion?.options.map((opt, i) => {
                                                const isCorrect = correctAnswer?.includes(opt.option_id);
                                                const count = answerStats?.optionCounts[opt.option_id] || 0;
                                                const total = answerStats?.answered || 1;
                                                const percent = Math.round((count / total) * 100);

                                                return (
                                                    <div key={opt.option_id} style={{ position: 'relative' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'clamp(8px, 1vw, 12px)', fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: 500, flexWrap: 'wrap', gap: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1vw, 16px)', color: isCorrect ? THEME.colors.brand.green : 'inherit', flex: 1, minWidth: 0 }}>
                                                                {isCorrect && <div style={{ color: THEME.colors.brand.green, flexShrink: 0 }}><Icons.Check /></div>} 
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.text}</span>
                                                            </div>
                                                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, flexShrink: 0 }}>{percent}%</div>
                                                        </div>
                                                        <div style={{ height: 'clamp(24px, 3vw, 32px)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                                            <div style={{
                                                                height: '100%', width: `${percent}%`,
                                                                background: isCorrect ? THEME.gradients.success : THEME.gradients.primary,
                                                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                position: 'relative',
                                                                borderRadius: '8px',
                                                                boxShadow: isCorrect ? `0 0 20px ${THEME.colors.brand.greenGlow}` : 'none'
                                                            }}>
                                                                {/* Stripe Animation */}
                                                                <div style={{
                                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                                    backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.1) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.1) 75%,transparent 75%,transparent)',
                                                                    backgroundSize: '20px 20px',
                                                                    animation: 'shimmer 2s linear infinite'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ marginTop: 'clamp(24px, 4vw, 60px)', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                            {!showLeaderboardOverlay ? (
                                                /* Show Reveal Leaderboard button first */
                                                <NeoButton className="host-btn" onClick={onRevealLeaderboard} icon={Icons.Trophy} variant="primary">
                                                    Reveal Leaderboard
                                                </NeoButton>
                                            ) : (
                                                /* After leaderboard is revealed, show Next Question or Finalize */
                                                questionIndex < totalQuestions - 1 ? (
                                                    <NeoButton className="host-btn" onClick={onNext} icon={Icons.Play}>Next Question</NeoButton>
                                                ) : (
                                                    <NeoButton className="host-btn" onClick={onEnd} variant="success" icon={Icons.Trophy}>Finalize Quiz</NeoButton>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* QUESTION VIEW */
                                    <div className="animate-enter host-question-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(20px, 4vw, 60px)', padding: 'clamp(12px, 2vw, 20px)' }}>
                                        {/* Timer Column - Desktop */}
                                        <div className="host-timer-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: 'clamp(20px, 4vw, 60px)' }}>
                                            <ReactorTimer timeRemaining={timeRemaining} totalTime={timeLimit || 30} />
                                            <div style={{ flex: 1 }} />
                                            <NeoButton className="host-btn" onClick={() => skipTimer(sessionCode)} variant="ghost" style={{ width: '100%' }} icon={Icons.Skip}>
                                                SKIP TIMER
                                            </NeoButton>
                                        </div>

                                        {/* Content Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                            {/* Mobile Timer - Shows on small screens when column is hidden */}
                                            <div className="host-timer-mobile" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px', padding: '12px', background: 'rgba(66, 133, 244, 0.1)', borderRadius: '12px', border: '1px solid rgba(66, 133, 244, 0.3)' }}>
                                                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk', color: timeRemaining <= 5 ? '#EA4335' : '#4285F4' }}>
                                                    {timeRemaining}s
                                                </div>
                                                <NeoButton className="host-btn" onClick={() => skipTimer(sessionCode)} variant="ghost" icon={Icons.Skip} style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                    SKIP
                                                </NeoButton>
                                            </div>
                                            
                                            {currentQuestion?.image && (
                                                <div style={{ height: 'clamp(150px, 25vh, 250px)', marginBottom: '24px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'black' }}>
                                                    <img src={currentQuestion.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                            
                                            <h2 className="host-question-text" style={{ fontSize: 'clamp(20px, 3vw, 42px)', fontWeight: 700, lineHeight: 1.3, marginBottom: '24px' }}>
                                                {currentQuestion?.question_text || "Initializing data stream..."}
                                            </h2>

                                            <div className="host-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                                {currentQuestion?.options.map((opt, i) => (
                                                    <div key={opt.option_id} className="animate-enter" style={{ animationDelay: `${i*0.1}s` }}>
                                                        <GlassCard hoverEffect style={{ padding: 'clamp(16px, 2vw, 28px)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
                                                            <div style={{ 
                                                                width: 'clamp(44px, 4vw, 56px)', height: 'clamp(44px, 4vw, 56px)', borderRadius: '14px', flexShrink: 0,
                                                                background: [THEME.gradients.primary, THEME.gradients.danger, THEME.gradients.warning, THEME.gradients.success][i % 4],
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'clamp(16px, 1.8vw, 22px)', color: '#000'
                                                            }}>
                                                                {['A','B','C','D'][i]}
                                                            </div>
                                                            <span style={{ fontSize: 'clamp(16px, 1.8vw, 22px)', fontWeight: 500 }}>{opt.text}</span>
                                                        </GlassCard>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </section>

                {/* LEADERBOARD SIDEBAR - Hidden, no longer showing constantly */}
            </main>

            {/* FULLSCREEN LEADERBOARD OVERLAY - Shows only when "Reveal Leaderboard" is clicked */}
            {showLeaderboardOverlay && showResults && (
                <div style={{
                    position: 'fixed', inset: 0, 
                    background: 'linear-gradient(180deg, #2D2A5E 0%, #1E1B4B 40%, #0F0D2A 100%)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, 
                    padding: 'clamp(16px, 2vw, 32px)',
                    animation: 'fadeIn 0.5s ease',
                    overflow: 'hidden'
                }}>
                    {/* Radial Light Rays Background */}
                    <div style={{ 
                        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
                    }}>
                        {/* Central glow */}
                        <div style={{
                            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
                            width: '80%', height: '50%',
                            background: 'radial-gradient(ellipse at center, rgba(120,100,220,0.25) 0%, transparent 70%)',
                        }} />
                        {/* Light rays */}
                        {[...Array(16)].map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', top: '25%', left: '50%',
                                width: '2px', height: '55%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                                transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
                                transformOrigin: 'top center'
                            }} />
                        ))}
                        {/* Sparkle stars */}
                        {[...Array(30)].map((_, i) => (
                            <div key={`star-${i}`} style={{
                                position: 'absolute',
                                top: `${5 + Math.random() * 60}%`,
                                left: `${5 + Math.random() * 90}%`,
                                width: `${3 + Math.random() * 3}px`, 
                                height: `${3 + Math.random() * 3}px`,
                                background: 'white',
                                borderRadius: '50%',
                                opacity: 0.2 + Math.random() * 0.5,
                                animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 3}s`
                            }} />
                        ))}
                    </div>

                    <div style={{
                        width: '100%', maxWidth: '900px', height: '100%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        overflow: 'hidden', position: 'relative', zIndex: 1
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 3vh, 28px)', flexShrink: 0 }}>
                            <h1 style={{ 
                                margin: 0, fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900,
                                color: 'white', letterSpacing: '0.08em',
                                fontStyle: 'italic',
                                textShadow: '0 4px 30px rgba(255,255,255,0.2)'
                            }}>
                                LEADERBOARD
                            </h1>
                        </div>

                        {/* TOP 3 PODIUM */}
                        {leaderboard.length >= 1 && (
                            <div style={{ 
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', 
                                gap: 'clamp(16px, 4vw, 48px)', marginBottom: 'clamp(24px, 4vh, 40px)', 
                                width: '100%', maxWidth: '700px', flexShrink: 0,
                                padding: '0 16px'
                            }}>
                                {/* 2nd Place */}
                                {leaderboard[1] && (
                                    <div className="animate-enter" style={{ 
                                        animationDelay: '0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        flex: 1, maxWidth: '180px'
                                    }}>
                                        {/* Rank Label */}
                                        <div style={{ 
                                            fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 800, 
                                            color: '#E0E0E0', marginBottom: '12px',
                                            fontFamily: 'Space Grotesk'
                                        }}>2<sup style={{ fontSize: '0.55em', verticalAlign: 'super' }}>nd</sup></div>
                                        
                                        {/* Avatar with SVG laurel wreath */}
                                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                                            {/* Left Laurel SVG */}
                                            <svg style={{ position: 'absolute', left: '-28px', top: '50%', transform: 'translateY(-50%)', width: 'clamp(28px, 4vw, 40px)', height: 'clamp(56px, 8vw, 80px)' }} viewBox="0 0 30 60" fill="none">
                                                <path d="M25 10C20 12 18 18 18 25C18 18 15 12 10 10C15 12 18 8 20 3C18 8 20 12 25 10Z" fill="#C0C0C0" opacity="0.9"/>
                                                <path d="M25 22C20 24 18 30 18 37C18 30 15 24 10 22C15 24 18 20 20 15C18 20 20 24 25 22Z" fill="#C0C0C0" opacity="0.8"/>
                                                <path d="M25 34C20 36 18 42 18 49C18 42 15 36 10 34C15 36 18 32 20 27C18 32 20 36 25 34Z" fill="#C0C0C0" opacity="0.7"/>
                                                <path d="M22 46C18 48 16 52 16 57C16 52 14 48 10 46C14 48 16 45 17 41C16 45 18 48 22 46Z" fill="#C0C0C0" opacity="0.6"/>
                                            </svg>
                                            {/* Right Laurel SVG */}
                                            <svg style={{ position: 'absolute', right: '-28px', top: '50%', transform: 'translateY(-50%) scaleX(-1)', width: 'clamp(28px, 4vw, 40px)', height: 'clamp(56px, 8vw, 80px)' }} viewBox="0 0 30 60" fill="none">
                                                <path d="M25 10C20 12 18 18 18 25C18 18 15 12 10 10C15 12 18 8 20 3C18 8 20 12 25 10Z" fill="#C0C0C0" opacity="0.9"/>
                                                <path d="M25 22C20 24 18 30 18 37C18 30 15 24 10 22C15 24 18 20 20 15C18 20 20 24 25 22Z" fill="#C0C0C0" opacity="0.8"/>
                                                <path d="M25 34C20 36 18 42 18 49C18 42 15 36 10 34C15 36 18 32 20 27C18 32 20 36 25 34Z" fill="#C0C0C0" opacity="0.7"/>
                                                <path d="M22 46C18 48 16 52 16 57C16 52 14 48 10 46C14 48 16 45 17 41C16 45 18 48 22 46Z" fill="#C0C0C0" opacity="0.6"/>
                                            </svg>
                                            
                                            <div style={{
                                                width: 'clamp(70px, 12vw, 100px)', height: 'clamp(70px, 12vw, 100px)',
                                                borderRadius: '50%', padding: '4px',
                                                background: 'linear-gradient(135deg, #F0F0F0 0%, #C0C0C0 50%, #A8A8A8 100%)',
                                                boxShadow: '0 8px 32px rgba(192,192,192,0.4), 0 0 20px rgba(255,255,255,0.1)'
                                            }}>
                                                {leaderboard[1].userPhoto ? (
                                                    <img src={leaderboard[1].userPhoto} style={{ 
                                                        width: '100%', height: '100%', borderRadius: '50%', 
                                                        objectFit: 'cover', display: 'block'
                                                    }} />
                                                ) : (
                                                    <div style={{ 
                                                        width: '100%', height: '100%', borderRadius: '50%', 
                                                        background: 'linear-gradient(135deg, #9B8AC4 0%, #7B6AA4 100%)', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                        fontWeight: 800, color: 'white', fontSize: 'clamp(28px, 5vw, 40px)'
                                                    }}>{leaderboard[1].userName?.[0]}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Name & Score */}
                                        <div style={{ 
                                            fontSize: 'clamp(13px, 1.6vw, 18px)', fontWeight: 600, 
                                            color: 'white', marginBottom: '6px', textAlign: 'center',
                                            maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>{leaderboard[1].userName}</div>
                                        <div style={{ 
                                            fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, 
                                            color: '#E0E0E0', fontFamily: 'Space Grotesk'
                                        }}>{leaderboard[1].score}</div>
                                    </div>
                                )}
                                
                                {/* 1st Place - Champion */}
                                <div className="animate-enter" style={{ 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    flex: 1.3, maxWidth: '220px', marginTop: '-20px'
                                }}>
                                    {/* Rank with Trophy */}
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'
                                    }}>
                                        <div style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, color: '#FFD700', fontFamily: 'Space Grotesk' }}>
                                            1<sup style={{ fontSize: '0.55em', verticalAlign: 'super' }}>st</sup>
                                        </div>
                                        {/* Trophy SVG */}
                                        <svg style={{ width: 'clamp(32px, 5vw, 48px)', height: 'clamp(32px, 5vw, 48px)' }} viewBox="0 0 48 48" fill="none">
                                            <path d="M14 8H34V12C34 18 30 24 24 26C18 24 14 18 14 12V8Z" fill="url(#trophy-gold)"/>
                                            <path d="M10 8H14V14C10 14 8 12 8 10C8 9 9 8 10 8Z" fill="url(#trophy-gold)"/>
                                            <path d="M34 8H38C39 8 40 9 40 10C40 12 38 14 34 14V8Z" fill="url(#trophy-gold)"/>
                                            <path d="M20 26H28V30H20V26Z" fill="url(#trophy-gold)"/>
                                            <path d="M16 30H32V34C32 35 31 36 30 36H18C17 36 16 35 16 34V30Z" fill="url(#trophy-gold)"/>
                                            <path d="M14 36H34V40H14V36Z" fill="url(#trophy-gold)"/>
                                            <defs>
                                                <linearGradient id="trophy-gold" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFE55C"/>
                                                    <stop offset="0.5" stopColor="#FFD700"/>
                                                    <stop offset="1" stopColor="#FFA500"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    
                                    {/* Avatar with golden SVG laurel wreath */}
                                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                                        {/* Left Golden Laurel */}
                                        <svg style={{ position: 'absolute', left: '-36px', top: '50%', transform: 'translateY(-50%)', width: 'clamp(36px, 5vw, 52px)', height: 'clamp(72px, 10vw, 104px)' }} viewBox="0 0 30 60" fill="none">
                                            <path d="M25 8C19 10 17 17 17 25C17 17 13 10 7 8C13 10 17 6 19 0C17 6 19 10 25 8Z" fill="url(#laurel-gold)" opacity="1"/>
                                            <path d="M25 20C19 22 17 29 17 37C17 29 13 22 7 20C13 22 17 18 19 12C17 18 19 22 25 20Z" fill="url(#laurel-gold)" opacity="0.9"/>
                                            <path d="M25 32C19 34 17 41 17 49C17 41 13 34 7 32C13 34 17 30 19 24C17 30 19 34 25 32Z" fill="url(#laurel-gold)" opacity="0.8"/>
                                            <path d="M23 44C18 46 16 51 16 57C16 51 13 46 8 44C13 46 16 43 17 38C16 43 18 46 23 44Z" fill="url(#laurel-gold)" opacity="0.7"/>
                                            <defs>
                                                <linearGradient id="laurel-gold" x1="16" y1="0" x2="16" y2="60" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFE55C"/>
                                                    <stop offset="0.5" stopColor="#FFD700"/>
                                                    <stop offset="1" stopColor="#DAA520"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {/* Right Golden Laurel */}
                                        <svg style={{ position: 'absolute', right: '-36px', top: '50%', transform: 'translateY(-50%) scaleX(-1)', width: 'clamp(36px, 5vw, 52px)', height: 'clamp(72px, 10vw, 104px)' }} viewBox="0 0 30 60" fill="none">
                                            <path d="M25 8C19 10 17 17 17 25C17 17 13 10 7 8C13 10 17 6 19 0C17 6 19 10 25 8Z" fill="#FFD700" opacity="1"/>
                                            <path d="M25 20C19 22 17 29 17 37C17 29 13 22 7 20C13 22 17 18 19 12C17 18 19 22 25 20Z" fill="#FFD700" opacity="0.9"/>
                                            <path d="M25 32C19 34 17 41 17 49C17 41 13 34 7 32C13 34 17 30 19 24C17 30 19 34 25 32Z" fill="#FFD700" opacity="0.8"/>
                                            <path d="M23 44C18 46 16 51 16 57C16 51 13 46 8 44C13 46 16 43 17 38C16 43 18 46 23 44Z" fill="#FFD700" opacity="0.7"/>
                                        </svg>
                                        
                                        <div style={{
                                            width: 'clamp(90px, 16vw, 130px)', height: 'clamp(90px, 16vw, 130px)',
                                            borderRadius: '50%', padding: '5px',
                                            background: 'linear-gradient(135deg, #FFE55C 0%, #FFD700 30%, #FFA500 70%, #FFD700 100%)',
                                            boxShadow: '0 0 50px rgba(255,215,0,0.5), 0 12px 40px rgba(0,0,0,0.3)'
                                        }}>
                                            {leaderboard[0]?.userPhoto ? (
                                                <img src={leaderboard[0].userPhoto} style={{ 
                                                    width: '100%', height: '100%', borderRadius: '50%', 
                                                    objectFit: 'cover', display: 'block'
                                                }} />
                                            ) : (
                                                <div style={{ 
                                                    width: '100%', height: '100%', borderRadius: '50%', 
                                                    background: 'linear-gradient(135deg, #E8738C 0%, #C95A6D 100%)', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    fontWeight: 800, color: 'white', fontSize: 'clamp(36px, 6vw, 52px)'
                                                }}>{leaderboard[0]?.userName?.[0]}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Name & Score */}
                                    <div style={{ 
                                        fontSize: 'clamp(15px, 2vw, 22px)', fontWeight: 700, 
                                        color: 'white', marginBottom: '6px', textAlign: 'center',
                                        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>{leaderboard[0]?.userName}</div>
                                    <div style={{ 
                                        fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, 
                                        color: '#FFD700', fontFamily: 'Space Grotesk',
                                        textShadow: '0 0 30px rgba(255,215,0,0.4)'
                                    }}>{leaderboard[0]?.score}</div>
                                </div>
                                
                                {/* 3rd Place */}
                                {leaderboard[2] && (
                                    <div className="animate-enter" style={{ 
                                        animationDelay: '0.3s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        flex: 1, maxWidth: '180px'
                                    }}>
                                        {/* Rank Label */}
                                        <div style={{ 
                                            fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 800, 
                                            color: '#CD7F32', marginBottom: '12px',
                                            fontFamily: 'Space Grotesk'
                                        }}>3<sup style={{ fontSize: '0.55em', verticalAlign: 'super' }}>rd</sup></div>
                                        
                                        {/* Avatar with bronze SVG laurel wreath */}
                                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                                            {/* Left Bronze Laurel */}
                                            <svg style={{ position: 'absolute', left: '-24px', top: '50%', transform: 'translateY(-50%)', width: 'clamp(24px, 3.5vw, 36px)', height: 'clamp(48px, 7vw, 72px)' }} viewBox="0 0 30 60" fill="none">
                                                <path d="M25 10C20 12 18 18 18 25C18 18 15 12 10 10C15 12 18 8 20 3C18 8 20 12 25 10Z" fill="#CD7F32" opacity="0.9"/>
                                                <path d="M25 22C20 24 18 30 18 37C18 30 15 24 10 22C15 24 18 20 20 15C18 20 20 24 25 22Z" fill="#CD7F32" opacity="0.8"/>
                                                <path d="M25 34C20 36 18 42 18 49C18 42 15 36 10 34C15 36 18 32 20 27C18 32 20 36 25 34Z" fill="#CD7F32" opacity="0.7"/>
                                                <path d="M22 46C18 48 16 52 16 57C16 52 14 48 10 46C14 48 16 45 17 41C16 45 18 48 22 46Z" fill="#CD7F32" opacity="0.6"/>
                                            </svg>
                                            {/* Right Bronze Laurel */}
                                            <svg style={{ position: 'absolute', right: '-24px', top: '50%', transform: 'translateY(-50%) scaleX(-1)', width: 'clamp(24px, 3.5vw, 36px)', height: 'clamp(48px, 7vw, 72px)' }} viewBox="0 0 30 60" fill="none">
                                                <path d="M25 10C20 12 18 18 18 25C18 18 15 12 10 10C15 12 18 8 20 3C18 8 20 12 25 10Z" fill="#CD7F32" opacity="0.9"/>
                                                <path d="M25 22C20 24 18 30 18 37C18 30 15 24 10 22C15 24 18 20 20 15C18 20 20 24 25 22Z" fill="#CD7F32" opacity="0.8"/>
                                                <path d="M25 34C20 36 18 42 18 49C18 42 15 36 10 34C15 36 18 32 20 27C18 32 20 36 25 34Z" fill="#CD7F32" opacity="0.7"/>
                                                <path d="M22 46C18 48 16 52 16 57C16 52 14 48 10 46C14 48 16 45 17 41C16 45 18 48 22 46Z" fill="#CD7F32" opacity="0.6"/>
                                            </svg>
                                            
                                            <div style={{
                                                width: 'clamp(64px, 11vw, 90px)', height: 'clamp(64px, 11vw, 90px)',
                                                borderRadius: '50%', padding: '4px',
                                                background: 'linear-gradient(135deg, #DDA15E 0%, #CD7F32 50%, #A0522D 100%)',
                                                boxShadow: '0 8px 32px rgba(205,127,50,0.4), 0 0 20px rgba(205,127,50,0.2)'
                                            }}>
                                                {leaderboard[2].userPhoto ? (
                                                    <img src={leaderboard[2].userPhoto} style={{ 
                                                        width: '100%', height: '100%', borderRadius: '50%', 
                                                        objectFit: 'cover', display: 'block'
                                                    }} />
                                                ) : (
                                                    <div style={{ 
                                                        width: '100%', height: '100%', borderRadius: '50%', 
                                                        background: 'linear-gradient(135deg, #9B8AC4 0%, #7B6AA4 100%)', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                        fontWeight: 800, color: 'white', fontSize: 'clamp(24px, 4.5vw, 36px)'
                                                    }}>{leaderboard[2].userName?.[0]}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Name & Score */}
                                        <div style={{ 
                                            fontSize: 'clamp(13px, 1.6vw, 18px)', fontWeight: 600, 
                                            color: 'white', marginBottom: '6px', textAlign: 'center',
                                            maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>{leaderboard[2].userName}</div>
                                        <div style={{ 
                                            fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, 
                                            color: '#CD7F32', fontFamily: 'Space Grotesk'
                                        }}>{leaderboard[2].score}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REMAINING PARTICIPANTS - Two Column Layout */}
                        {leaderboard.length > 3 && (
                            <div style={{ 
                                flex: 1, width: '100%', maxWidth: '750px', overflow: 'hidden',
                                display: 'flex', flexDirection: 'column'
                            }}>
                                <div style={{ 
                                    flex: 1, overflow: 'auto', padding: '0 clamp(8px, 2vw, 20px)'
                                }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: 'clamp(10px, 1.5vw, 16px)'
                                    }}>
                                        {leaderboard.slice(3).map((entry, idx) => {
                                            const actualRank = idx + 4;
                                            return (
                                                <div 
                                                    key={entry.oderId || idx} 
                                                    className="animate-enter" 
                                                    style={{ 
                                                        animationDelay: `${idx * 0.03}s`,
                                                        display: 'flex', alignItems: 'center', 
                                                        padding: 'clamp(10px, 1.3vw, 16px) clamp(14px, 1.8vw, 22px)', 
                                                        borderRadius: '50px',
                                                        background: 'linear-gradient(135deg, rgba(120,100,180,0.35) 0%, rgba(100,80,160,0.2) 100%)',
                                                        border: '1px solid rgba(140,120,200,0.25)',
                                                        backdropFilter: 'blur(4px)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {/* Rank */}
                                                    <div style={{ 
                                                        minWidth: 'clamp(36px, 4.5vw, 50px)',
                                                        fontSize: 'clamp(14px, 1.6vw, 19px)', 
                                                        fontWeight: 800, color: 'rgba(255,255,255,0.8)',
                                                        fontFamily: 'Space Grotesk'
                                                    }}>
                                                        {actualRank}<sup style={{ fontSize: '0.55em', verticalAlign: 'super' }}>th</sup>
                                                    </div>
                                                    
                                                    {/* Avatar */}
                                                    {entry.userPhoto ? (
                                                        <img src={entry.userPhoto} style={{ 
                                                            width: 'clamp(36px, 4.5vw, 48px)', height: 'clamp(36px, 4.5vw, 48px)', 
                                                            borderRadius: '50%', marginRight: 'clamp(10px, 1.2vw, 14px)', 
                                                            objectFit: 'cover', flexShrink: 0,
                                                            border: '2px solid rgba(255,255,255,0.25)'
                                                        }} />
                                                    ) : (
                                                        <div style={{ 
                                                            width: 'clamp(36px, 4.5vw, 48px)', height: 'clamp(36px, 4.5vw, 48px)', 
                                                            borderRadius: '50%', 
                                                            background: 'linear-gradient(135deg, #9B8AC4 0%, #7B6AA4 100%)', 
                                                            marginRight: 'clamp(10px, 1.2vw, 14px)', flexShrink: 0, 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                            fontSize: 'clamp(14px, 1.6vw, 18px)', fontWeight: 700, color: 'white',
                                                            border: '2px solid rgba(255,255,255,0.25)'
                                                        }}>{entry.userName?.[0]}</div>
                                                    )}
                                                    
                                                    {/* Name */}
                                                    <div style={{ 
                                                        flex: 1, minWidth: 0,
                                                        fontWeight: 600, fontSize: 'clamp(13px, 1.5vw, 17px)', 
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        color: 'white'
                                                    }}>{entry.userName}</div>
                                                    
                                                    {/* Score */}
                                                    <div style={{ 
                                                        fontFamily: 'Space Grotesk', fontWeight: 800, 
                                                        fontSize: 'clamp(16px, 2vw, 24px)', 
                                                        color: 'white', 
                                                        marginLeft: 'clamp(10px, 1.2vw, 14px)', flexShrink: 0
                                                    }}>
                                                        {entry.score}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ 
                            marginTop: 'clamp(20px, 3vh, 32px)', display: 'flex', gap: '16px', 
                            flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0
                        }}>
                            {questionIndex < totalQuestions - 1 ? (
                                <NeoButton className="host-btn" onClick={onNext} icon={Icons.Play} style={{ 
                                    padding: 'clamp(16px, 2vw, 22px) clamp(40px, 5vw, 70px)', 
                                    fontSize: 'clamp(15px, 1.7vw, 19px)',
                                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                                    boxShadow: '0 8px 32px rgba(66,133,244,0.4)'
                                }}>
                                    Next Question
                                </NeoButton>
                            ) : (
                                <NeoButton className="host-btn" onClick={onEnd} variant="success" icon={Icons.Trophy} style={{ 
                                    padding: 'clamp(16px, 2vw, 22px) clamp(40px, 5vw, 70px)', 
                                    fontSize: 'clamp(15px, 1.7vw, 19px)',
                                    background: 'linear-gradient(135deg, #FBBC05 0%, #34A853 100%)',
                                    boxShadow: '0 8px 32px rgba(251,188,5,0.4)'
                                }}>
                                    Finalize Quiz
                                </NeoButton>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* PARTICIPANTS MODAL */}
            {showParticipantsModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={() => setShowParticipantsModal(false)}>
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.98) 0%, rgba(15, 15, 15, 0.98) 100%)',
                            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                            width: '100%', maxWidth: '700px', maxHeight: '80vh',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Icons.Users />
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Participants</h3>
                                <span style={{
                                    background: THEME.gradients.primary, padding: '4px 12px',
                                    borderRadius: '100px', fontSize: '13px', fontWeight: 700
                                }}>{participants.length} joined</span>
                            </div>
                            <button 
                                onClick={() => setShowParticipantsModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'white', transition: 'all 0.2s'
                                }}
                            >
                                <Icons.Close />
                            </button>
                        </div>
                        
                        {/* Modal Body - Participants Grid */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '24px 30px' }}>
                            {participants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
                                    <Icons.Loader style={{ animation: 'spin-slow 2s linear infinite', marginBottom: '16px' }} />
                                    <p>Waiting for participants to join...</p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {participants.map((p, i) => (
                                        <div key={p.oderId || i} className="animate-enter" style={{
                                            animationDelay: `${i * 0.05}s`,
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            background: 'rgba(255,255,255,0.03)', padding: '16px',
                                            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {p.userPhoto ? (
                                                <img src={p.userPhoto} style={{
                                                    width: '48px', height: '48px', borderRadius: '50%',
                                                    border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover'
                                                }} alt={p.userName} />
                                            ) : (
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '50%',
                                                    background: THEME.gradients.primary, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold', fontSize: '18px'
                                                }}>{p.userName?.[0] || '?'}</div>
                                            )}
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{
                                                    fontWeight: 600, fontSize: '14px',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>{p.userName}</div>
                                                <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
                                                    #{i + 1} in queue
                                                </div>
                                            </div>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: THEME.colors.brand.green,
                                                boxShadow: `0 0 10px ${THEME.colors.brand.greenGlow}`
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1
    },
    fullCenter: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
    },
    header: {
        height: '140px', // Increased height for much larger logo
        padding: '0 50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(5, 5, 5, 0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${THEME.colors.border}`,
        zIndex: 20
    },
    mainGrid: {
        flex: 1,
        padding: '40px 50px',
        display: 'flex',
        gap: '40px',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
    }
};

export default LiveQuizHostPage;