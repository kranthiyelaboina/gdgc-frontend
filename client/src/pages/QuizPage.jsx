import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QuizWindow from './QuizWindow';
import PageBackground from '../components/common/PageBackground';
import LottieIntro from '../components/common/LottieIntro2';
import Toast from '../components/common/Toast';
import { QuizLandingGif, AdminLoginImage, Logo } from '../assets';
import { validateQuizCode, startQuiz, checkIsQuizAdmin, getSessionStatus } from '../services/quizService';
import { loginAdmin } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import { getValidationError } from '../utils/validators';
import { useQuizSocket } from '../hooks/useQuizSocket';

// Icon Components
const IconHash = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
);
const IconUser = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const IconArrowRight = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
const IconLoader = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
);
const IconLock = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const IconBroadcast = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
);
const IconClipboard = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
);
const IconTarget = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);

// StudentForm Component
const StudentForm = ({ onStudentSubmit, loading, error, autoFilledRollNumber, isLiveMode, onToggleLiveMode }) => {
    const [quizCode, setQuizCode] = useState('');
    const [rollNumber, setRollNumber] = useState(autoFilledRollNumber || '');
    const [isQuizCodeFocused, setIsQuizCodeFocused] = useState(false);
    const [isRollNumberFocused, setIsRollNumberFocused] = useState(false);

    useEffect(() => {
        if (autoFilledRollNumber) setRollNumber(autoFilledRollNumber);
    }, [autoFilledRollNumber]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onStudentSubmit(quizCode, rollNumber, isLiveMode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="inputGroup">
                <IconHash style={{ color: isQuizCodeFocused ? '#4285F4' : '#80868b' }} />
                <input type="text" value={quizCode} onChange={(e) => setQuizCode(e.target.value.toUpperCase())} placeholder="Quiz Code" className="input" onFocus={() => setIsQuizCodeFocused(true)} onBlur={() => setIsQuizCodeFocused(false)} required />
                <div className={`inputUnderline ${isQuizCodeFocused ? 'focused' : ''}`}></div>
            </div>
            <div className="inputGroup">
                <IconUser style={{ color: isRollNumberFocused ? '#4285F4' : '#80868b' }} />
                <input type="text" value={rollNumber} readOnly={true} placeholder="Roll Number (from Google Sign-in)" className="input" style={{ backgroundColor: '#e8f0fe', cursor: 'not-allowed', color: '#202124', fontWeight: '600' }} onFocus={() => setIsRollNumberFocused(true)} onBlur={() => setIsRollNumberFocused(false)} required />
                <div className={`inputUnderline ${isRollNumberFocused ? 'focused' : ''}`}></div>
            </div>
            
            <div className="liveModeToggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: isLiveMode ? 'linear-gradient(135deg, rgba(52, 168, 83, 0.1) 0%, rgba(66, 133, 244, 0.1) 100%)' : 'rgba(0, 0, 0, 0.03)', borderRadius: '12px', marginBottom: '16px', border: isLiveMode ? '1px solid rgba(52, 168, 83, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isLiveMode ? 'linear-gradient(135deg, #34A853 0%, #4285F4 100%)' : 'linear-gradient(135deg, #5f6368 0%, #80868b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isLiveMode ? <IconBroadcast style={{ color: 'white', width: 18, height: 18 }} /> : <IconClipboard style={{ color: 'white', width: 18, height: 18 }} />}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#5f6368', textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>{isLiveMode ? 'Live Quiz Mode' : 'Standard Quiz Mode'}</div>
                        <div style={{ fontSize: '11px', color: '#FFD700' }}>{isLiveMode ? 'Real-time with host control' : 'Self-paced quiz'}</div>
                    </div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input type="checkbox" checked={isLiveMode} onChange={(e) => onToggleLiveMode(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isLiveMode ? '#34A853' : '#ccc', transition: '0.3s', borderRadius: '26px' }}>
                        <span style={{ position: 'absolute', height: '20px', width: '20px', left: isLiveMode ? '25px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></span>
                    </span>
                </label>
            </div>
            
            <button type="submit" disabled={loading} className="submitButton" style={{ background: isLiveMode ? 'linear-gradient(135deg, #34A853 0%, #4285F4 100%)' : 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}>
                {loading ? <IconLoader className="spinAnimation" /> : (<>{isLiveMode && <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block', marginRight: '8px', animation: 'pulse 1.5s ease-in-out infinite', boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}></span>}{isLiveMode ? 'Join Live Session' : 'Start Quiz'} <IconArrowRight /></>)}
            </button>
            {error && <p className="errorText">{error}</p>}
        </form>
    );
};

// PLACEHOLDER_ADMIN_FORM

// AdminForm Component
const AdminForm = ({ onAdminSubmit, loading, error }) => {
    const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        const usernameError = getValidationError('username', formData.username);
        const passwordError = getValidationError('password', formData.password);
        if (usernameError) newErrors.username = usernameError;
        if (passwordError) newErrors.password = passwordError;
        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onAdminSubmit(formData.username, formData.password, formData.rememberMe);
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ padding: '12px', background: 'rgba(234, 67, 53, 0.1)', border: '1px solid #EA4335', borderRadius: '8px', color: '#EA4335', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}
            <div className="inputGroup">
                <IconUser />
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Admin Username" className="input" required />
            </div>
            {validationErrors.username && <div style={{ color: '#EA4335', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', marginLeft: '4px' }}>{validationErrors.username}</div>}
            <div className="inputGroup" style={{ position: 'relative' }}>
                <IconLock />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="input" style={{ paddingRight: '45px' }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: '#666' }}>
                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                </button>
            </div>
            {validationErrors.password && <div style={{ color: '#EA4335', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', marginLeft: '4px' }}>{validationErrors.password}</div>}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginTop: '-8px' }}>
                <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} style={{ width: '16px', height: '16px', marginRight: '8px', cursor: 'pointer' }} />
                <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>Remember Me</label>
            </div>
            <button type="submit" disabled={loading} className="submitButton">
                {loading ? <><IconLoader className="spinAnimation" /> Logging in...</> : <>Login as Admin <IconArrowRight /></>}
            </button>
        </form>
    );
};

// PLACEHOLDER_QUIZPAGE_START

// Main QuizPage Component
const QuizPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAppContext();
    
    // Core state
    const [step, setStep] = useState('entry');
    const [quizMode, setQuizMode] = useState('standard');
    const [activeQuizCode, setActiveQuizCode] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [currentRollNumber, setCurrentRollNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adminError, setAdminError] = useState('');
    const [adminLoading, setAdminLoading] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('gdgcIntroShown'));
    const [animationsReady, setAnimationsReady] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const clickCountRef = useRef(0);
    const clickTimeoutRef = useRef(null);

    // Firebase auth state
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Live quiz state
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [liveSessionCode, setLiveSessionCode] = useState('');
    const [liveQuizState, setLiveQuizState] = useState('idle');
    const [liveQuizInfo, setLiveQuizInfo] = useState(null);
    const [liveParticipants, setLiveParticipants] = useState([]);
    const [liveCurrentQuestion, setLiveCurrentQuestion] = useState(null);
    const [liveQuestionIndex, setLiveQuestionIndex] = useState(0);
    const [liveTotalQuestions, setLiveTotalQuestions] = useState(0);
    const [liveTimeRemaining, setLiveTimeRemaining] = useState(0);
    const [liveSelectedOption, setLiveSelectedOption] = useState(null);
    const [liveHasAnswered, setLiveHasAnswered] = useState(false);
    const [liveLastResult, setLiveLastResult] = useState(null);
    const [liveLeaderboard, setLiveLeaderboard] = useState([]);
    const [liveMyRank, setLiveMyRank] = useState(null);
    const [liveMyScore, setLiveMyScore] = useState(0);
    const [liveCorrectAnswers, setLiveCorrectAnswers] = useState(0);
    const [isJoiningLive, setIsJoiningLive] = useState(false);
    const [liveGuidelinesTimeLeft, setLiveGuidelinesTimeLeft] = useState(10);
    const [liveCountdownValue, setLiveCountdownValue] = useState(3);
    const liveTimerRef = useRef(null);
    const liveQuestionStartRef = useRef(null);
    const liveClockOffsetRef = useRef(0);
    const liveEndsAtRef = useRef(0); // Store question end time for stable timer closure

    // Socket hook
    const { isConnected, connect, disconnect, emit, on, off } = useQuizSocket();

    // PLACEHOLDER_HELPERS

    // Extract roll number from email
    const extractRollNumber = (email) => {
        if (!email) return '';
        const parts = email.split('@');
        return parts.length > 0 ? parts[0].toUpperCase() : '';
    };

    // Firebase auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUser(user);
                setCurrentRollNumber(extractRollNumber(user.email || ''));
                setShowLoginModal(false);
                setAuthError('');
            } else {
                setFirebaseUser(null);
                setShowLoginModal(true);
                setCurrentRollNumber('');
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Google sign-in handler
    const handleGoogleSignIn = async () => {
        setGoogleLoginLoading(true);
        setAuthError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setFirebaseUser(result.user);
            setCurrentRollNumber(extractRollNumber(result.user.email || ''));
            setShowLoginModal(false);
            setToastMessage(`Welcome, ${result.user.displayName || extractRollNumber(result.user.email)}!`);
            setToastType('success');
            setShowToast(true);
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                setAuthError('Sign-in was cancelled. Please try again.');
            } else if (error.code === 'auth/unauthorized-domain') {
                setAuthError('This domain is not authorized for sign-in.');
            } else {
                setAuthError(error.message || 'Failed to sign in with Google.');
            }
        } finally {
            setGoogleLoginLoading(false);
        }
    };

    // Sign out handler
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setFirebaseUser(null);
            setCurrentRollNumber('');
            setShowLoginModal(true);
            setToastMessage('Signed out successfully.');
            setToastType('success');
            setShowToast(true);
        } catch (error) { }
    };

    // Intro and animation effects
    useEffect(() => {
        if (!showIntro) {
            sessionStorage.setItem('gdgcIntroShown', 'true');
            const timer = setTimeout(() => setAnimationsReady(true), 50);
            return () => clearTimeout(timer);
        }
    }, [showIntro]);

    useEffect(() => {
        document.body.style.overflow = showIntro ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [showIntro]);

    const handleIntroComplete = () => setShowIntro(false);
    const handleToggleLiveMode = (enabled) => setIsLiveMode(enabled);

    // PLACEHOLDER_SOCKET_EFFECTS

    // Live mode socket listeners
    useEffect(() => {
        console.log('🔌 Socket effect check - quizMode:', quizMode, 'isConnected:', isConnected);
        if (quizMode !== 'live' || !isConnected) {
            console.log('🔌 Socket effect - skipping (not live or not connected)');
            return;
        }
        console.log('🔌 Socket effect - registering listeners');

        on('participant:joined', (data) => {
            setLiveParticipants(prev => {
                const exists = prev.some(p => p.oderId === data.oderId);
                return exists ? prev : [...prev, { oderId: data.oderId, userName: data.userName, userPhoto: data.userPhoto }];
            });
        });

        on('participant:left', (data) => setLiveParticipants(prev => prev.filter(p => p.oderId !== data.oderId)));

        // Guidelines phase - synchronized 10 second display
        on('session:guidelines', (data) => {
            console.log('📋 Received session:guidelines:', data);
            setLiveQuizState('guidelines');
            setLiveGuidelinesTimeLeft(data.timeLeft || 10);
            setStep('quiz');
            
            // Start countdown for guidelines
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
            let timeLeft = data.timeLeft || 10;
            liveTimerRef.current = setInterval(() => {
                timeLeft -= 1;
                setLiveGuidelinesTimeLeft(timeLeft);
                if (timeLeft <= 0) clearInterval(liveTimerRef.current);
            }, 1000);
        });

        // Countdown phase - synchronized 3 second countdown
        on('session:countdown', (data) => {
            console.log('⏱️ Received session:countdown:', data);
            setLiveQuizState('countdown');
            setLiveCountdownValue(data.count || 3);
        });

        on('question:start', (data) => {
            console.log('❓ Received question:start:', data);
            // Keep options in their original format: [{ option_id, text }]
            // The Question component expects this structure
            const transformedQuestion = {
                ...data,
                question: data.question_text,
                // Preserve the original options structure for Question component
                options: data.options || [],
                originalOptions: data.options
            };
            setLiveCurrentQuestion(transformedQuestion);
            setLiveQuestionIndex(data.index);
            setLiveTotalQuestions(data.total);
            const serverNow = data.serverTime || data.serverTimestamp || Date.now();
            const clockOffset = Date.now() - serverNow;
            liveClockOffsetRef.current = clockOffset;
            const endsAt = data.endsAt ? new Date(data.endsAt).getTime() : serverNow + (data.timeLimit * 1000);
            // Store endsAt in a ref to avoid stale closure issues
            liveEndsAtRef.current = endsAt;
            // Use Math.round for smoother timer display (avoids 1-second lag)
            const computeRemaining = () => Math.max(0, Math.round((liveEndsAtRef.current - (Date.now() - liveClockOffsetRef.current)) / 1000));
            setLiveTimeRemaining(computeRemaining());
            setLiveSelectedOption(null);
            setLiveHasAnswered(false);
            setLiveLastResult(null);
            setLiveQuizState('question');
            liveQuestionStartRef.current = data.startedAt ? new Date(data.startedAt).getTime() : serverNow;
            setStep('quiz');
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
            // Use 100ms interval for smoother updates
            liveTimerRef.current = setInterval(() => {
                const remaining = computeRemaining();
                setLiveTimeRemaining(remaining);
                if (remaining <= 0) clearInterval(liveTimerRef.current);
            }, 100);
        });

        on('question:end', (data) => {
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
            setLiveTimeRemaining(0);
            setLiveLeaderboard(data.leaderboard || []);
            setLiveQuizState('leaderboard');
            const myEntry = data.leaderboard?.find(e => e.oderId === currentRollNumber);
            if (myEntry) { setLiveMyScore(myEntry.score); setLiveMyRank(myEntry.rank); }
        });

        on('question:personal-result', (data) => {
            setLiveLastResult(data);
            if (data.yourScore !== undefined) setLiveMyScore(data.yourScore);
            if (data.yourRank !== undefined) setLiveMyRank(data.yourRank);
        });

        on('quiz:complete', (data) => {
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
            setLiveLeaderboard(data.leaderboard || []);
            setLiveQuizState('results');
        });

        on('quiz:personal-final', (data) => {
            if (data.finalScore !== undefined) setLiveMyScore(data.finalScore);
            if (data.finalRank !== undefined) setLiveMyRank(data.finalRank);
            if (data.correctAnswers !== undefined) setLiveCorrectAnswers(data.correctAnswers);
            if (data.totalQuestions !== undefined) setLiveTotalQuestions(data.totalQuestions);
        });
        on('session:error', (data) => { setError(data.message); setIsJoiningLive(false); });
        on('session:ended', () => { setLiveQuizState('ended'); if (liveTimerRef.current) clearInterval(liveTimerRef.current); });

        return () => {
            off('participant:joined'); off('participant:left'); off('question:start'); off('question:end');
            off('question:personal-result'); off('quiz:complete'); off('quiz:personal-final');
            off('session:error'); off('session:ended'); off('session:guidelines'); off('session:countdown');
            if (liveTimerRef.current) clearInterval(liveTimerRef.current);
        };
    }, [quizMode, isConnected, on, off, currentRollNumber]);

    // PLACEHOLDER_HANDLERS

    // Student submit handler - unified for both modes
    const handleStudentSubmit = async (quizCode, rollNumber, liveMode) => {
        setError('');
        if (!quizCode || !rollNumber) {
            setError('Please fill in both Quiz Code and Roll Number.');
            return;
        }
        const normalizedCode = quizCode.trim().toUpperCase();
        setActiveQuizCode(normalizedCode);
        setCurrentRollNumber(rollNumber);
        setQuizMode(liveMode ? 'live' : 'standard');
        setIsLiveMode(liveMode);

        // Reset live state
        setLiveSessionCode(liveMode ? normalizedCode : '');
        setLiveQuizInfo(null); setLiveParticipants([]); setLiveCurrentQuestion(null);
        setLiveQuestionIndex(0); setLiveTotalQuestions(0); setLiveTimeRemaining(0);
        setLiveSelectedOption(null); setLiveHasAnswered(false); setLiveLastResult(null);
        setLiveLeaderboard([]); setLiveMyScore(0); setLiveMyRank(null); setLiveCorrectAnswers(0); setLiveQuizState('idle');

        if (liveMode) {
            // Live mode: connect and join session
            setIsJoiningLive(true);
            try {
                const response = await getSessionStatus(normalizedCode);
                if (!response.success) throw new Error('Live session not found.');
                connect({ oderId: rollNumber, userName: firebaseUser?.displayName || rollNumber, userPhoto: firebaseUser?.photoURL });
                setTimeout(() => {
                    emit('session:join', { sessionCode: normalizedCode, oderId: rollNumber, userName: firebaseUser?.displayName || rollNumber, userPhoto: firebaseUser?.photoURL }, (res) => {
                        if (res.error) { setError(res.error); setIsJoiningLive(false); }
                        else {
                            setLiveQuizInfo({ title: res.quizTitle, totalQuestions: res.totalQuestions });
                            if (res.participants) setLiveParticipants(res.participants);
                            setLiveQuizState('lobby');
                            setStep('quiz'); // CRITICAL: Set step to 'quiz' so QuizWindow renders
                            setIsJoiningLive(false);
                        }
                    });
                }, 200);
            } catch (err) {
                setError(err.message || 'Live session not found.');
                setIsJoiningLive(false);
            }
        } else {
            // Standard mode: load quiz
            setLoading(true);
            setStep('quiz');
        }
    };

    // Standard mode: fetch quiz when step changes
    useEffect(() => {
        if (quizMode !== 'standard' || step !== 'quiz' || !activeQuizCode || !currentRollNumber || quizData) return;
        let cancelled = false;
        const loadQuiz = async () => {
            setLoading(true);
            try {
                const adminCheck = await checkIsQuizAdmin(activeQuizCode, currentRollNumber);
                if (cancelled) return;
                if (adminCheck.isAdmin) {
                    setLoading(false);
                    navigate(`/quiz/host/${adminCheck.quizId}`, { state: { quiz: adminCheck.quiz, userInfo: { oderId: currentRollNumber, userName: adminCheck.userName || currentRollNumber } } });
                    return;
                }
                const data = await startQuiz({ code: activeQuizCode, rollNo: currentRollNumber });
                if (cancelled) return;
                setQuizData(data);
            } catch (err) {
                if (cancelled) return;
                const errorMessage = err.message || err.error || 'Could not connect to the server.';
                setError(errorMessage);
                if (errorMessage.includes('already attempted')) { setToastMessage(errorMessage); setToastType('error'); setShowToast(true); }
                setStep('entry');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadQuiz();
        return () => { cancelled = true; };
    }, [quizMode, step, activeQuizCode, currentRollNumber, quizData, navigate]);

    // Live answer handler
    // Note: optionId is the option_id string (e.g., 'A', 'B', 'C', 'D') from the Question component
    const handleLiveAnswer = (optionId) => {
        if (liveHasAnswered || !liveCurrentQuestion) return;
        setLiveSelectedOption(optionId);
        setLiveHasAnswered(true);
        const nowServer = Date.now() - liveClockOffsetRef.current;
        const timeTaken = liveQuestionStartRef.current ? Math.max(0, Math.floor((nowServer - liveQuestionStartRef.current) / 1000)) : liveCurrentQuestion?.timeLimit;
        // optionId is already the correct option_id string, send it directly
        emit('answer:submit', { sessionCode: liveSessionCode.trim().toUpperCase(), questionIndex: liveQuestionIndex, selectedOption: optionId, timeTaken });
    };

    // Leave live session
    const handleLeaveLiveSession = () => {
        emit('session:leave', { sessionCode: liveSessionCode.trim().toUpperCase() });
        disconnect();
        setQuizMode('standard'); setIsLiveMode(false); setActiveQuizCode(''); setStep('entry');
        setLiveQuizState('idle'); setLiveSessionCode(''); setLiveQuizInfo(null); setLiveParticipants([]);
        setLiveCurrentQuestion(null); setLiveQuestionIndex(0); setLiveTotalQuestions(0); setLiveTimeRemaining(0);
        setLiveSelectedOption(null); setLiveHasAnswered(false); setLiveLastResult(null);
        setLiveLeaderboard([]); setLiveMyScore(0); setLiveMyRank(null);
        if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };

    // Secret admin access
    const handleSecretAdminAccess = () => {
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickCountRef.current += 1;
        if (clickCountRef.current === 5) { clickCountRef.current = 0; setShowAdmin(true); }
        else { clickTimeoutRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000); }
    };

    // Admin submit
    const handleAdminSubmit = async (adminUsername, adminPassword, rememberMe) => {
        setAdminError('');
        if (!adminUsername || !adminPassword) { setAdminError('Please fill in both username and password.'); return; }
        try {
            setAdminLoading(true);
            const data = await loginAdmin({ username: adminUsername, password: adminPassword });
            localStorage.setItem('adminUsername', data.user?.username || adminUsername);
            setUser(data.user);
            setToastMessage('Login successful! Redirecting to dashboard...');
            setToastType('success');
            setShowToast(true);
            setTimeout(() => navigate('/admin/dashboard', { replace: true, state: { user: data.user } }), 500);
        } catch (err) {
            const errorMessage = err.error || err.message || 'Login failed.';
            setAdminError(errorMessage);
            setToastMessage(errorMessage);
            setToastType('error');
            setShowToast(true);
        } finally {
            setAdminLoading(false);
        }
    };

    // PLACEHOLDER_RENDER

    // Render QuizWindow when in quiz step (both standard and live use same component)
    if (step === 'quiz') {
        const liveModeData = quizMode === 'live' ? {
            currentQuestion: liveCurrentQuestion, questionIndex: liveQuestionIndex, totalQuestions: liveTotalQuestions,
            timeRemaining: liveTimeRemaining, selectedOption: liveSelectedOption, hasAnswered: liveHasAnswered,
            quizState: liveQuizState, quizInfo: liveQuizInfo, participants: liveParticipants, sessionCode: liveSessionCode,
            leaderboard: liveLeaderboard, myScore: liveMyScore, myRank: liveMyRank, lastResult: liveLastResult,
            correctAnswers: liveCorrectAnswers,
            onAnswer: handleLiveAnswer, emit,
            guidelinesTimeLeft: liveGuidelinesTimeLeft, countdownValue: liveCountdownValue,
            // Add showLeaderboard flag for QuizInterface to show leaderboard overlay
            showLeaderboard: liveQuizState === 'leaderboard'
        } : null;

        return (
            <QuizWindow
                quizData={quizMode === 'standard' ? quizData : undefined}
                liveMode={liveModeData || undefined}
                rollNo={currentRollNumber}
                userName={firebaseUser?.displayName || currentRollNumber}
                userPhoto={firebaseUser?.photoURL || null}
                onLeaveLive={quizMode === 'live' ? handleLeaveLiveSession : undefined}
            />
        );
    }

    // Loading state
    if (authLoading) {
        return (
            <div className="quiz-page-container">
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
                    <IconLoader className="spinAnimation" style={{ width: 48, height: 48, color: '#4285F4' }} />
                </div>
            </div>
        );
    }

    // PLACEHOLDER_MAIN_RETURN

    // Main entry page render
    return (
        <div className="quiz-page-container">
            {/* Google Sign-in Modal */}
            {showLoginModal && !showIntro && (
                <div className="login-modal-overlay">
                    <div className="login-modal" style={{ backgroundImage: `url(${loginModalBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: 'transparent' }}>
                        <div className="login-modal-header">
                            <div className="gdgc-logo-container"><img src={Logo} alt="GDGC Logo" className="gdgc-logo" /></div>
                            <h2 className="login-modal-title">Sign in to Continue</h2>
                            <p className="login-modal-subtitle">Sign in with your Google account to access the quiz.<br/><span className="login-modal-email-domain">@iare.ac.in</span> college email is preferred.</p>
                        </div>
                        {authError && (
                            <div className="auth-error-message">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {authError}
                            </div>
                        )}
                        <button className="google-signin-button" onClick={handleGoogleSignIn} disabled={googleLoginLoading}>
                            {googleLoginLoading ? <IconLoader className="spinAnimation" /> : (
                                <><svg viewBox="0 0 48 48" width="24" height="24"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</>
                            )}
                        </button>
                        <p className="login-modal-note">Your roll number will be automatically extracted from your college email.</p>
                    </div>
                </div>
            )}

            {showIntro && <LottieIntro onComplete={handleIntroComplete} />}
            
            <div className={showLoginModal && !showIntro ? 'content-blurred' : ''}>
                <Navbar animationsReady={animationsReady} onSecretAdminClick={handleSecretAdminAccess} />
                <div className={`page-content ${showIntro ? 'hidden' : 'visible'} ${animationsReady ? 'fadeInUp' : ''}`}>
                    <PageBackground animationsReady={animationsReady} />
                    <main className="pageWrapper">
                        <div className="contentWrapper">
                            {/* User banner */}
                            {firebaseUser && !showAdmin && (
                                <div className="signed-in-user-banner">
                                    <div className="user-info">
                                        {firebaseUser.photoURL && <img src={firebaseUser.photoURL} alt="Profile" className="user-avatar" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />}
                                        <div className="user-avatar-fallback" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4285F4, #34A853)', display: firebaseUser.photoURL ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold', border: '2px solid #4285F4' }}>
                                            {(firebaseUser.displayName || firebaseUser.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{firebaseUser.displayName || 'Student'}</span>
                                            <span className="user-email">{firebaseUser.email}</span>
                                        </div>
                                    </div>
                                    <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
                                </div>
                            )}

                            {/* Flipper container */}
                            <div className={`flipperContainer ${showAdmin ? 'isFlipped' : ''}`}>
                                <div className="flipperFront">
                                    <div className="panelContainer">
                                        <div className="leftPanel">
                                            <h1 className="title">GDGC Quiz <span className="gradientText">Arena</span></h1>
                                            <p className="subtitle">Enter your details below to begin the challenge.</p>
                                            <StudentForm onStudentSubmit={handleStudentSubmit} loading={loading || isJoiningLive} error={error} autoFilledRollNumber={currentRollNumber} isLiveMode={isLiveMode} onToggleLiveMode={handleToggleLiveMode} />
                                        </div>
                                        <div className="rightPanel"><img src={QuizLandingGif} alt="Tech quiz animation" className="image" /></div>
                                    </div>
                                </div>
                                <div className="flipperBack">
                                    <div className="panelContainer">
                                        <div className="rightPanel adminImagePanel"><img src={AdminLoginImage} alt="Admin illustration" className="image" /></div>
                                        <div className="leftPanel">
                                            <h1 className="title">Admin <span className="gradientText">Login</span></h1>
                                            <p className="subtitle">Please login to manage the quiz arena.</p>
                                            <AdminForm onAdminSubmit={handleAdminSubmit} loading={adminLoading} error={adminError} />
                                            <p className="toggleLink" onClick={() => setShowAdmin(false)}>← Back to Student Entry</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}

            {/* Live Waiting Room Modal */}
            {liveQuizState === 'lobby' && step !== 'quiz' && (
                <div className="live-waiting-modal-overlay">
                    <div className="live-waiting-modal">
                        <div className="live-waiting-header">
                            <div className="live-indicator"><div className="live-pulse" /><span>LIVE SESSION</span></div>
                            <button onClick={handleLeaveLiveSession} className="modal-close-btn" title="Leave Session">×</button>
                        </div>
                        <div className="live-waiting-content">
                            <h2 className="live-quiz-title">{liveQuizInfo?.title || 'Live Quiz'}</h2>
                            <div className="session-code-display">
                                <span className="session-label">Session Code</span>
                                <span className="session-code">{liveSessionCode}</span>
                            </div>
                            <div className="quiz-info-badges">
                                <div className="info-badge"><IconTarget style={{ width: 20, height: 20, stroke: '#4285F4' }} /><span>{liveQuizInfo?.totalQuestions || '?'} Questions</span></div>
                                <div className="info-badge"><IconUser style={{ width: 20, height: 20, stroke: '#4285F4' }} /><span>{liveParticipants?.length || 0} Participant{liveParticipants?.length !== 1 ? 's' : ''}</span></div>
                            </div>
                            <div className="participants-section">
                                <h3 className="participants-heading">Participants in Lobby</h3>
                                <div className="participants-grid">
                                    {liveParticipants && liveParticipants.length > 0 ? liveParticipants.map((p, idx) => (
                                        <div key={p.oderId || idx} className="participant-card">
                                            {p.userPhoto ? <img src={p.userPhoto} alt={p.userName} className="participant-avatar" referrerPolicy="no-referrer" /> : <div className="participant-avatar-placeholder">{(p.userName || '?').charAt(0).toUpperCase()}</div>}
                                            <span className="participant-name">{p.userName || p.oderId}</span>
                                        </div>
                                    )) : <p className="no-participants">No participants yet</p>}
                                </div>
                            </div>
                            <div className="waiting-status">
                                <div className="loading-dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
                                <p>Waiting for host to start the quiz...</p>
                            </div>
                        </div>
                        <div className="live-waiting-footer">
                            <button onClick={handleLeaveLiveSession} className="leave-session-btn">Leave Session</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .quiz-page-container { background-color: #F8F9FA; font-family: 'Inter', sans-serif; }
                .pageWrapper { display: flex; flex-direction: column; min-height: 100vh; position: relative; }
                .contentWrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 120px 20px 80px 20px; perspective: 1500px; }
                .flipperContainer { transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55); transform-style: preserve-3d; position: relative; width: 100%; max-width: 1000px; height: 600px; }
                .flipperContainer.isFlipped { transform: rotateY(180deg); }
                .flipperFront, .flipperBack { backface-visibility: hidden; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                .flipperBack { transform: rotateY(180deg); }
                .panelContainer { width: 100%; height: 100%; background: url('/template.png'), rgba(255, 255, 255, 0.85); background-size: cover; background-position: center; backdrop-filter: blur(20px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.25); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12); display: flex; overflow: hidden; position: relative; }
                .panelContainer::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: transparent; border-radius: 32px; z-index: 0; opacity: 0.8; }
                .panelContainer::after { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(90deg, #4285F4 0%, #34A853 25%, #FBBC04 50%, #EA4335 75%, #4285F4 100%); background-size: 300% 300%; animation: googleBorderFlow 6s linear infinite; border-radius: 34px; z-index: -1; opacity: 0.6; }
                @keyframes googleGradientFlow { 0% { background-position: 0% 50%; } 25% { background-position: 50% 100%; } 50% { background-position: 100% 50%; } 75% { background-position: 50% 0%; } 100% { background-position: 0% 50%; } }
                @keyframes googleBorderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .leftPanel { flex: 1.1; padding: 50px; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 1; }
                .rightPanel { flex: 0.9; display: flex; align-items: center; justify-content: center; padding: 40px; background: #e8f0fe; border-top-right-radius: 32px; border-bottom-right-radius: 32px; position: relative; z-index: 1; }
                .adminImagePanel { flex: 0.9; display: flex; align-items: center; justify-content: center; padding: 40px; background: #e8f0fe; border-top-right-radius: 32px; border-bottom-right-radius: 32px; position: relative; z-index: 1; }
                .image { max-width: 100%; max-height: 420px; border-radius: 24px; display: block; }
                .title { font-size: 44px; font-weight: 800; color: #202124; line-height: 1.2; margin-bottom: 12px; }
                .gradientText { background: linear-gradient(90deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 75%, #4285F4 100%); background-size: 300% 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(-1px 0 rgba(255, 255, 255, 0.6)) drop-shadow(-2px 0 rgba(255, 255, 255, 0.4)); animation: gradientFlow 6s ease infinite; transform: translateX(1px) translateY(-3px); font-family: 'Press Start 2P', cursive; font-size: 34px; line-height: 1.2; vertical-align: middle; display: inline-block; }
                @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .subtitle { font-size: 17px; color: #5f6368; margin-bottom: 35px; }
                .errorText { color: #DB4437; font-size: 14px; margin-top: 16px; text-align: center; font-weight: 500; }
                .inputGroup { position: relative; margin-bottom: 22px; }
                .inputGroup svg { position: absolute; top: 50%; left: 18px; transform: translateY(-50%); color: #80868b; transition: color 0.3s ease; height: 20px; width: 20px; }
                .input { width: 100%; height: 52px; border-radius: 12px; padding: 0 16px 0 54px; background: rgba(240, 244, 249, 0.9); border: 1px solid transparent; font-size: 16px; font-weight: 500; color: #202124; outline: none; transition: all 0.3s ease; }
                .input:focus { background: white; border-color: #a9c5f5; box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1); }
                .inputUnderline { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); height: 2px; width: 0%; background: linear-gradient(90deg, #4285F4, #34A853); transition: width 0.4s ease; }
                .inputUnderline.focused { width: 100%; }
                .submitButton { width: 100%; height: 52px; border-radius: 12px; border: none; background: linear-gradient(45deg, #4285F4, #1E88E5); background-size: 200% 200%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 17px; font-weight: 600; transition: all 0.4s ease; margin-top: 10px; }
                .submitButton:hover:not(:disabled) { background-position: 100% 50%; transform: scale(1.02); box-shadow: 0 4px 15px rgba(66, 133, 244, 0.3); }
                .submitButton:disabled { opacity: 0.6; cursor: not-allowed; }
                .page-content.fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
                .spinAnimation { animation: spin 1s linear infinite; }
                .hidden { opacity: 0; visibility: hidden; }
                .visible { opacity: 1; visibility: visible; transition: opacity 0.4s ease-in-out; }
                .toggleLink { text-align: center; font-size: 14px; color: #5f6368; margin-top: 20px; cursor: pointer; text-decoration: underline; transition: color 0.3s ease; }
                .toggleLink:hover { color: #4285F4; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
                /* Live Waiting Modal */
                .live-waiting-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease; }
                .live-waiting-modal { background: white; border-radius: 24px; width: 90%; max-width: 700px; max-height: 85vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .live-waiting-header { background: linear-gradient(135deg, #4285F4, #34A853); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
                .live-indicator { display: flex; align-items: center; gap: 12px; color: white; font-weight: 600; font-size: 0.95rem; }
                .live-pulse { width: 12px; height: 12px; background: white; border-radius: 50%; animation: pulse 2s infinite; }
                .modal-close-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.1); color: white; font-size: 28px; line-height: 1; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .modal-close-btn:hover { background: rgba(255, 255, 255, 0.2); transform: rotate(90deg); }
                .live-waiting-content { flex: 1; padding: 32px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
                .live-quiz-title { font-size: 1.8rem; font-weight: 700; color: #202124; text-align: center; margin: 0; }
                .session-code-display { background: linear-gradient(135deg, #F1F3F4, #E8EAED); padding: 16px 24px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 2px solid #DADCE0; }
                .session-label { font-size: 0.85rem; color: #5F6368; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
                .session-code { font-size: 2rem; font-weight: 800; color: #4285F4; letter-spacing: 4px; font-family: 'Courier New', monospace; }
                .quiz-info-badges { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
                .info-badge { display: flex; align-items: center; gap: 8px; background: #F8F9FA; padding: 10px 20px; border-radius: 999px; border: 1px solid #DADCE0; font-weight: 500; color: #5F6368; }
                .participants-section { display: flex; flex-direction: column; gap: 16px; }
                .participants-heading { font-size: 1.1rem; font-weight: 600; color: #202124; margin: 0; text-align: center; }
                .participants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; max-height: 250px; overflow-y: auto; padding: 4px; }
                .participant-card { display: flex; align-items: center; gap: 12px; background: #F8F9FA; padding: 12px; border-radius: 12px; border: 1px solid #E8EAED; transition: all 0.2s; animation: slideIn 0.3s ease; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                .participant-card:hover { background: #E8F0FE; border-color: #4285F4; }
                .participant-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                .participant-avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #4285F4, #34A853); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; border: 2px solid white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                .participant-name { flex: 1; font-weight: 500; color: #202124; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .no-participants { text-align: center; color: #5F6368; font-style: italic; padding: 20px; }
                .waiting-status { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px; background: #FEF7E0; border-radius: 16px; border: 1px solid #FBBC05; }
                .loading-dots { display: flex; gap: 8px; }
                .loading-dots .dot { width: 10px; height: 10px; border-radius: 50%; background: #FBBC05; animation: bounce 1.4s infinite ease-in-out; }
                .loading-dots .dot:nth-child(1) { animation-delay: 0s; }
                .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }
                .waiting-status p { margin: 0; color: #5F6368; font-weight: 500; font-size: 0.95rem; }
                .live-waiting-footer { padding: 20px 24px; border-top: 1px solid #E8EAED; background: #F8F9FA; }
                .leave-session-btn { width: 100%; padding: 14px 24px; background: white; border: 2px solid #EA4335; border-radius: 12px; color: #EA4335; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
                .leave-session-btn:hover { background: #EA4335; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(234, 67, 53, 0.3); }
                /* Login Modal */
                .login-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(8px); animation: fadeIn 0.3s ease; }
                .login-modal { background: white; border-radius: 24px; padding: 48px 48px; max-width: 520px; width: calc(100% - 32px); margin: 16px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.4s ease; }
                .login-modal-header { margin-bottom: 32px; }
                .gdgc-logo-container { display: flex; justify-content: center; align-items: center; margin-bottom: 28px; }
                .gdgc-logo { width: 220px; height: auto; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); }
                .login-modal-title { font-size: 28px; font-weight: 700; color: #202124; margin-bottom: 12px; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8); }
                .login-modal-subtitle { font-size: 15px; color: #ffffff; line-height: 1.5; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7); }
                .login-modal-email-domain { font-weight: 600; }
                .auth-error-message { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; background: rgba(234, 67, 53, 0.1); border: 1px solid #EA4335; border-radius: 12px; color: #EA4335; font-size: 14px; margin-bottom: 24px; }
                .google-signin-button { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px 24px; background: white; border: 2px solid #dadce0; border-radius: 12px; font-size: 16px; font-weight: 600; color: #3c4043; cursor: pointer; transition: all 0.3s ease; }
                .google-signin-button:hover:not(:disabled) { background: #f8f9fa; border-color: #4285F4; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2); }
                .google-signin-button:disabled { opacity: 0.6; cursor: not-allowed; }
                .login-modal-note { margin-top: 20px; font-size: 13px; color: #EA4335; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.65); }
                .content-blurred { filter: blur(8px); pointer-events: none; user-select: none; }
                /* User Banner */
                .signed-in-user-banner { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: space-between; gap: 16px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 12px 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); z-index: 100; max-width: 90%; }
                .user-info { display: flex; align-items: center; gap: 12px; }
                .user-avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #4285F4; }
                .user-details { display: flex; flex-direction: column; }
                .user-name { font-weight: 600; font-size: 14px; color: #202124; }
                .user-email { font-size: 12px; color: #5f6368; }
                .sign-out-button { padding: 8px 16px; background: #f8f9fa; border: 1px solid #dadce0; border-radius: 8px; font-size: 13px; font-weight: 500; color: #5f6368; cursor: pointer; transition: all 0.3s ease; }
                .sign-out-button:hover { background: #EA4335; color: white; border-color: #EA4335; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                /* Responsive */
                @media (max-width: 900px) {
                    .contentWrapper { padding-top: 100px; padding-bottom: 60px; }
                    .flipperContainer { height: 500px !important; max-width: 500px; }
                    .rightPanel { display: none !important; }
                    .leftPanel { padding: 40px !important; flex: 1 1 100% !important; }
                    .title { font-size: 36px !important; text-align: center; }
                    .subtitle { text-align: center; }
                    .live-waiting-modal { width: 95%; max-height: 90vh; }
                    .participants-grid { grid-template-columns: 1fr; }
                    .session-code { font-size: 1.5rem; letter-spacing: 3px; }
                    .signed-in-user-banner { top: 70px; padding: 10px 16px; }
                    .user-avatar { width: 32px; height: 32px; }
                    .user-name { font-size: 13px; }
                    .user-email { font-size: 11px; }
                    .login-modal { padding: 36px 24px; max-width: 360px; width: calc(100% - 24px); margin: 12px; border-radius: 20px; }
                    .gdgc-logo-container { margin-bottom: 24px; }
                    .gdgc-logo { width: 150px; }
                    .login-modal-title { font-size: 22px; margin-bottom: 10px; }
                    .login-modal-subtitle { font-size: 14px; }
                    .auth-error-message { font-size: 13px; padding: 10px 14px; }
                    .google-signin-button { padding: 12px 20px; font-size: 15px; border-radius: 10px; }
                    .login-modal-note { font-size: 12px; margin-top: 16px; }
                }
                @media (max-width: 480px) {
                    .login-modal { padding: 28px 20px; max-width: 320px; border-radius: 16px; }
                    .gdgc-logo { width: 120px; }
                    .login-modal-title { font-size: 20px; }
                    .login-modal-subtitle { font-size: 13px; }
                    .google-signin-button { padding: 11px 18px; font-size: 14px; gap: 10px; }
                    .google-signin-button svg { width: 20px; height: 20px; }
                }
            `}</style>
        </div>
    );
};

export default QuizPage;
