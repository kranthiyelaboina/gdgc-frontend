import React, { createContext, useContext, useEffect, useReducer, useState, useCallback, memo, useRef } from 'react';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { Logo } from '../assets';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ============================================
// CSS STYLES (Original + Live mode additions)
// ============================================
const quizStyles = `
    .page-with-layout { display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%); position: relative; overflow: hidden; }
    .scorecard-main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 120px 20px 80px; font-family: 'Poppins', sans-serif; position: relative; z-index: 2; }
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
    :root { --primary-blue: #4285F4; --alert-red: #EA4335; --warning-yellow: #FBBC05; --success-green: #34A853; --text-dark: #202124; --text-light: #5f6368; --dark-bg: #0a0e27; --card-bg: #1a1f3a; }
    
    .professional-certificate { background: #ffffff; width: 650px; height: 450px; position: relative; overflow: hidden; animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05); border-radius: 8px; }
    .cert-watermark { position: absolute; top: 50%; left: 55%; transform: translate(-50%, -50%); width: 380px; height: 380px; pointer-events: none; z-index: 0; }
    .watermark-logo { width: 100%; height: 100%; object-fit: contain; opacity: 0.07; }
    .cert-left-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 80px; background: linear-gradient(180deg, #4285F4 0%, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%, #34A853 100%); z-index: 1; }
    .cert-logo-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 10px 10px 6px 10px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.15); width: 72px; }
    .cert-logo { width: 58px; height: 58px; display: block; margin: 0 auto; }
    .cert-org-text { display: block; text-align: center; margin-top: 6px; }
    .cert-org-text .org-name { display: block; font-size: 11px; font-weight: 800; color: #202124; letter-spacing: 0.5px; line-height: 1.2; }
    .cert-org-text .org-sub { display: block; font-size: 9px; font-weight: 600; color: #5f6368; line-height: 1.2; }
    .cert-main-content { position: absolute; left: 90px; top: 0; right: 0; bottom: 0; padding: 15px 15px; z-index: 1; }
    .cert-header-row { position: relative; margin-bottom: 10px; min-height: 70px; }
    .cert-title-block { display: inline-block; vertical-align: top; }
    .cert-title { font-size: 38px; font-weight: 800; color: #202124; letter-spacing: 6px; margin: 0; line-height: 1; }
    .cert-subtitle { font-size: 15px; font-weight: 600; color: #5f6368; letter-spacing: 4px; margin: 8px 0 0 0; }
    .cert-award-badge { position: absolute; top: -5px; right: 5px; }
    .badge-svg { display: block; }
    .cert-body { display: block; }
    .cert-present-text { font-size: 12px; font-style: italic; color: #5f6368; margin: 0 0 8px 0; }
    .cert-recipient { position: relative; margin-bottom: 8px; }
    .cert-user-photo-wrapper { display: inline-block; vertical-align: middle; margin-right: 12px; }
    .cert-recipient-details { display: inline-block; vertical-align: middle; }
    .cert-user-photo { width: 52px; height: 52px; border-radius: 50%; border: 3px solid #EA4335; object-fit: cover; box-shadow: 0 3px 12px rgba(234, 67, 53, 0.25); }
    .cert-user-avatar { width: 52px; height: 52px; border-radius: 50%; border: 3px solid #EA4335; background: linear-gradient(135deg, #EA4335 0%, #FBBC05 100%); color: white; font-size: 22px; font-weight: 700; text-align: center; line-height: 46px; box-shadow: 0 3px 12px rgba(234, 67, 53, 0.25); }
    .cert-user-name { font-size: 20px; font-weight: 700; color: #202124; line-height: 1.2; margin: 0; }
    .cert-user-rollno { font-size: 11px; font-weight: 600; color: #5f6368; margin-top: 2px; letter-spacing: 0.5px; }
    .cert-achievement-text { font-size: 12px; color: #5f6368; margin: 0 0 4px 0; }
    .cert-achievement-text strong { color: #202124; }
    .cert-score-text { font-size: 12px; color: #5f6368; margin: 0; }
    .cert-score-text strong { color: #4285F4; font-weight: 700; }
    .cert-signature-row { position: absolute; bottom: 42px; left: 90px; right: 15px; padding-top: 6px; border-top: 1px solid #e8eaed; }
    .cert-signature-block { display: inline-block; text-align: center; vertical-align: top; width: 48%; }
    .signature-line { font-size: 13px; font-weight: 700; color: #202124; padding-bottom: 3px; border-bottom: 2px solid #202124; display: inline-block; min-width: 120px; text-align: center; }
    .signature-name { display: block; font-size: 9px; font-weight: 600; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
    .signature-title { display: block; font-size: 7px; font-weight: 500; color: #9aa0a6; text-transform: uppercase; letter-spacing: 0.5px; }
    .cert-footer-row { position: absolute; bottom: 6px; left: 90px; right: 15px; text-align: center; padding-top: 6px; border-top: 1px solid #e8eaed; }
    .cert-footer-center { display: inline-block; text-align: center; }
    .verified-badge-clean { display: inline-block; text-align: center; margin-bottom: 4px; padding-top: 2px; }
    .verified-logo { width: 22px; height: 22px; display: inline-block; vertical-align: middle; margin-right: 6px; margin-top: 2px; object-fit: contain; }
    .verified-text-clean { font-size: 13px; font-weight: 600; color: #34A853; letter-spacing: 0.5px; display: inline-block; vertical-align: middle; }
    .cert-date-display { font-size: 11px; font-weight: 500; color: #5f6368; letter-spacing: 0.3px; text-align: center; }
    
    @keyframes cardEntrance { 0% { opacity: 0; transform: scale(0.95) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    
    .scorecard-wrapper { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px; }
    .scorecard-actions { display: flex; gap: 16px; width: 100%; max-width: 700px; }
    .action-button { flex: 1; padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); display: flex; align-items: center; justify-content: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .button-icon { width: 18px; height: 18px; }
    .action-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); }
    .action-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .action-button.save { background: linear-gradient(135deg, #34A853 0%, #2d8f47 100%); color: white; }
    .action-button.save:hover { background: linear-gradient(135deg, #3cb15c 0%, #34A853 100%); }
    .action-button.share { background: linear-gradient(135deg, #0077B5 0%, #005582 100%); color: white; }
    .action-button.share:hover { background: linear-gradient(135deg, #0086cc 0%, #0077B5 100%); }
    .enhanced-score-card.error-card { background: linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%); border-radius: 16px; padding: 40px; text-align: center; color: #EA4335; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); }
    .enhanced-score-card.error-card h2 { font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #ffffff; }
    .enhanced-score-card.error-card p { font-size: 14px; color: #9aa0a6; line-height: 1.6; }

    .quiz-main-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; position: relative; overflow: hidden; background: url('/template.png'); background-size: cover; background-position: center; background-repeat: no-repeat; }
    @keyframes gradientAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .icon { width: 24px; height: 24px; }
    .icon.large { width: 48px; height: 48px; margin-bottom: 1rem; color: #EA4335; }
    
    .welcome-container { text-align: center; color: white; background: rgba(0, 0, 0, 0.25); border-radius: 24px; padding: clamp(2rem, 5vw, 3rem); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 700px; position: relative; min-height: 450px; display: flex; overflow: hidden; }
    .welcome-side { width: 100%; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: transform 0.5s ease-in-out, opacity 0.4s ease-in-out; opacity: 0; position: absolute; transform: translateX(100%); left: 0; top: 0; height: 100%; padding: 1.5rem; }
    .welcome-side:first-child { transform: translateX(-100%); }
    .welcome-side.active { opacity: 1; transform: translateX(0); position: relative; }
    .welcome-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin-bottom: 1rem; }
    .welcome-p { font-size: clamp(1rem, 2.5vw, 1.1rem); opacity: 0.9; margin: 1rem auto 2rem; line-height: 1.7; max-width: 500px; }
    .welcome-actions { display: flex; gap: 1rem; margin-top: 1.5rem; width: 100%; justify-content: center; flex-wrap: wrap; }
    .welcome-button { font-weight: 600; padding: 14px 28px; border-radius: 999px; font-size: 1.1rem; border: none; cursor: pointer; background: white; color: var(--primary-blue); box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.2s ease; }
    .welcome-button:hover { transform: translateY(-3px); box-shadow: 0 7px 20px rgba(0,0,0,0.25); }
    .welcome-button.secondary { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); }
    .guidelines-list { list-style: none; padding: 0; margin: 1.5rem 0; text-align: left; display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 450px; }
    .guideline-item { display: flex; align-items: center; gap: 1rem; background: rgba(0,0,0,0.2); padding: 0.8rem 1.2rem; border-radius: 12px; }
    .guideline-item .icon { flex-shrink: 0; color: var(--warning-yellow); }
    
    .countdown-screen { color: white; font-size: clamp(10rem, 40vw, 15rem); font-weight: 800; text-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: countdown-zoom 1s infinite ease-in-out; }
    @keyframes countdown-zoom { from { transform: scale(0.8); opacity: 0; } 40% { transform: scale(1.1); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }

    .quiz-interface { width: 100%; height: 100%; display: flex; flex-direction: column; padding: clamp(12px, 3vw, 24px); max-width: 1400px; margin: auto; animation: fadeIn 0.5s ease-out; gap: 12px; }
    .quiz-interface header, .quiz-interface footer { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; padding: 0 clamp(8px, 2vw, 16px); }
    .quiz-header-left { display: flex; align-items: center; gap: clamp(12px, 2vw, 20px); }
    .quiz-logo { height: clamp(60px, 8vw, 100px); width: auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); transition: transform 0.3s ease; position: absolute; left: 8px; top: -8px; z-index: 100; }
    .quiz-logo:hover { transform: scale(1.08); }
    .quiz-interface header h1 { font-weight: 600; font-size: clamp(1.1rem, 2.5vw, 1.4rem); color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.2); margin-left: clamp(100px, 15vw, 180px); }
    .quiz-interface main { flex-grow: 1; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 0; }
    
    .timer-container { font-weight: 600; padding: 10px 20px; border-radius: 999px; font-size: 1.2rem; background: rgba(0,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 8px; }
    .timer-container.timer-low { background: rgba(234, 67, 53, 0.3); border-color: #EA4335; animation: pulse 0.5s ease-in-out infinite; }
    
    .progress-bar-container { width: 100%; background: rgba(0,0,0,0.2); border-radius: 9999px; height: 10px; }
    .progress-bar-fill { background: white; height: 10px; border-radius: 9999px; transition: width 0.4s ease-in-out; }
    .question-meta { display: flex; justify-content: flex-end; align-items: center; padding: 0 clamp(8px, 2vw, 16px); flex-shrink: 0; }
    .question-counter { color: white; font-size: 1rem; font-weight: 500; }
    .question-counter span { opacity: 0.7; }
    
    .question-container { width: 100%; max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
    .question-card { position: relative; background: white; padding: clamp(24px, 5vw, 40px); border-radius: 24px; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12); text-align: left; width: 100%; overflow: hidden; padding-top: 50px; }
    .question-text { font-weight: 600; color: var(--text-dark); margin: 0; line-height: 1.7; font-size: clamp(1.1rem, 3vw, 1.5rem); }
    .question-type-tag { position: absolute; top: 0; right: 0; padding: 6px 16px; font-size: 0.85rem; font-weight: 600; color: white; border-top-right-radius: 24px; border-bottom-left-radius: 16px; }
    
    .options-grid { width: 100%; display: grid; gap: 16px; grid-template-columns: repeat(2, 1fr); }
    .options-grid.single-column { grid-template-columns: 1fr; }
    .option-card { background: white; padding: 20px; border-radius: 16px; border: 2px solid #e8eaed; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); display: flex; align-items: center; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .option-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-color: #d2e3fc; }
    .option-card.selected { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.25); transform: translateY(-4px); }
    .option-card.disabled { opacity: 0.7; cursor: not-allowed; }
    .option-card.disabled:hover { transform: none; }
    .option-prefix { background: #f1f3f4; color: var(--text-light); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 16px; flex-shrink: 0; font-size: 1rem; transition: all 0.2s ease; }
    .option-card.selected .option-prefix { background: var(--primary-blue); color: white; }
    .option-text { color: var(--text-dark); font-weight: 500; font-size: clamp(1rem, 2.5vw, 1.1rem); text-align: left; flex-grow: 1; line-height: 1.6; }
    
    .nav-button { font-weight: bold; padding: 14px 32px; border-radius: 12px; transition: all 0.2s ease; color: white; border: none; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .nav-button:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    .nav-button.disabled { cursor: not-allowed; opacity: 0.6; }
    .nav-button.prev { background-color: var(--alert-red); }
    .nav-button.next { background-color: var(--primary-blue); }
    .nav-button.submit { background-color: var(--success-green); }
    
    .submitting-card { background: white; color: var(--text-dark); border-radius: 24px; padding: clamp(2rem, 6vw, 4rem); text-align: center; }
    
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease; }
    .modal-content { background: white; padding: 32px; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 90%; max-width: 480px; transform: scale(0.95); animation: zoomIn 0.3s ease forwards; display: flex; flex-direction: column; align-items: center; }
    .modal-content h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-dark); }
    .modal-content p { margin-bottom: 1.5rem; color: var(--text-light); font-size: 1.1rem; line-height: 1.6; }
    .modal-actions { display: flex; gap: 16px; justify-content: center; width: 100%; }
    .modal-button { font-weight: bold; padding: 12px 28px; border-radius: 12px; border: none; cursor: pointer; font-size: 1rem; transition: transform 0.2s, box-shadow 0.2s; flex-grow: 1; max-width: 200px; }
    .modal-button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .modal-button.resume { background: #f1f3f4; color: var(--text-dark); }
    .submission-stats { width: 100%; max-width: 300px; margin-bottom: 1.5rem; text-align: left; }
    .submission-stats div { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
    .submission-stats span { font-weight: 600; font-size: 1rem; }
    .submission-stats .attempted { color: var(--success-green); }
    .submission-stats .unattempted { color: var(--alert-red); }
    
    .warning-toast { background: var(--alert-red); display: flex; align-items: center; gap: 16px; position: fixed; top: 32px; left: 50%; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 2000; font-size: 1.1rem; font-weight: 500; transform: translateX(-50%) translateY(-150%); transition: transform 0.4s ease-in-out; }
    .warning-toast.visible { transform: translateX(-50%) translateY(0); }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

    /* ============================================ */
    /* LIVE MODE SPECIFIC STYLES (NEW) */
    /* ============================================ */
    .live-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #EA4335 0%, #ff6b6b 100%); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; color: white; margin-bottom: 16px; animation: pulse 1.5s ease-in-out infinite; }
    .live-dot { width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulse 1s ease-in-out infinite; }
    .live-indicator { display: inline-flex; align-items: center; gap: 6px; background: rgba(234, 67, 53, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #EA4335; margin-left: 12px; }
    .live-indicator .live-dot { width: 8px; height: 8px; background: #EA4335; }
    
    .participants-count { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 16px; }
    .participants-count .icon { width: 20px; height: 20px; }
    
    .waiting-animation { display: flex; gap: 8px; margin-top: 24px; }
    .waiting-dot { width: 12px; height: 12px; background: white; border-radius: 50%; animation: waitingBounce 1.4s ease-in-out infinite; }
    .waiting-dot:nth-child(2) { animation-delay: 0.2s; }
    .waiting-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes waitingBounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
    
    .live-answered-indicator { display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(135deg, rgba(52, 168, 83, 0.2) 0%, rgba(52, 168, 83, 0.1) 100%); border: 1px solid rgba(52, 168, 83, 0.3); padding: 16px 24px; border-radius: 12px; color: #34A853; font-weight: 600; font-size: 16px; margin-top: 16px; }
    .live-answered-indicator .icon { width: 24px; height: 24px; color: #34A853; }
    
    .leaderboard-overlay { position: fixed; inset: 0; background: linear-gradient(120deg, #ffb3ba 0%, #ffffff 50%, #b3f5bc 100%); background-size: 200% 200%; animation: gradientShiftLeaderboard 15s ease infinite, fadeIn 0.5s ease; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 100; padding: 24px; overflow-y: auto; padding-top: 40px; }
    .results-row { display: flex; flex-direction: row; gap: 24px; align-items: stretch; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; width: 100%; max-width: 800px; }
    .leaderboard-overlay::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(255, 179, 186, 0.4) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(179, 245, 188, 0.3) 0%, transparent 70%), radial-gradient(circle at 50% 10%, rgba(249, 171, 0, 0.2) 0%, transparent 70%); pointer-events: none; }
    .leaderboard-overlay::after { content: ''; position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }
    @keyframes gradientShiftLeaderboard { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    
    .result-banner { text-align: center; margin-bottom: 0; padding: 24px 32px; border-radius: 20px; position: relative; z-index: 2; backdrop-filter: blur(10px); animation: resultSlideIn 0.5s ease-out; flex: 1; min-width: 200px; max-width: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    @keyframes resultSlideIn { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .result-banner.correct { background: linear-gradient(135deg, rgba(52, 168, 83, 0.2) 0%, rgba(52, 168, 83, 0.08) 100%); border: 2px solid rgba(52, 168, 83, 0.5); box-shadow: 0 10px 40px rgba(52, 168, 83, 0.2); }
    .result-banner.incorrect { background: linear-gradient(135deg, rgba(234, 67, 53, 0.2) 0%, rgba(234, 67, 53, 0.08) 100%); border: 2px solid rgba(234, 67, 53, 0.5); box-shadow: 0 10px 40px rgba(234, 67, 53, 0.2); }
    .result-emoji { font-size: 56px; margin-bottom: 12px; animation: emojiPop 0.5s ease-out 0.2s backwards; }
    @keyframes emojiPop { from { transform: scale(0) rotate(-20deg); } to { transform: scale(1) rotate(0deg); } }
    .result-banner h3 { color: #202124; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: 1px; }
    .result-banner p { color: rgba(0,0,0,0.8); font-size: 20px; margin: 0; font-weight: 600; }
    .result-banner.correct p { color: #34A853; }
    .result-banner.incorrect p { color: #EA4335; }
    
    .my-score-card { background: linear-gradient(135deg, rgba(66, 133, 244, 0.15) 0%, rgba(66, 133, 244, 0.05) 100%); border: 2px solid rgba(66, 133, 244, 0.4); border-radius: 20px; padding: 24px 32px; text-align: center; margin-bottom: 0; position: relative; z-index: 2; backdrop-filter: blur(10px); box-shadow: 0 10px 40px rgba(66, 133, 244, 0.15); animation: scoreCardSlide 0.5s ease-out 0.1s backwards; flex: 1; min-width: 200px; max-width: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    @keyframes scoreCardSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .score-label { color: rgba(0,0,0,0.6); font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; }
    .score-value { color: #202124; font-size: 56px; font-weight: 800; margin: 12px 0; font-family: 'Space Grotesk', 'Poppins', sans-serif; text-shadow: 0 4px 20px rgba(66, 133, 244, 0.2); }
    .rank-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, rgba(251, 188, 5, 0.3) 0%, rgba(251, 188, 5, 0.15) 100%); padding: 10px 20px; border-radius: 25px; color: #202124; font-weight: 700; border: 1px solid rgba(251, 188, 5, 0.4); box-shadow: 0 4px 15px rgba(251, 188, 5, 0.2); }
    .rank-emoji { font-size: 24px; }
    
    .leaderboard-header { text-align: center; margin-bottom: 24px; position: relative; z-index: 2; }
    .leaderboard-header h2 { color: #202124; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; text-shadow: 0 4px 20px rgba(251, 188, 5, 0.2); }
    .leaderboard-header p { color: rgba(0,0,0,0.5); font-size: 15px; margin: 0; letter-spacing: 1px; }
    
    .leaderboard-list { width: 100%; max-width: 550px; display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 2; max-height: 350px; overflow-y: auto; padding-right: 8px; }
    .leaderboard-item { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.6); padding: 14px 20px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(10px); transition: all 0.3s ease; animation: itemSlideIn 0.4s ease-out backwards; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .leaderboard-item:nth-child(1) { animation-delay: 0.1s; }
    .leaderboard-item:nth-child(2) { animation-delay: 0.15s; }
    .leaderboard-item:nth-child(3) { animation-delay: 0.2s; }
    .leaderboard-item:nth-child(4) { animation-delay: 0.25s; }
    .leaderboard-item:nth-child(5) { animation-delay: 0.3s; }
    @keyframes itemSlideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    .leaderboard-item.first { background: linear-gradient(135deg, rgba(251, 188, 4, 0.25) 0%, rgba(251, 188, 4, 0.1) 100%); border: 2px solid rgba(251, 188, 4, 0.5); box-shadow: 0 8px 30px rgba(251, 188, 4, 0.2); transform: scale(1.02); }
    .leaderboard-item.second { background: linear-gradient(135deg, rgba(192, 192, 192, 0.25) 0%, rgba(192, 192, 192, 0.1) 100%); border: 1px solid rgba(192, 192, 192, 0.5); }
    .leaderboard-item.third { background: linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.08) 100%); border: 1px solid rgba(205, 127, 50, 0.4); }
    .rank-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; background: rgba(0,0,0,0.1); font-size: 15px; flex-shrink: 0; }
    .rank-circle.rank-1 { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a1a1a; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4); }
    .rank-circle.rank-2 { background: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%); color: #1a1a1a; box-shadow: 0 4px 15px rgba(192, 192, 192, 0.4); }
    .rank-circle.rank-3 { background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%); box-shadow: 0 4px 15px rgba(205, 127, 50, 0.4); }
    .player-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
    .player-name { flex: 1; color: #202124; font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-score { color: #4285F4; font-weight: 800; font-size: 20px; font-family: 'Space Grotesk', 'Poppins', sans-serif; text-shadow: 0 2px 10px rgba(66, 133, 244, 0.2); }
    .leaderboard-item.first .player-score { color: #D97706; text-shadow: 0 2px 10px rgba(217, 119, 6, 0.3); }
    
    .next-question-timer { margin-top: 24px; text-align: center; position: relative; z-index: 2; }
    .next-question-timer p { color: rgba(0,0,0,0.5); font-size: 14px; margin: 0 0 8px 0; }
    .timer-bar { width: 200px; height: 4px; background: rgba(0,0,0,0.1); border-radius: 2px; margin: 0 auto; overflow: hidden; }
    .timer-bar-fill { height: 100%; background: linear-gradient(90deg, #4285F4, #34A853); border-radius: 2px; transition: width 0.5s linear; }

    /* ============================================ */
    /* LIVE LOBBY AND GUIDELINES STYLES (NEW) */
    /* ============================================ */
    .live-lobby-container { max-width: 600px; }
    .session-info-card { margin: 24px 0; }
    .session-code-badge { background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 16px 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
    .code-value { font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: 'Courier New', monospace; }
    .waiting-tip { margin-top: 24px; font-size: 14px; opacity: 0.8; background: rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 12px; }
    .leave-session-button { margin-top: 24px; padding: 12px 32px; background: rgba(234, 67, 53, 0.2); border: 2px solid rgba(234, 67, 53, 0.5); color: #EA4335; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .leave-session-button:hover { background: rgba(234, 67, 53, 0.3); transform: translateY(-2px); }
    
    .live-guidelines-container { max-width: 650px; }
    .guidelines-timer-badge { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #4285F4, #34A853); padding: 10px 20px; border-radius: 25px; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
    .guidelines-timer-badge .icon { width: 20px; height: 20px; }
    .live-guideline { background: rgba(66, 133, 244, 0.3); border: 1px solid rgba(66, 133, 244, 0.5); }
    .guidelines-progress { margin-top: 24px; height: 6px; background: rgba(255,255,255,0.2); }
    .guidelines-progress .progress-bar-fill { background: linear-gradient(90deg, #4285F4, #34A853); height: 6px; }

    @media (max-width: 900px) {
        .professional-certificate { aspect-ratio: auto; max-width: 100%; }
        .scorecard-actions { flex-direction: column; }
        .action-button { width: 100%; }
    }
    
    @media (max-width: 768px) { 
        .options-grid { grid-template-columns: 1fr !important; } 
        .quiz-interface footer { flex-direction: column-reverse; gap: 12px; } 
        .nav-button { width: 100%; }
        .quiz-logo { height: clamp(70px, 12vw, 100px); left: 0; top: 0; }
        .quiz-interface header h1 { margin-left: clamp(85px, 18vw, 120px); font-size: clamp(0.9rem, 2.2vw, 1.2rem); }
    }
`;

// ============================================
// ENHANCED LOBBY STYLES
// ============================================
const lobbyStyles = `
    .lobby-enhanced-container { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; overflow: hidden; background: linear-gradient(120deg, #ffb3ba 0%, #ffffff 50%, #b3f5bc 100%); background-size: 200% 200%; animation: lobbyGradient 15s ease infinite; }
    @keyframes lobbyGradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    
    .lobby-bg-layer { position: absolute; inset: 0; pointer-events: none; transition: background 0.3s ease; }
    
    .lobby-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .lobby-particle { position: absolute; bottom: -20px; left: var(--x); width: var(--size); height: var(--size); background: var(--color); border-radius: 50%; opacity: 0.6; animation: particleFloat var(--duration) ease-in-out infinite; animation-delay: var(--delay); }
    @keyframes particleFloat { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; } }
    
    .lobby-grid-pattern { position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px); background-size: 25px 25px; pointer-events: none; }
    
    .lobby-content-card { position: relative; z-index: 10; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 32px; padding: 48px 56px; max-width: 520px; width: 90%; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.5); animation: cardFloat 6s ease-in-out infinite, cardEntrance 0.6s ease-out; }
    @keyframes cardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    
    .lobby-live-badge { position: relative; display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #EA4335 0%, #FBBC05 100%); padding: 10px 24px; border-radius: 50px; font-size: 13px; font-weight: 700; color: white; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 8px 30px rgba(234, 67, 53, 0.35); margin-bottom: 24px; }
    .lobby-live-badge .live-dot { width: 10px; height: 10px; background: white; border-radius: 50%; animation: livePulse 1.5s ease-in-out infinite; }
    @keyframes livePulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
    .live-pulse-ring { position: absolute; inset: -4px; border-radius: 50px; border: 2px solid rgba(234, 67, 53, 0.4); animation: ringPulse 2s ease-out infinite; }
    @keyframes ringPulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 0; } }
    
    .lobby-title { font-size: 32px; font-weight: 800; color: #202124; margin: 0 0 12px 0; letter-spacing: -0.5px; line-height: 1.2; }
    .lobby-subtitle { font-size: 15px; color: #5f6368; margin: 0 0 32px 0; line-height: 1.6; }
    
    .lobby-session-card { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(66, 133, 244, 0.05) 100%); border: 2px solid rgba(66, 133, 244, 0.3); border-radius: 20px; padding: 20px 24px; margin-bottom: 28px; }
    .session-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #4285F4 0%, #34A853 100%); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3); }
    .session-info { display: flex; flex-direction: column; }
    .session-label { font-size: 11px; font-weight: 600; color: #5f6368; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .session-code { font-size: 32px; font-weight: 800; color: #202124; font-family: 'Space Grotesk', 'Courier New', monospace; letter-spacing: 4px; }
    
    .lobby-stats-row { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 28px; padding: 16px 0; border-top: 1px solid rgba(0, 0, 0, 0.06); border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
    .lobby-stat-item { display: flex; align-items: center; gap: 12px; }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
    .stat-icon.participants-icon { background: linear-gradient(135deg, #34A853 0%, #2d8f47 100%); }
    .stat-icon.ready-icon { background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%); }
    .stat-icon .icon { width: 22px; height: 22px; }
    .stat-content { display: flex; flex-direction: column; }
    .stat-value { font-size: 20px; font-weight: 700; color: #202124; }
    .stat-label { font-size: 12px; color: #5f6368; }
    .lobby-stat-divider { width: 1px; height: 40px; background: rgba(0, 0, 0, 0.1); }
    
    .lobby-waiting-container { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 28px; }
    .lobby-waiting-dots { display: flex; gap: 8px; }
    .lobby-waiting-dots .waiting-dot { width: 12px; height: 12px; background: linear-gradient(135deg, #4285F4 0%, #34A853 100%); border-radius: 50%; animation: waitingBounce 1.4s ease-in-out infinite; }
    .lobby-waiting-dots .waiting-dot:nth-child(2) { animation-delay: 0.2s; }
    .lobby-waiting-dots .waiting-dot:nth-child(3) { animation-delay: 0.4s; }
    .waiting-text { font-size: 14px; font-weight: 600; color: #5f6368; }
    
    .lobby-actions { display: flex; gap: 12px; margin-bottom: 24px; }
    .lobby-guidelines-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%); border: none; border-radius: 14px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3); }
    .lobby-guidelines-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(66, 133, 244, 0.4); }
    .lobby-guidelines-btn .icon { width: 18px; height: 18px; }
    .lobby-leave-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 24px; background: rgba(234, 67, 53, 0.1); border: 2px solid rgba(234, 67, 53, 0.3); border-radius: 14px; color: #EA4335; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .lobby-leave-btn:hover { background: rgba(234, 67, 53, 0.15); transform: translateY(-2px); }
    .lobby-leave-btn .icon { width: 18px; height: 18px; }
    
    .lobby-footer-tip { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; background: rgba(0, 0, 0, 0.03); border-radius: 12px; }
    .lobby-footer-tip .icon { width: 16px; height: 16px; color: #5f6368; flex-shrink: 0; }
    .lobby-footer-tip span { font-size: 12px; color: #5f6368; text-align: center; }
    
    /* Guidelines Modal */
    .guidelines-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease; }
    .guidelines-modal-content { background: white; border-radius: 24px; max-width: 550px; width: 90%; max-height: 85vh; overflow: hidden; box-shadow: 0 32px 100px rgba(0, 0, 0, 0.25); animation: modalSlideUp 0.4s ease; }
    @keyframes modalSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .guidelines-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; border-bottom: 1px solid rgba(0, 0, 0, 0.08); }
    .guidelines-modal-header h2 { font-size: 22px; font-weight: 700; color: #202124; margin: 0; }
    .guidelines-close-btn { width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 0, 0, 0.05); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .guidelines-close-btn:hover { background: rgba(0, 0, 0, 0.1); }
    .guidelines-close-btn .icon { width: 20px; height: 20px; color: #5f6368; }
    .guidelines-modal-body { padding: 28px; max-height: 50vh; overflow-y: auto; }
    .guidelines-list.modal-guidelines { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
    .guidelines-list.modal-guidelines .guideline-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: rgba(0, 0, 0, 0.02); border-radius: 16px; border: 1px solid rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }
    .guidelines-list.modal-guidelines .guideline-item:hover { background: rgba(0, 0, 0, 0.04); transform: translateX(4px); }
    .guideline-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .guideline-icon .icon { width: 22px; height: 22px; }
    .guideline-content { flex: 1; }
    .guideline-content strong { font-size: 15px; font-weight: 700; color: #202124; display: block; margin-bottom: 4px; }
    .guideline-content p { font-size: 13px; color: #5f6368; margin: 0; line-height: 1.5; }
    .guidelines-list.modal-guidelines .live-guideline { background: linear-gradient(135deg, rgba(66, 133, 244, 0.08) 0%, rgba(66, 133, 244, 0.03) 100%); border-color: rgba(66, 133, 244, 0.2); }
    .guidelines-modal-footer { padding: 20px 28px; border-top: 1px solid rgba(0, 0, 0, 0.08); }
    .guidelines-confirm-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 24px; background: linear-gradient(135deg, #34A853 0%, #2d8f47 100%); border: none; border-radius: 14px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 24px rgba(52, 168, 83, 0.3); }
    .guidelines-confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(52, 168, 83, 0.4); }
    .guidelines-confirm-btn .icon { width: 20px; height: 20px; }
    
    @media (max-width: 768px) {
        .lobby-content-card { padding: 32px 24px; margin: 16px; }
        .lobby-title { font-size: 24px; }
        .session-code { font-size: 26px; }
        .lobby-stats-row { gap: 16px; }
        .lobby-actions { flex-direction: column; }
        .guidelines-modal-content { margin: 16px; }
    }
`;

// ============================================
// ICON COMPONENTS (Original - unchanged)
// ============================================
const GDGLogo = () => <img src={Logo} alt="GDG Logo" className="enhanced-card-logo" />;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconClock = () => <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconAlert = () => <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconWifiOff = () => <svg className="icon large" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l22 22M8.53 16.11a6.5 6.5 0 0 1 6.95 0M4.42 12.55a10.94 10.94 0 0 1 5.17-2.39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.31 10.16A10.94 10.94 0 0 1 19.58 12.55M1.42 9a16 16 0 0 1 4.7-2.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.53 5.42A16 16 0 0 1 22.58 9M12 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconFullScreen = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>;
const IconTab = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M4 17V5a2 2 0 0 1 2-2h11"/></svg>;
const IconMobile = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IconBook = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconExit = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconInfo = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const IconClose = () => <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ============================================
// QUIZ CONTEXT
// ============================================
const QuizContext = createContext();

// ============================================
// QUIZ REDUCER (Original + Live mode actions)
// ============================================
const quizReducer = (state, action) => {
    switch (action.type) {
        case 'START_COUNTDOWN': return { ...state, phase: 'countdown' };
        case 'START_QUIZ': return { ...state, phase: 'quiz' };
        case 'SELECT_ANSWER': return { ...state, userAnswers: { ...state.userAnswers, ...action.payload } };
        case 'NEXT_QUESTION': return { ...state, currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, action.totalQuestions - 1) };
        case 'PREV_QUESTION': return { ...state, currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0) };
        case 'SUBMIT_QUIZ': return { ...state, phase: 'submitting' };
        case 'SET_EVALUATION':
            sessionStorage.removeItem(`quizState_${action.quizId}`);
            return { ...state, evaluationResult: action.payload, phase: 'review' };
        case 'DISQUALIFY':
            sessionStorage.removeItem(`quizState_${action.quizId}`);
            return { ...state, phase: 'submitting', isDisqualified: true };
        case 'TICK_TIMER': return { ...state, timeLeft: state.timeLeft > 0 ? state.timeLeft - 1 : 0 };
        // Live mode actions
        case 'LIVE_SET_QUESTION': 
            // Clear userAnswers when new question starts to prevent showing previous question's selection
            return { ...state, currentQuestionIndex: action.questionIndex, liveTimeLeft: action.timeLimit || 30, liveHasAnswered: false, liveSelectedOption: null, showLeaderboard: false, userAnswers: {} };
        case 'LIVE_TICK_TIMER': 
            return { ...state, liveTimeLeft: Math.max(0, state.liveTimeLeft - 1) };
        case 'LIVE_ANSWER_SUBMITTED': 
            return { ...state, liveHasAnswered: true, liveSelectedOption: action.selectedOption };
        case 'LIVE_SHOW_LEADERBOARD': 
            return { ...state, showLeaderboard: true, liveLeaderboard: action.leaderboard || [], liveLastResult: action.lastResult, liveMyScore: action.myScore || 0, liveMyRank: action.myRank };
        case 'LIVE_QUIZ_COMPLETE':
            return { ...state, phase: 'review', liveLeaderboard: action.leaderboard || [], liveMyScore: action.myScore || 0, liveMyRank: action.myRank,
                evaluationResult: { success: true, user_id: state.userId, score: { total_marks_earned: (action.correctAnswers || 0) * 100, total_marks_possible: (action.totalQuestions || 10) * 100, questions_correct: action.correctAnswers || 0, total_questions: action.totalQuestions || 10, percentage: ((action.correctAnswers || 0) * 100) / ((action.totalQuestions || 10) * 100) * 100 } } };
        case 'LIVE_DISQUALIFIED':
            return { ...state, isDisqualified: true };
        default: throw new Error(`Unhandled action type: ${action.type}`);
    }
};

const QuizProvider = ({ children, quizData, userId, userName, userPhoto, liveMode, onLeaveLive }) => {
    const getInitialState = () => {
        if (liveMode) {
            let initialPhase = 'start';
            if (liveMode.quizState === 'question' || liveMode.quizState === 'active') {
                initialPhase = 'quiz';
            } else if (liveMode.quizState === 'leaderboard') {
                initialPhase = 'quiz'; 
            }
            
            return { 
                phase: initialPhase, 
                currentQuestionIndex: liveMode.questionIndex || 0, 
                userAnswers: {}, 
                timeLeft: quizData?.time_limit_sec || 0, 
                isDisqualified: false, 
                evaluationResult: null, 
                liveTimeLeft: liveMode.timeRemaining || 30, 
                liveHasAnswered: liveMode.hasAnswered || false, 
                liveSelectedOption: liveMode.selectedOption || null, 
                showLeaderboard: liveMode.quizState === 'leaderboard', 
                liveLeaderboard: liveMode.leaderboard || [], 
                liveLastResult: liveMode.lastResult || null, 
                liveMyScore: liveMode.myScore || 0, 
                liveMyRank: liveMode.myRank || null 
            };
        }
        const savedState = sessionStorage.getItem(`quizState_${quizData.quiz_id}`);
        if (savedState) { const parsedState = JSON.parse(savedState); return { ...parsedState, phase: 'quiz' }; }
        return { phase: 'start', currentQuestionIndex: 0, userAnswers: {}, timeLeft: quizData.time_limit_sec, isDisqualified: false, evaluationResult: null };
    };

    const [state, dispatch] = useReducer(quizReducer, getInitialState());

    useEffect(() => { if (!liveMode && state.phase === 'quiz') { sessionStorage.setItem(`quizState_${quizData.quiz_id}`, JSON.stringify(state)); } }, [state, quizData?.quiz_id, liveMode]);
    useEffect(() => { if (liveMode || state.phase !== 'quiz' || state.timeLeft <= 0) return; const timer = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000); return () => clearInterval(timer); }, [state.phase, state.timeLeft, liveMode]);
    // NOTE: Live mode timer is managed by QuizPage.jsx via liveMode.timeRemaining prop - no internal timer needed

    return (<QuizContext.Provider value={{ state, dispatch, quizData, userId, userName, userPhoto, liveMode, onLeaveLive }}>{children}</QuizContext.Provider>);
};

const useQuiz = () => { const context = useContext(QuizContext); if (!context) throw new Error('useQuiz must be used within a QuizProvider'); return context; };

// ============================================
// TIMER COMPONENT (Original + Live mode)
// ============================================
const Timer = memo(() => {
    const { state: { timeLeft }, liveMode } = useQuiz();
    // For live mode, use timeRemaining from liveMode prop (managed by QuizPage.jsx)
    // For standard mode, use internal timeLeft state
    const displayTime = liveMode ? (liveMode.timeRemaining || 0) : timeLeft;
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;
    const isLowTime = displayTime <= 5;
    return (<div className={`timer-container ${isLowTime ? 'timer-low' : ''}`}><IconClock /><span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span></div>);
});
const Question = memo(() => {
    const { state: { userAnswers, currentQuestionIndex }, dispatch, quizData, liveMode } = useQuiz();
    const question = liveMode?.currentQuestion || quizData.questions[currentQuestionIndex];
    const currentAnswer = userAnswers[question.question_id] || [];

    const handleSelectAnswer = useCallback((optionId) => {
        // In live mode, if already answered, don't allow changes
        if (liveMode && liveMode.hasAnswered) return;
        
        const newAnswers = question.type === 'single_choice'
            ? [optionId]
            : currentAnswer.includes(optionId)
                ? currentAnswer.filter(id => id !== optionId)
                : [...currentAnswer, optionId];
        dispatch({ type: 'SELECT_ANSWER', payload: { [question.question_id]: newAnswers } });
        
        // In live mode, submit answer immediately for single choice
        if (liveMode && question.type === 'single_choice' && liveMode.onAnswer) {
            liveMode.onAnswer(optionId);
        }
    }, [question, currentAnswer, dispatch, liveMode]);

    const isLongOption = question.options.some(opt => opt.text.length > 50);

    return (
        <div className="question-container">
            <div className="question-card">
                <div className="question-type-tag" style={{ backgroundColor: question.type === 'multiple_choice' ? '#34A853' : '#4285F4' }}>
                    {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Single Choice'}
                </div>
                {question.image && (
                    <div className="question-image-container" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <img src={question.image} alt="Question illustration" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }} />
                    </div>
                )}
                <h2 className="question-text">{question.question_text}</h2>
            </div>
            <div className={`options-grid ${isLongOption ? 'single-column' : ''}`}>
                {question.options.map((option, index) => {
                    const isSelected = currentAnswer.includes(option.option_id);
                    const isDisabled = liveMode && liveMode.hasAnswered;
                    return (
                        <div key={option.option_id} onClick={() => !isDisabled && handleSelectAnswer(option.option_id)} className={`option-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}>
                            <div className="option-prefix">{String.fromCharCode(65 + index)}</div>
                            <span className="option-text">{option.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
const WelcomeScreen = memo(() => {
    const { dispatch, quizData } = useQuiz();
    const [showGuidelines, setShowGuidelines] = useState(false);
    return (
        <div className="welcome-container">
            <div className={`welcome-side ${!showGuidelines ? 'active' : ''}`}>
                <h1 className="welcome-title">{quizData.title}</h1>
                <p className="welcome-p">You have <strong>{Math.floor(quizData.time_limit_sec / 60)} minutes</strong> to complete <strong>{quizData.questions.length} questions</strong>.</p>
                <div className="welcome-actions">
                    <button onClick={() => setShowGuidelines(true)} className="welcome-button secondary">View Guidelines</button>
                    <button onClick={() => dispatch({ type: 'START_COUNTDOWN' })} className="welcome-button">Start Quiz</button>
                </div>
            </div>
            <div className={`welcome-side ${showGuidelines ? 'active' : ''}`}>
                <h2 className="welcome-title">Instructions</h2>
                <ul className="guidelines-list">
                    <li className="guideline-item"><IconFullScreen /><div><strong>Full-Screen Mode:</strong> Stay in full-screen.</div></li>
                    <li className="guideline-item"><IconTab /><div><strong>No Tab Switching:</strong> Do not switch tabs.</div></li>
                    <li className="guideline-item"><IconAlert /><div><strong>Warning Limit:</strong> Disqualified after <strong>5 warnings</strong>.</div></li>
                    <li className="guideline-item"><IconMobile /><div><strong>Mobile Users:</strong> Do not press back.</div></li>
                </ul>
                <div className="welcome-actions">
                    <button onClick={() => setShowGuidelines(false)} className="welcome-button secondary">Back</button>
                    <button onClick={() => dispatch({ type: 'START_COUNTDOWN' })} className="welcome-button">I Understand, Start</button>
                </div>
            </div>
        </div>
    );
});

// ============================================
// LIVE MODE: WAITING SCREEN (NEW)
// ============================================
const LiveWaitingScreen = memo(() => {
    const { quizData, liveMode } = useQuiz();
    return (
        <div className="welcome-container">
            <div className="welcome-side active">
                <div className="live-badge"><span className="live-dot"></span> LIVE</div>
                <h1 className="welcome-title">{liveMode?.quizInfo?.title || quizData?.title || 'Live Quiz'}</h1>
                <p className="welcome-p">Waiting for the host to start the quiz...</p>
                <div className="participants-count">
                    <IconUser />
                    <span>{liveMode?.participants?.length || 0} participants joined</span>
                </div>
                <div className="waiting-animation">
                    <div className="waiting-dot"></div>
                    <div className="waiting-dot"></div>
                    <div className="waiting-dot"></div>
                </div>
            </div>
        </div>
    );
});

const CountdownScreen = memo(({ number }) => <div className="countdown-screen">{number}</div>);

const SubmittingScreen = memo(() => (
    <div className="submitting-card">
        <h1>Submitting...</h1>
        <p>Please wait while we evaluate your answers.</p>
    </div>
));

const EnhancedResultCard = memo(() => {
    const { state, quizData, userId, userName, userPhoto } = useQuiz();
    const { evaluationResult } = state;
    const [showConfetti, setShowConfetti] = useState(false);
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    const scorecardRef = useRef(null);

    useEffect(() => {
        if (evaluationResult?.score?.percentage === 100) setShowConfetti(true);
        if (evaluationResult?.score?.percentage) {
            const targetPercentage = evaluationResult.score.percentage;
            let currentValue = 0;
            const duration = 2500;
            const startTime = Date.now();
            const animateValue = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                currentValue = targetPercentage * easeOutCubic;
                setAnimatedPercentage(currentValue);
                if (progress < 1) requestAnimationFrame(animateValue);
                else setAnimatedPercentage(targetPercentage);
            };
            requestAnimationFrame(animateValue);
        }
    }, [evaluationResult]);

    const handleSaveAsPng = useCallback(async () => {
        if (scorecardRef.current === null) return;
        try {
            const element = scorecardRef.current;
            const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true, allowTaint: true, width: 650, height: 450 });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `GDGC-Quiz-Certificate-${evaluationResult.user_id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error('Failed to generate certificate image!', err); alert('Failed to save certificate. Please try again.'); }
    }, [scorecardRef, evaluationResult]);

    const handleShareOnLinkedIn = useCallback(() => {
        const shareText = `🎯 Thrilled to share my achievement!\n\nJust completed the "${quizData.title}" quiz organized by Google Developer Groups on Campus!\n\n📊 Score: ${evaluationResult.score.total_marks_earned}/${evaluationResult.score.total_marks_possible}\n✅ Accuracy: ${evaluationResult.score.percentage.toFixed(1)}%\n\n#GDGC #GoogleDeveloperGroups #TechQuiz #ContinuousLearning #Development`;
        const currentUrl = window.location.href;
        const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent('GDGC Quiz Achievement')}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedInUrl, '_blank');
    }, [quizData.title, evaluationResult]);

    if (!evaluationResult) return <SubmittingScreen />;
    if (!evaluationResult.score) return (<div className="scorecard-wrapper"><div className="enhanced-score-card error-card"><h2>Submission Error</h2><p>{evaluationResult.message || "Could not retrieve your score. Please try again later."}</p></div></div>);

    const { user_id, score } = evaluationResult;
    const percentage = score.percentage;
    const getPerformanceLevel = () => {
        if (percentage >= 90) return { level: 'Outstanding Performance', color: '#4285F4', badge: 'GOLD' };
        if (percentage >= 75) return { level: 'Excellent Performance', color: '#34A853', badge: 'SILVER' };
        if (percentage >= 60) return { level: 'Good Performance', color: '#FBBC05', badge: 'BRONZE' };
        return { level: 'Participation', color: '#EA4335', badge: 'PARTICIPANT' };
    };
    const performance = getPerformanceLevel();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const parseDisplayName = (name, rollNumber) => {
        if (!name) return { displayName: 'Participant', rollNo: rollNumber };
        if (name.startsWith(rollNumber + ' ')) return { displayName: name.substring(rollNumber.length + 1), rollNo: rollNumber };
        const rollPattern = /^(\d{2}[A-Z0-9]{5,})\s+(.+)$/i;
        const match = name.match(rollPattern);
        if (match) return { displayName: match[2], rollNo: match[1] };
        return { displayName: name, rollNo: rollNumber };
    };
    
    const { displayName, rollNo } = parseDisplayName(userName, user_id);
    const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

    return (
        <div className="scorecard-wrapper">
            <div ref={scorecardRef} className="professional-certificate">
                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
                <div className="cert-watermark"><img src={Logo} alt="" className="watermark-logo" /></div>
                <div className="cert-left-bar"></div>
                <div className="cert-main-content">
                    <div className="cert-header-row">
                        <div className="cert-title-block"><h1 className="cert-title">CERTIFICATE</h1><h2 className="cert-subtitle">OF COMPLETION</h2></div>
                        <div className="cert-award-badge">
                            <svg width="90" height="95" viewBox="0 0 100 105" className="badge-svg">
                                <defs>
                                    <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="50%" stopColor="#34A853"/><stop offset="100%" stopColor="#FBBC05"/></linearGradient>
                                    <linearGradient id="ribbonRedGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EA4335"/><stop offset="100%" stopColor="#C5221F"/></linearGradient>
                                    <linearGradient id="ribbonYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#F9AB00"/></linearGradient>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/></filter>
                                </defs>
                                <path d="M20 48 L15 100 L30 85 L40 102 L44 52" fill="url(#ribbonRedGrad)"/>
                                <path d="M80 48 L85 100 L70 85 L60 102 L56 52" fill="url(#ribbonYellowGrad)"/>
                                <circle cx="50" cy="38" r="34" fill="url(#badgeGradient)" filter="url(#shadow)"/>
                                <circle cx="50" cy="38" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                                <text x="50" y="26" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="9" fontFamily="Arial">★★★</text>
                                <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Arial">{animatedPercentage.toFixed(0)}%</text>
                                <text x="50" y="58" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="7" fontFamily="Arial" letterSpacing="1">SCORED</text>
                            </svg>
                        </div>
                    </div>
                    <div className="cert-body">
                        <p className="cert-present-text">We proudly present this certificate to</p>
                        <div className="cert-recipient">
                            <div className="cert-user-photo-wrapper">
                                {userPhoto ? (<img src={userPhoto} alt={displayName} className="cert-user-photo" referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />) : null}
                                <div className="cert-user-avatar" style={{ display: userPhoto ? 'none' : 'block' }}>{userInitial}</div>
                            </div>
                            <div className="cert-recipient-details"><h3 className="cert-user-name">{displayName}</h3><span className="cert-user-rollno">{rollNo}</span></div>
                        </div>
                        <p className="cert-achievement-text">honouring completion of the quiz: <strong>"{quizData.title}"</strong></p>
                        <p className="cert-score-text">Achieved a score of <strong>{score.total_marks_earned}/{score.total_marks_possible}</strong> ({score.questions_correct} correct out of {score.total_questions} questions)</p>
                    </div>
                </div>
                <div className="cert-signature-row">
                    <div className="cert-signature-block"><div className="signature-line">GDGC IARE</div><span className="signature-name">Google Developer Groups</span><span className="signature-title">ON CAMPUS • IARE</span></div>
                    <div className="cert-signature-block"><div className="signature-line" style={{ color: performance.color }}>{performance.level}</div><span className="signature-name">Performance Grade</span><span className="signature-title">ACHIEVEMENT LEVEL</span></div>
                </div>
                <div className="cert-footer-row">
                    <div className="cert-footer-center">
                        <div className="verified-badge-clean"><img src={Logo} alt="GDGC" className="verified-logo" crossOrigin="anonymous" /><span className="verified-text-clean">Verified</span></div>
                        <div className="cert-date-display">{currentDate}</div>
                    </div>
                </div>
            </div>
            <div className="scorecard-actions">
                <button onClick={handleSaveAsPng} className="action-button save"><svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Download Certificate</button>
                <button onClick={handleShareOnLinkedIn} className="action-button share"><svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Share on LinkedIn</button>
            </div>
        </div>
    );
});
const ConfirmationModal = memo(({ title, message, stats, onConfirm, onCancel, confirmText, cancelText, confirmColor }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <h2>{title}</h2>
            <p>{message}</p>
            {stats && (<div className="submission-stats"><div><p>Total Questions:</p> <span>{stats.total}</span></div><div><p>Attempted:</p> <span className="attempted">{stats.attempted}</span></div><div><p>Unattempted:</p> <span className="unattempted">{stats.unattempted}</span></div></div>)}
            <div className="modal-actions"><button onClick={onCancel} className="modal-button resume">{cancelText}</button><button onClick={onConfirm} className="modal-button" style={{ background: confirmColor, color: 'white' }}>{confirmText}</button></div>
        </div>
    </div>
));

const ConnectivityModal = memo(() => (<div className="modal-backdrop"><div className="modal-content"><IconWifiOff /><h2>Internet Disconnected</h2><p>Please check your connection. <strong>Do not reload the page.</strong></p></div></div>));

const WarningToast = memo(({ count, visible, reason }) => (
    <div className={`warning-toast ${visible ? 'visible' : ''}`}>
        <IconAlert />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{count < 5 ? `Warning ${count} of 5` : `Final Warning! Auto-submitting...`}</span>
            <span style={{ fontSize: '13px', opacity: '0.95' }}>{reason}</span>
        </div>
    </div>
));

const IconTrophy = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
);

const IconMedal = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/>
        <path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/>
        <path d="M8 7h8"/><circle cx="12" cy="17" r="5"/>
        <path d="M12 18v-2h-.5"/>
    </svg>
);

const IconStar = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const IconCorrect = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#34A853" fillOpacity="0.2" stroke="#34A853" strokeWidth="3"/>
        <path d="M14 24l7 7 13-13" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IconIncorrect = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#EA4335" fillOpacity="0.2" stroke="#EA4335" strokeWidth="3"/>
        <path d="M16 16l16 16M32 16l-16 16" stroke="#EA4335" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

const IconRank = ({ rank }) => {
    const colors = {
        1: { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', text: '#1a1a1a' },
        2: { bg: 'linear-gradient(135deg, #E8E8E8 0%, #B0B0B0 100%)', text: '#1a1a1a' },
        3: { bg: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 100%)', text: '#fff' }
    };
    const style = colors[rank] || { bg: 'rgba(66, 133, 244, 0.3)', text: '#fff' };
    
    return (
        <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: style.bg, color: style.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', flexShrink: 0,
            boxShadow: rank <= 3 ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
        }}>
            {rank}
        </div>
    );
};

const LiveLeaderboardOverlay = memo(({ leaderboard, myRank, myScore, lastResult, questionIndex, totalQuestions }) => (
    <div className="leaderboard-overlay">
        {/* Results Row - Side by Side */}
        <div className="results-row">
            {/* Result Banner */}
            {lastResult && (
                <div className={`result-banner ${lastResult.correct ? 'correct' : 'incorrect'}`}>
                    <div style={{ marginBottom: '12px' }}>
                        {lastResult.correct ? <IconCorrect /> : <IconIncorrect />}
                    </div>
                    <h3>{lastResult.correct ? 'Correct Answer!' : 'Incorrect'}</h3>
                    <p>
                        {lastResult.correct ? (
                            <>
                                +{lastResult.basePoints || lastResult.points || 0} points
                                {lastResult.speedBonus > 0 && (
                                    <span style={{ color: '#4285F4', marginLeft: '8px' }}>
                                        +{lastResult.speedBonus} speed bonus! 🚀
                                    </span>
                                )}
                            </>
                        ) : 'Better luck next time!'}
                    </p>
                </div>
            )}
            
            {/* Your Score Card */}
            <div className="my-score-card">
                <span className="score-label">YOUR TOTAL SCORE</span>
                <div className="score-value">{myScore || 0}</div>
                {myRank && (
                    <div className="rank-badge">
                        <IconRank rank={myRank} />
                        <span style={{ marginLeft: '8px' }}>Rank #{myRank}</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Leaderboard Header */}
        <div className="leaderboard-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <IconTrophy />
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>Live Standings</h2>
            </div>
            <p>After Question {(questionIndex || 0) + 1} of {totalQuestions || 10}</p>
        </div>
        
        {/* Leaderboard List - Shows ALL participants */}
        <div className="leaderboard-list">
            {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                    <div 
                        key={player.oderId || index} 
                        className={`leaderboard-item ${index === 0 ? 'first' : ''} ${index === 1 ? 'second' : ''} ${index === 2 ? 'third' : ''}`}
                    >
                        <IconRank rank={index + 1} />
                        {player.userPhoto && (
                            <img src={player.userPhoto} alt="" className="player-photo" referrerPolicy="no-referrer" />
                        )}
                        <div className="player-name">{player.userName || player.oderId}</div>
                        <div className="player-score">{player.score || 0}</div>
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' }}>
                    Waiting for results...
                </div>
            )}
        </div>
        
        {/* Next Question Timer Indicator */}
        <div className="next-question-timer">
            <p>Next question loading...</p>
            <div className="timer-bar">
                <div className="timer-bar-fill" style={{ width: '100%', animation: 'timerShrink 5s linear forwards' }}></div>
            </div>
        </div>
    </div>
));

const QuizContent = memo(({ onFinalSubmit }) => {
    const { state, dispatch, quizData, liveMode } = useQuiz();
    const { currentQuestionIndex } = state;
    const totalQuestions = liveMode?.totalQuestions || quizData.questions.length;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    
    return (
        <div className="quiz-interface">
            <header>
                <div className="quiz-header-left">
                    <img src={Logo} alt="GDGC Logo" className="quiz-logo" />
                    <h1>{quizData.title}</h1>
                    {liveMode && <div className="live-indicator"><span className="live-dot"></span>LIVE</div>}
                </div>
                <Timer />
            </header>
            <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div></div>
            <div className="question-meta"><div className="question-counter">Question {currentQuestionIndex + 1}<span> / {totalQuestions}</span></div></div>
            <main><Question /></main>
            {!liveMode && (
                <footer>
                    <button onClick={() => dispatch({ type: 'PREV_QUESTION' })} disabled={isFirstQuestion} className="nav-button prev">Previous</button>
                    {isLastQuestion ? <button onClick={onFinalSubmit} className="nav-button submit">Submit</button> : <button onClick={() => dispatch({ type: 'NEXT_QUESTION', totalQuestions })} className="nav-button next">Next</button>}
                </footer>
            )}
            {liveMode && state.liveHasAnswered && (
                <div className="live-answered-indicator"><IconCheck /> Answer submitted! Waiting for next question...</div>
            )}
        </div>
    );
});

const QuizInterface = () => {
    const { state, dispatch, quizData, userId, userName, userPhoto, liveMode, onLeaveLive } = useQuiz();
    const { phase, userAnswers, timeLeft } = state;
    const [countdown, setCountdown] = useState(3);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showFullScreenModal, setShowFullScreenModal] = useState(false);
    const [showWindowsKeyWarningModal, setShowWindowsKeyWarningModal] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [warningCount, setWarningCount] = useState(0);
    const [windowsKeyPressCount, setWindowsKeyPressCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningReason, setWarningReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiveDisqualified, setIsLiveDisqualified] = useState(false); // Track live mode disqualification
    const [showDisqualificationModal, setShowDisqualificationModal] = useState(false); // Professional disqualification popup

    // Submit handler - works for standard mode and live mode disqualification
    const handleQuizSubmit = useCallback(async (isDisqualification = false) => {
        if (isSubmitting) return;
        
        // In live mode, only handle disqualification
        if (liveMode) {
            if (isDisqualification && !isLiveDisqualified) {
                // Mark as disqualified immediately to prevent repeated calls
                setIsLiveDisqualified(true);
                setIsSubmitting(true);
                
                // For live mode, dispatch a disqualification state and exit fullscreen
                dispatch({ type: 'LIVE_DISQUALIFIED' });
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
                // Show professional disqualification modal instead of alert
                setShowDisqualificationModal(true);
            }
            return;
        }
        
        setIsSubmitting(true);
        const actionType = isDisqualification ? 'DISQUALIFY' : 'SUBMIT_QUIZ';
        dispatch({ type: actionType, quizId: quizData.quiz_id });
        
        const submissionBody = {
            quiz_id: quizData.quiz_id,
            user_id: userId,
            user_name: userName || userId,
            user_photo: userPhoto || null,
            submitted_at: new Date().toISOString(),
            time_taken_sec: quizData.time_limit_sec - timeLeft,
            responses: Object.entries(userAnswers).map(([question_id, selected_options]) => ({ question_id, selected_options })),
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionBody),
            });
            const result = await response.json();
            if (response.status === 409) {
                const existingEvaluation = { success: true, message: 'Quiz already submitted', user_id: userId, score: result.existing_score || { total_marks_earned: 0, total_marks_possible: quizData.total_marks, questions_correct: 0, total_questions: quizData.questions.length, percentage: result.existing_score?.percentage || 0 } };
                dispatch({ type: 'SET_EVALUATION', payload: existingEvaluation, quizId: quizData.quiz_id });
                return;
            }
            if (!response.ok) throw new Error(result.message || `Server error: ${response.status}`);
            dispatch({ type: 'SET_EVALUATION', payload: result.evaluation || result, quizId: quizData.quiz_id });
        } catch (error) {
            console.error("Submission failed:", error);
            dispatch({ type: 'SET_EVALUATION', payload: { success: false, message: error.message || "Could not submit quiz. Please check your network." }, quizId: quizData.quiz_id });
        } finally { setIsSubmitting(false); }
    }, [dispatch, quizData, userId, userName, userPhoto, timeLeft, userAnswers, isSubmitting, liveMode, onLeaveLive, isLiveDisqualified]);

    // Warning trigger - works for both modes, auto-submits after 5 warnings
    const triggerWarning = useCallback((reason = 'Violation detected') => {
        // Don't trigger warnings if already disqualified in live mode
        if (isLiveDisqualified || isSubmitting) return;
        
        setWarningCount(currentCount => {
            const newCount = currentCount + 1;
            setWarningReason(reason);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
            // Auto-submit after exactly 5 warnings (only trigger once)
            if (newCount === 5) setTimeout(() => handleQuizSubmit(true), 5000);
            return newCount;
        });
    }, [handleQuizSubmit, isLiveDisqualified, isSubmitting]);

    // Original fullscreen request
    const requestFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen request failed: ${err.message}`));
        }
        setShowFullScreenModal(false);
    }, []);

    // Force fullscreen when countdown starts
    useEffect(() => { if (phase === 'countdown') requestFullScreen(); }, [phase, requestFullScreen]);

    // Countdown timer
    useEffect(() => {
        if (phase === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (phase === 'countdown' && countdown === 0) {
            dispatch({ type: 'START_QUIZ' });
            requestFullScreen();
        }
    }, [phase, countdown, dispatch, requestFullScreen]);

    // Monitor countdown phase for proctoring violations
    useEffect(() => {
        if (phase !== 'countdown') return;
        const handleCountdownBlur = () => {
            const handleFocus = () => { requestFullScreen(); window.removeEventListener('focus', handleFocus); };
            window.addEventListener('focus', handleFocus);
        };
        const handleCountdownKeyDown = (e) => {
            const isWindowsKey = e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92;
            if (isWindowsKey) { e.preventDefault(); e.stopPropagation(); setTimeout(() => requestFullScreen(), 100); }
        };
        window.addEventListener('blur', handleCountdownBlur);
        document.addEventListener('keydown', handleCountdownKeyDown, true);
        return () => { window.removeEventListener('blur', handleCountdownBlur); document.removeEventListener('keydown', handleCountdownKeyDown, true); };
    }, [phase, requestFullScreen]);

    // Auto-submit on timer expiry (standard mode only)
    useEffect(() => {
        if (!liveMode && phase === 'quiz' && timeLeft <= 0 && !isSubmitting) {
            setTimeout(() => handleQuizSubmit(), 0);
        }
    }, [phase, timeLeft, handleQuizSubmit, isSubmitting, liveMode]);

    // ORIGINAL PROCTORING - All event listeners (unchanged)
    useEffect(() => {
        if (phase !== 'quiz') return;
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        const handleFullScreenChange = () => { if (!document.fullscreenElement && phase === 'quiz') { triggerWarning('⛔ Exited full-screen mode'); setShowFullScreenModal(true); } };
        const handleVisibilityChange = () => { if (document.hidden && phase === 'quiz') triggerWarning('🔄 Switched to another tab or window'); };
        const handleWindowBlur = () => { if (phase === 'quiz' && document.fullscreenElement) triggerWarning('🪟 Window focus lost - Windows key or Alt+Tab detected'); };
        
        const handleKeyDown = (e) => {
            if (phase !== 'quiz') return;
            const isWindowsKey = e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92;
            const isAltTab = e.altKey && (e.key === 'Tab' || e.keyCode === 9);
            const isEscape = e.key === 'Escape' || e.keyCode === 27;
            const isCopyPaste = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A');
            const isPrintScreen = e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.key === 'p');
            const isRefresh = (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r') || e.key === 'F5';
            const isDevTools = (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) || e.key === 'F12';
            
            if (isWindowsKey) {
                e.preventDefault(); e.stopPropagation();
                // Same behavior for both standard and live modes - 2 Windows key presses = auto-submit
                // Don't process if already disqualified
                if (isLiveDisqualified || isSubmitting) return false;
                setWindowsKeyPressCount(prevCount => {
                    const newCount = prevCount + 1;
                    if (newCount === 1) { 
                        triggerWarning('🪟 Windows key detected! Clicking again will AUTO-SUBMIT your quiz!'); 
                        setShowWindowsKeyWarningModal(true); 
                    } else if (newCount === 2) { 
                        setShowWindowsKeyWarningModal(false); 
                        setTimeout(() => handleQuizSubmit(true), 100); 
                    }
                    return newCount;
                });
                return false;
            }
            if (isAltTab) { e.preventDefault(); e.stopPropagation(); triggerWarning('🔄 Alt+Tab is not allowed during quiz!'); return false; }
            if (isEscape) { e.preventDefault(); e.stopPropagation(); triggerWarning('⛔ Escape key is not allowed during quiz!'); return false; }
            if (isCopyPaste || isPrintScreen || isRefresh || isDevTools) {
                e.preventDefault(); e.stopPropagation();
                let reason = '⌨️ Used prohibited keyboard shortcut';
                if (isCopyPaste) reason = '📋 Copy/paste is not allowed';
                else if (isPrintScreen) reason = '🖨️ Screenshot/print is not allowed';
                else if (isRefresh) reason = '🔄 Page refresh is not allowed';
                else if (isDevTools) reason = '🛠️ Developer tools access is blocked';
                triggerWarning(reason);
            }
        };
        
        const handleKeyUp = (e) => {
            if (phase !== 'quiz') return;
            const isWindowsKey = e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92;
            if (isWindowsKey) { e.preventDefault(); e.stopPropagation(); return false; }
        };
        const handlePopState = (e) => { if (phase === 'quiz') { e.preventDefault(); window.history.pushState(null, '', window.location.href); triggerWarning('◀️ Back button is not allowed'); } };
        const handleContextMenu = (e) => { if (phase === 'quiz') { e.preventDefault(); e.stopPropagation(); triggerWarning('🖱️ Right-click is disabled during quiz'); } };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', handleKeyUp, true);
        document.addEventListener('contextmenu', handleContextMenu, true);
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('keyup', handleKeyUp, true);
            document.removeEventListener('contextmenu', handleContextMenu, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [phase, triggerWarning, handleQuizSubmit]);

    // Live mode: sync with parent state
    useEffect(() => {
        if (!liveMode) return;
        // When quiz becomes active (question state), start the quiz if still in start phase
        if ((liveMode.quizState === 'active' || liveMode.quizState === 'question') && phase === 'start') {
            dispatch({ type: 'START_QUIZ' }); // Skip countdown in live mode, go directly to quiz
            // Request fullscreen when live quiz enters question state
            requestFullScreen();
        }
        if (liveMode.currentQuestion && liveMode.questionIndex !== undefined) {
            dispatch({ type: 'LIVE_SET_QUESTION', questionIndex: liveMode.questionIndex, timeLimit: liveMode.timeRemaining || 30 });
        }
    }, [liveMode?.quizState, liveMode?.questionIndex, liveMode?.currentQuestion, dispatch, phase, requestFullScreen]);

    // Live mode: show leaderboard between questions
    useEffect(() => {
        if (!liveMode) return;
        if (liveMode.showLeaderboard) {
            dispatch({ type: 'LIVE_SHOW_LEADERBOARD', leaderboard: liveMode.leaderboard, lastResult: liveMode.lastResult, myScore: liveMode.myScore, myRank: liveMode.myRank });
        }
    }, [liveMode?.showLeaderboard, liveMode?.leaderboard, dispatch]);

    // Live mode: quiz complete
    useEffect(() => {
        if (!liveMode) return;
        if (liveMode.quizState === 'completed') {
            dispatch({ type: 'LIVE_QUIZ_COMPLETE', leaderboard: liveMode.leaderboard, myScore: liveMode.myScore, myRank: liveMode.myRank, totalQuestions: liveMode.totalQuestions, correctAnswers: liveMode.correctAnswers });
        }
    }, [liveMode?.quizState, dispatch]);

    return (
        <>
            {/* Live mode: waiting for host */}
            {liveMode && phase === 'start' && liveMode.quizState !== 'active' && <LiveWaitingScreen />}
            
            {/* Standard mode: welcome screen */}
            {!liveMode && phase === 'start' && <WelcomeScreen />}
            
            {/* Both modes: countdown */}
            {phase === 'countdown' && <CountdownScreen number={countdown} />}
            
            {/* Both modes: quiz content */}
            {phase === 'quiz' && !state.showLeaderboard && <QuizContent onFinalSubmit={() => setShowSubmitModal(true)} />}
            
            {/* Live mode: leaderboard overlay */}
            {liveMode && state.showLeaderboard && (
                <LiveLeaderboardOverlay 
                    leaderboard={state.liveLeaderboard} 
                    myRank={state.liveMyRank} 
                    myScore={state.liveMyScore} 
                    lastResult={state.liveLastResult}
                    questionIndex={state.currentQuestionIndex}
                    totalQuestions={liveMode.totalQuestions}
                />
            )}
            
            {/* Both modes: submitting */}
            {phase === 'submitting' && <SubmittingScreen />}
            
            {/* Both modes: connectivity modal */}
            {!isOnline && phase === 'quiz' && <ConnectivityModal />}
            
            {/* Both modes: fullscreen modal */}
            {showFullScreenModal && (
                <ConfirmationModal
                    title="Full-Screen Required"
                    message="Exiting full-screen is not allowed."
                    onConfirm={() => handleQuizSubmit(warningCount >= 5)}
                    onCancel={requestFullScreen}
                    confirmText="Quit & Submit"
                    cancelText="Re-enter Full-Screen"
                    confirmColor="#EA4335"
                />
            )}
            
            {/* Standard mode: submit modal */}
            {!liveMode && showSubmitModal && (
                <ConfirmationModal
                    title="Confirm Submission"
                    message="Are you sure you want to submit your answers?"
                    onConfirm={() => { handleQuizSubmit(); setShowSubmitModal(false); }}
                    onCancel={() => setShowSubmitModal(false)}
                    confirmText="Submit Now"
                    cancelText="Review Answers"
                    confirmColor="#34A853"
                    stats={{ total: quizData.questions.length, attempted: Object.keys(userAnswers).filter(key => userAnswers[key]?.length > 0).length, unattempted: quizData.questions.length - Object.keys(userAnswers).filter(key => userAnswers[key]?.length > 0).length }}
                />
            )}
            
            {/* Windows key warning modal */}
            {showWindowsKeyWarningModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div style={{ background: 'linear-gradient(145deg, #1a1f3a 0%, #0d1025 100%)', border: '2px solid #EA4335', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 25px 80px rgba(234, 67, 53, 0.5), 0 0 100px rgba(234, 67, 53, 0.2)' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.2) 0%, rgba(234, 67, 53, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '3px solid #EA4335', animation: 'pulse 1.5s infinite' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <h3 style={{ color: '#EA4335', fontSize: '26px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>PROCTORING VIOLATION</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.7', marginBottom: '16px' }}>You pressed the <strong style={{ color: '#FBBC04', background: 'rgba(251, 188, 4, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>Windows key</strong>.<br/>This action is not permitted during the quiz.</p>
                        <div style={{ background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.15) 0%, rgba(234, 67, 53, 0.08) 100%)', border: '1px solid rgba(234, 67, 53, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                <span style={{ color: '#EA4335', fontSize: '16px', fontWeight: 700 }}>FINAL WARNING</span>
                            </div>
                            <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: 0, lineHeight: '1.5' }}>Pressing the Windows key again will result in<br/><span style={{ color: '#EA4335', fontSize: '17px', fontWeight: 800 }}>AUTOMATIC QUIZ SUBMISSION</span></p>
                        </div>
                        <button onClick={() => { setShowWindowsKeyWarningModal(false); requestFullScreen(); }} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #34A853 0%, #2d8f47 100%)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '100%', boxShadow: '0 8px 25px rgba(52, 168, 83, 0.4)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            I Understand - Continue Quiz
                        </button>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '16px', fontStyle: 'italic' }}>Your quiz progress has been saved. Stay focused.</p>
                    </div>
                </div>
            )}
            
            {/* Professional Disqualification Modal - Live Mode */}
            {showDisqualificationModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }}>
                    <div style={{ background: 'linear-gradient(145deg, #1a1f3a 0%, #0d1025 100%)', border: '3px solid #EA4335', borderRadius: '28px', padding: '48px', maxWidth: '520px', width: '90%', textAlign: 'center', boxShadow: '0 30px 100px rgba(234, 67, 53, 0.6), 0 0 150px rgba(234, 67, 53, 0.3)', animation: 'modalSlideUp 0.5s ease' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.25) 0%, rgba(234, 67, 53, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '4px solid #EA4335', animation: 'pulse 1.5s infinite' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <h3 style={{ color: '#EA4335', fontSize: '30px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Disqualified</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '17px', lineHeight: '1.7', marginBottom: '24px' }}>You have been <strong style={{ color: '#EA4335' }}>disqualified</strong> from this quiz session due to <strong style={{ color: '#FBBC04', background: 'rgba(251, 188, 4, 0.15)', padding: '2px 10px', borderRadius: '6px' }}>multiple proctoring violations</strong>.</p>
                        <div style={{ background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.15) 0%, rgba(234, 67, 53, 0.08) 100%)', border: '1px solid rgba(234, 67, 53, 0.4)', borderRadius: '18px', padding: '24px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <span style={{ color: '#EA4335', fontSize: '18px', fontWeight: 700 }}>WARNINGS: {warningCount}/5</span>
                            </div>
                            <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0, lineHeight: '1.6', opacity: 0.85 }}>Violations such as exiting full-screen, switching tabs, or using prohibited keys are not allowed during live quizzes.</p>
                        </div>
                        <button onClick={() => { setShowDisqualificationModal(false); if (onLeaveLive) { onLeaveLive(); } else { window.location.href = '/quiz'; } }} style={{ padding: '18px 48px', background: 'linear-gradient(135deg, #4285F4 0%, #1a5dd4 100%)', border: 'none', borderRadius: '16px', color: 'white', fontSize: '17px', fontWeight: 700, cursor: 'pointer', width: '100%', boxShadow: '0 10px 30px rgba(66, 133, 244, 0.5)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            I Understand
                        </button>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>Please contact the quiz administrator if you believe this was an error.</p>
                    </div>
                </div>
            )}
            
            {/* Warning toast */}
            <WarningToast count={warningCount} visible={showWarning} reason={warningReason} />
        </>
    );
};

const QuizFlowManager = () => {
    const { state } = useQuiz();

    useEffect(() => {
        if (state.phase === 'review') {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.error(err));
            }
        }
    }, [state.phase]);

    if (state.phase === 'review') {
        return (
            <div className="page-with-layout">
                <PageBackground animationsReady={true} />
                <Navbar />
                <main className="scorecard-main-content">
                    <EnhancedResultCard />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <main className="quiz-main-container">
            <QuizInterface />
        </main>
    );
};

const QuizWindow = ({ quizData, rollNo, userName, userPhoto, liveMode, onLeaveLive }) => {
    // For live mode, construct quizData from liveMode info if quizData not provided
    const effectiveQuizData = quizData || (liveMode ? {
        quiz_id: liveMode.sessionCode || 'live-quiz',
        title: liveMode.quizInfo?.title || 'Live Quiz',
        time_limit_sec: liveMode.timeRemaining || 30,
        total_marks: (liveMode.totalQuestions || 10) * 100,
        questions: liveMode.currentQuestion ? [liveMode.currentQuestion] : [{
            question_id: 'placeholder',
            question_text: 'Waiting for question...',
            type: 'single_choice',
            options: []
        }]
    } : null);

    // Show loading only if truly no data available
    if (!effectiveQuizData && !liveMode) {
        return (
            <main className="quiz-main-container">
                <div className="submitting-card">
                    <h1>Loading Quiz...</h1>
                    <p>Please wait while we prepare your quiz.</p>
                </div>
            </main>
        );
    }

    // For live mode waiting in lobby, show waiting screen
    if (liveMode && liveMode.quizState === 'lobby') {
        return (
            <>
                <main className="quiz-main-container">
                    <LiveLobbyWaitingScreen liveMode={liveMode} onLeave={onLeaveLive} />
                </main>
                <style>{quizStyles}</style>
            </>
        );
    }

    // For live mode showing guidelines (new synchronized phase)
    if (liveMode && liveMode.quizState === 'guidelines') {
        return (
            <>
                <main className="quiz-main-container">
                    <LiveGuidelinesScreen liveMode={liveMode} />
                </main>
                <style>{quizStyles}</style>
            </>
        );
    }

    // For live mode countdown (synchronized)
    if (liveMode && liveMode.quizState === 'countdown') {
        return (
            <>
                <main className="quiz-main-container">
                    <CountdownScreen number={liveMode.countdownValue || 3} />
                </main>
                <style>{quizStyles}</style>
            </>
        );
    }

    // For live mode final results - show certificate/scorecard
    if (liveMode && (liveMode.quizState === 'results' || liveMode.quizState === 'ended' || liveMode.quizState === 'completed')) {
        return (
            <>
                <LiveResultsScreen 
                    liveMode={liveMode} 
                    userName={userName} 
                    rollNo={rollNo} 
                    userPhoto={userPhoto}
                    onLeaveLive={onLeaveLive}
                />
                <style>{quizStyles}</style>
            </>
        );
    }

    return (
        <>
            <QuizProvider quizData={effectiveQuizData} userId={rollNo} userName={userName} userPhoto={userPhoto} liveMode={liveMode} onLeaveLive={onLeaveLive}>
                <QuizFlowManager />
            </QuizProvider>
            <style>{quizStyles}</style>
        </>
    );
};

const LiveLobbyWaitingScreen = memo(({ liveMode, onLeave, onWarning }) => {
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [showFullScreenModal, setShowFullScreenModal] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [warningReason, setWarningReason] = useState('');
    
    // Request fullscreen
    const requestFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen request failed: ${err.message}`));
        }
        setShowFullScreenModal(false);
    }, []);
    
    // Warning trigger for lobby proctoring
    const triggerLobbyWarning = useCallback((reason = 'Violation detected') => {
        setWarningCount(currentCount => {
            const newCount = currentCount + 1;
            setWarningReason(reason);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
            if (onWarning) onWarning(newCount, reason);
            return newCount;
        });
    }, [onWarning]);
    
    // Request fullscreen immediately when lobby loads
    useEffect(() => {
        const timer = setTimeout(() => {
            requestFullScreen();
        }, 500); // Small delay to let the UI render
        return () => clearTimeout(timer);
    }, [requestFullScreen]);
    
    // Lobby proctoring - monitor fullscreen and tab switching
    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                triggerLobbyWarning('⛔ Exited full-screen mode in lobby');
                setShowFullScreenModal(true);
            }
        };
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerLobbyWarning('🔄 Switched to another tab during lobby');
            }
        };
        
        const handleWindowBlur = () => {
            if (document.fullscreenElement) {
                triggerLobbyWarning('🪟 Window focus lost in lobby');
            }
        };
        
        const handleKeyDown = (e) => {
            const isWindowsKey = e.key === 'Meta' || e.key === 'OS' || e.keyCode === 91 || e.keyCode === 92;
            const isEscape = e.key === 'Escape' || e.keyCode === 27;
            
            if (isWindowsKey) {
                e.preventDefault();
                e.stopPropagation();
                triggerLobbyWarning('🪟 Windows key detected in lobby!');
                setTimeout(() => requestFullScreen(), 100);
                return false;
            }
            if (isEscape) {
                e.preventDefault();
                e.stopPropagation();
                triggerLobbyWarning('⛔ Escape key is not allowed!');
                return false;
            }
        };
        
        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerLobbyWarning('🖱️ Right-click is disabled');
        };
        
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('contextmenu', handleContextMenu, true);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('contextmenu', handleContextMenu, true);
        };
    }, [triggerLobbyWarning, requestFullScreen]);
    
    // Note: Removed mouse tracking - particles now flow freely without cursor interaction
    
    return (
        <div className="lobby-enhanced-container">
            {/* Animated Background - Static gradients, no cursor interaction */}
            <div className="lobby-bg-layer" style={{
                background: `
                    radial-gradient(circle at 30% 30%, rgba(66, 133, 244, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 20% 80%, rgba(52, 168, 83, 0.12) 0%, transparent 40%),
                    radial-gradient(circle at 80% 20%, rgba(251, 188, 5, 0.12) 0%, transparent 40%),
                    radial-gradient(circle at 70% 70%, rgba(234, 67, 53, 0.08) 0%, transparent 60%)
                `
            }} />
            
            {/* Floating Particles */}
            <div className="lobby-particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="lobby-particle" style={{
                        '--delay': `${i * 0.5}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--duration': `${8 + Math.random() * 4}s`,
                        '--size': `${4 + Math.random() * 8}px`,
                        '--color': ['#4285F4', '#34A853', '#FBBC05', '#EA4335'][i % 4]
                    }} />
                ))}
            </div>
            
            {/* Grid Pattern */}
            <div className="lobby-grid-pattern" />
            
            {/* Main Content */}
            <div className="lobby-content-card">
                {/* Live Badge with Pulse */}
                <div className="lobby-live-badge">
                    <span className="live-dot"></span>
                    <span>LIVE SESSION</span>
                    <div className="live-pulse-ring"></div>
                    <div className="live-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Quiz Title */}
                <h1 className="lobby-title">{liveMode?.quizInfo?.title || 'Live Quiz'}</h1>
                <p className="lobby-subtitle">You've successfully joined! Waiting for the host to begin...</p>
                
                {/* Session Code Card */}
                <div className="lobby-session-card">
                    <div className="session-icon">
                        <IconTarget style={{ width: 28, height: 28 }} />
                    </div>
                    <div className="session-info">
                        <span className="session-label">SESSION CODE</span>
                        <span className="session-code">{liveMode?.sessionCode || '---'}</span>
                    </div>
                </div>
                
                {/* Stats Row */}
                <div className="lobby-stats-row">
                    <div className="lobby-stat-item">
                        <div className="stat-icon participants-icon">
                            <IconUser />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{liveMode?.participants?.length || 0}</span>
                            <span className="stat-label">Participants</span>
                        </div>
                    </div>
                    <div className="lobby-stat-divider" />
                    <div className="lobby-stat-item">
                        <div className="stat-icon ready-icon">
                            <IconClock />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">Ready</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>
                </div>
                
                {/* Waiting Animation */}
                <div className="lobby-waiting-container">
                    <div className="lobby-waiting-dots">
                        <div className="waiting-dot"></div>
                        <div className="waiting-dot"></div>
                        <div className="waiting-dot"></div>
                    </div>
                    <span className="waiting-text">Waiting for host</span>
                </div>
                
                {/* Action Buttons */}
                <div className="lobby-actions">
                    <button onClick={() => setShowGuidelines(true)} className="lobby-guidelines-btn">
                        <IconBook />
                        <span>View Guidelines</span>
                    </button>
                    {onLeave && (
                        <button onClick={onLeave} className="lobby-leave-btn">
                            <IconExit />
                            <span>Leave Session</span>
                        </button>
                    )}
                </div>
                
                {/* Footer Tip */}
                <div className="lobby-footer-tip">
                    <IconInfo />
                    <span>The quiz will begin automatically when the host starts the session</span>
                </div>
            </div>
            
            {/* Guidelines Modal */}
            {showGuidelines && (
                <div className="guidelines-modal-overlay" onClick={() => setShowGuidelines(false)}>
                    <div className="guidelines-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="guidelines-modal-header">
                            <h2>Quiz Guidelines</h2>
                            <button className="guidelines-close-btn" onClick={() => setShowGuidelines(false)}>
                                <IconClose />
                            </button>
                        </div>
                        <div className="guidelines-modal-body">
                            <ul className="guidelines-list modal-guidelines">
                                <li className="guideline-item">
                                    <div className="guideline-icon" style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4' }}>
                                        <IconFullScreen />
                                    </div>
                                    <div className="guideline-content">
                                        <strong>Full-Screen Mode Required</strong>
                                        <p>Stay in full-screen throughout the entire quiz duration.</p>
                                    </div>
                                </li>
                                <li className="guideline-item">
                                    <div className="guideline-icon" style={{ background: 'rgba(234, 67, 53, 0.15)', color: '#EA4335' }}>
                                        <IconTab />
                                    </div>
                                    <div className="guideline-content">
                                        <strong>No Tab Switching</strong>
                                        <p>Do not switch tabs or windows during the quiz.</p>
                                    </div>
                                </li>
                                <li className="guideline-item">
                                    <div className="guideline-icon" style={{ background: 'rgba(251, 188, 5, 0.15)', color: '#FBBC05' }}>
                                        <IconAlert />
                                    </div>
                                    <div className="guideline-content">
                                        <strong>Warning Limit</strong>
                                        <p>You'll receive warnings for violations. Be careful!</p>
                                    </div>
                                </li>
                                <li className="guideline-item">
                                    <div className="guideline-icon" style={{ background: 'rgba(52, 168, 83, 0.15)', color: '#34A853' }}>
                                        <IconMobile />
                                    </div>
                                    <div className="guideline-content">
                                        <strong>Mobile Users</strong>
                                        <p>Do not press the back button during the quiz.</p>
                                    </div>
                                </li>
                                <li className="guideline-item live-guideline">
                                    <div className="guideline-icon" style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4' }}>
                                        <IconClock />
                                    </div>
                                    <div className="guideline-content">
                                        <strong>Timed Questions</strong>
                                        <p>Each question has a time limit. Answer quickly for bonus points!</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="guidelines-modal-footer">
                            <button className="guidelines-confirm-btn" onClick={() => setShowGuidelines(false)}>
                                <IconCheck />
                                <span>I Understand</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Fullscreen Modal for Lobby - Professional style matching standard quiz */}
            {showFullScreenModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div style={{ background: 'linear-gradient(145deg, #1a1f3a 0%, #0d1025 100%)', border: '2px solid #EA4335', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 25px 80px rgba(234, 67, 53, 0.5), 0 0 100px rgba(234, 67, 53, 0.2)' }}>
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.2) 0%, rgba(234, 67, 53, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '3px solid #EA4335', animation: 'pulse 1.5s infinite' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                        </div>
                        <h3 style={{ color: '#EA4335', fontSize: '26px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>FULL-SCREEN REQUIRED</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px' }}>You must stay in <strong style={{ color: '#FBBC04', background: 'rgba(251, 188, 4, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>full-screen mode</strong> during the quiz session.</p>
                        <div style={{ background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.15) 0%, rgba(234, 67, 53, 0.08) 100%)', border: '1px solid rgba(234, 67, 53, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <span style={{ color: '#EA4335', fontSize: '16px', fontWeight: 700 }}>WARNING COUNT: {warningCount}</span>
                            </div>
                            <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0, lineHeight: '1.5', opacity: 0.8 }}>Exiting full-screen repeatedly may affect your quiz participation.</p>
                        </div>
                        <button onClick={requestFullScreen} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #34A853 0%, #2d8f47 100%)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '100%', boxShadow: '0 8px 25px rgba(52, 168, 83, 0.4)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                            Return to Full-Screen
                        </button>
                    </div>
                </div>
            )}
            
            {/* Warning Toast for Lobby */}
            {showWarning && (
                <div className="warning-toast" style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.95), rgba(200, 50, 50, 0.95))',
                    padding: '16px 32px', borderRadius: '12px', zIndex: 10000,
                    boxShadow: '0 10px 40px rgba(234, 67, 53, 0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    animation: 'slideDown 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <IconAlert style={{ color: 'white' }} />
                        <div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>
                                Warning #{warningCount}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                                {warningReason}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{lobbyStyles}</style>
        </div>
    );
});

const LiveGuidelinesScreen = memo(({ liveMode }) => {
    const guidelinesTimeLeft = liveMode?.guidelinesTimeLeft || 10;
    
    return (
        <div className="welcome-container live-guidelines-container">
            <div className="welcome-side active">
                <div className="guidelines-timer-badge">
                    <IconClock />
                    <span>Starting in {guidelinesTimeLeft}s</span>
                </div>
                
                <h2 className="welcome-title">Quiz Instructions</h2>
                
                <ul className="guidelines-list">
                    <li className="guideline-item">
                        <IconFullScreen />
                        <div><strong>Full-Screen Mode:</strong> Stay in full-screen throughout the quiz.</div>
                    </li>
                    <li className="guideline-item">
                        <IconTab />
                        <div><strong>No Tab Switching:</strong> Do not switch tabs or windows.</div>
                    </li>
                    <li className="guideline-item">
                        <IconAlert />
                        <div><strong>Warning Limit:</strong> Disqualified after <strong>5 warnings</strong>.</div>
                    </li>
                    <li className="guideline-item">
                        <IconMobile />
                        <div><strong>Mobile Users:</strong> Do not press the back button.</div>
                    </li>
                    <li className="guideline-item live-guideline">
                        <IconClock />
                        <div><strong>Live Mode:</strong> Each question has a <strong>time limit</strong>. Answer quickly!</div>
                    </li>
                </ul>
                
                <div className="progress-bar-container guidelines-progress">
                    <div className="progress-bar-fill" style={{ width: `${(guidelinesTimeLeft / 10) * 100}%`, transition: 'width 1s linear' }}></div>
                </div>
            </div>
        </div>
    );
});

const LiveResultsScreen = memo(({ liveMode, userName, rollNo, userPhoto, onLeaveLive }) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    const scorecardRef = useRef(null);
    
    const myRank = liveMode?.myRank || '-';
    const totalQuestions = liveMode?.totalQuestions || 0;
    const correctAnswers = Number.isFinite(liveMode?.correctAnswers) ? liveMode.correctAnswers : 0;
    const quizTitle = liveMode?.quizInfo?.title || 'Live Quiz';
    
    // Calculate percentage and score details (matching standard quiz format)
    const maxPossibleScore = totalQuestions * 100;
    const baseScore = correctAnswers * 100;
    const percentage = maxPossibleScore > 0 ? Math.round((baseScore / maxPossibleScore) * 100) : 0;
    
    // Animated percentage effect (same as standard quiz)
    useEffect(() => {
        if (percentage >= 80) setShowConfetti(true);
        if (percentage > 0) {
            const targetPercentage = percentage;
            let currentValue = 0;
            const duration = 2500;
            const startTime = Date.now();
            const animateValue = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                currentValue = targetPercentage * easeOutCubic;
                setAnimatedPercentage(currentValue);
                if (progress < 1) requestAnimationFrame(animateValue);
                else setAnimatedPercentage(targetPercentage);
            };
            requestAnimationFrame(animateValue);
        }
    }, [percentage]);
    
    const getPerformanceLevel = () => {
        if (percentage >= 90) return { level: 'Outstanding Performance', color: '#4285F4', badge: 'GOLD' };
        if (percentage >= 75) return { level: 'Excellent Performance', color: '#34A853', badge: 'SILVER' };
        if (percentage >= 60) return { level: 'Good Performance', color: '#FBBC05', badge: 'BRONZE' };
        return { level: 'Participation', color: '#EA4335', badge: 'PARTICIPANT' };
    };
    
    const performance = getPerformanceLevel();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Parse display name (same logic as standard quiz)
    const parseDisplayName = (name, rollNumber) => {
        if (!name) return { displayName: 'Participant', rollNo: rollNumber };
        if (name.startsWith(rollNumber + ' ')) return { displayName: name.substring(rollNumber.length + 1), rollNo: rollNumber };
        const rollPattern = /^(\d{2}[A-Z0-9]{5,})\s+(.+)$/i;
        const match = name.match(rollPattern);
        if (match) return { displayName: match[2], rollNo: match[1] };
        return { displayName: name, rollNo: rollNumber };
    };
    
    const { displayName, rollNo: parsedRollNo } = parseDisplayName(userName, rollNo);
    const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
    
    const handleSaveAsPng = useCallback(async () => {
        if (scorecardRef.current === null) return;
        try {
            const canvas = await html2canvas(scorecardRef.current, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true, allowTaint: true, width: 650, height: 450 });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `GDGC-Quiz-Certificate-${parsedRollNo}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error('Failed to generate certificate image!', err); alert('Failed to save certificate. Please try again.'); }
    }, [scorecardRef, parsedRollNo]);
    
    const handleShareOnLinkedIn = useCallback(() => {
        const shareText = `🎯 Thrilled to share my achievement!\n\nJust completed the "${quizTitle}" quiz organized by Google Developer Groups on Campus!\n\n📊 Score: ${baseScore}/${maxPossibleScore}\n✅ Accuracy: ${percentage.toFixed(1)}%\n🏆 Rank: #${myRank}\n\n#GDGC #GoogleDeveloperGroups #TechQuiz #ContinuousLearning #Development`;
        const currentUrl = window.location.href;
        const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent('GDGC Quiz Achievement')}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedInUrl, '_blank');
    }, [quizTitle, baseScore, maxPossibleScore, percentage, myRank]);

    return (
        <div className="page-with-layout">
            <PageBackground animationsReady={true} />
            <Navbar />
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
            
            <main className="scorecard-main-content">
                <div className="scorecard-wrapper">
                    {/* SAME CERTIFICATE FORMAT AS STANDARD QUIZ */}
                    <div ref={scorecardRef} className="professional-certificate">
                        <div className="cert-watermark"><img src={Logo} alt="" className="watermark-logo" /></div>
                        <div className="cert-left-bar"></div>
                        <div className="cert-main-content">
                            <div className="cert-header-row">
                                <div className="cert-title-block"><h1 className="cert-title">CERTIFICATE</h1><h2 className="cert-subtitle">OF COMPLETION</h2></div>
                                <div className="cert-award-badge">
                                    {/* SAME ANIMATED BADGE AS STANDARD QUIZ */}
                                    <svg width="90" height="95" viewBox="0 0 100 105" className="badge-svg">
                                        <defs>
                                            <linearGradient id="liveBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285F4"/><stop offset="50%" stopColor="#34A853"/><stop offset="100%" stopColor="#FBBC05"/></linearGradient>
                                            <linearGradient id="liveRibbonRedGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EA4335"/><stop offset="100%" stopColor="#C5221F"/></linearGradient>
                                            <linearGradient id="liveRibbonYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#F9AB00"/></linearGradient>
                                            <filter id="liveShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/></filter>
                                        </defs>
                                        <path d="M20 48 L15 100 L30 85 L40 102 L44 52" fill="url(#liveRibbonRedGrad)"/>
                                        <path d="M80 48 L85 100 L70 85 L60 102 L56 52" fill="url(#liveRibbonYellowGrad)"/>
                                        <circle cx="50" cy="38" r="34" fill="url(#liveBadgeGradient)" filter="url(#liveShadow)"/>
                                        <circle cx="50" cy="38" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                                        <text x="50" y="26" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="9" fontFamily="Arial">★★★</text>
                                        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Arial">{animatedPercentage.toFixed(0)}%</text>
                                        <text x="50" y="58" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="7" fontFamily="Arial" letterSpacing="1">SCORED</text>
                                    </svg>
                                </div>
                            </div>
                            <div className="cert-body">
                                <p className="cert-present-text">We proudly present this certificate to</p>
                                <div className="cert-recipient">
                                    <div className="cert-user-photo-wrapper">
                                        {userPhoto ? (<img src={userPhoto} alt={displayName} className="cert-user-photo" referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />) : null}
                                        <div className="cert-user-avatar" style={{ display: userPhoto ? 'none' : 'block' }}>{userInitial}</div>
                                    </div>
                                    <div className="cert-recipient-details"><h3 className="cert-user-name">{displayName}</h3><span className="cert-user-rollno">{parsedRollNo}</span></div>
                                </div>
                                <p className="cert-achievement-text">honouring completion of the quiz: <strong>"{quizTitle}"</strong></p>
                                <p className="cert-score-text">Achieved a score of <strong>{baseScore}/{maxPossibleScore}</strong> ({correctAnswers} correct out of {totalQuestions} questions) | Rank: <strong>#{myRank}</strong></p>
                            </div>
                        </div>
                        <div className="cert-signature-row">
                            <div className="cert-signature-block"><div className="signature-line">GDGC IARE</div><span className="signature-name">Google Developer Groups</span><span className="signature-title">ON CAMPUS • IARE</span></div>
                            <div className="cert-signature-block"><div className="signature-line" style={{ color: performance.color }}>{performance.level}</div><span className="signature-name">Performance Grade</span><span className="signature-title">ACHIEVEMENT LEVEL</span></div>
                        </div>
                        <div className="cert-footer-row">
                            <div className="cert-footer-center">
                                <div className="verified-badge-clean"><img src={Logo} alt="GDGC" className="verified-logo" crossOrigin="anonymous" /><span className="verified-text-clean">Verified</span></div>
                                <div className="cert-date-display">{currentDate}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SAME ACTION BUTTONS AS STANDARD QUIZ */}
                    <div className="scorecard-actions">
                        <button onClick={handleSaveAsPng} className="action-button save"><svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Download Certificate</button>
                        <button onClick={handleShareOnLinkedIn} className="action-button share"><svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Share on LinkedIn</button>
                    </div>
                    
                    {onLeaveLive && (
                        <button 
                            onClick={onLeaveLive}
                            style={{
                                marginTop: '16px',
                                padding: '12px 32px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Return to Home
                        </button>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
});

export default QuizWindow;
