import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  FaPlus, FaTrash, FaUpload, FaSignOutAlt, FaTimes, FaEdit,
  FaCalendarAlt, FaToggleOn, FaToggleOff, FaCheckCircle, FaTimesCircle,
  FaUsers, FaClipboardList, FaSearch, FaFileUpload, FaCrown,
  FaTrophy, FaMedal, FaAward, FaStar, FaCopy, FaEye, FaChartLine,
  FaCog, FaBars, FaChevronRight, FaChevronDown, FaDownload,
  FaUserShield, FaQuestionCircle, FaRocket, FaFire, FaBolt, FaGem,
  FaImage, FaLink, FaInfoCircle, FaClock, FaListOl, FaFilter, FaUser,
  FaFilePdf, FaFileCsv, FaFileCode, FaBan, FaUserCheck, FaSync
} from 'react-icons/fa';
import { MdEventNote, MdQuiz, MdDashboard, MdLeaderboard, MdPeople } from 'react-icons/md';
import { GiProgression, GiPodium, GiLaurelsTrophy, GiTrophy } from 'react-icons/gi';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { BiStats } from 'react-icons/bi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';
import { useAppContext } from '../context/AppContext';
import { logoutAdmin, getAllAdmins, registerAdmin, changePassword, getCurrentAdmin } from '../services/authService';
import { 
  getStudyJamsData, 
  uploadEnrollmentFile, 
  uploadProgressFile,
  deleteParticipant,
  deleteAllParticipants 
} from '../services/studyJamsService';
import { getLeaderboard } from '../services/leaderboardService';
import { getFirebaseUsers, deleteFirebaseUser, updateFirebaseUserStatus } from '../services/firebaseUsersService';
import { getStudyJamsVisibility, setStudyJamsVisibility } from '../services/siteSettingsService';

import api from '../services/api';
import logoImg from '../assets/logo.png';
import defaultEventImage from '../assets/default.png';

// Helper function to get event image URL
const getEventImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === 'default') return defaultEventImage;
  return imageUrl;
};

const GOOGLE_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
  darkBlue: '#1a73e8',
  darkGreen: '#2d8f47',
  darkYellow: '#f9ab00',
  darkRed: '#c5221f'
};
const selectStyles = `
  .admin-select option {
    background-color: #1a1f3a !important;
    color: white !important;
    padding: 12px !important;
  }
  .admin-select option:hover,
  .admin-select option:focus,
  .admin-select option:checked {
    background-color: #FBBC04 !important;
    color: black !important;
  }
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, loading: contextLoading } = useAppContext();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [events, setEvents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuizEditModal, setShowQuizEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [eventJson, setEventJson] = useState('');
  const [quizJson, setQuizJson] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [enrollmentFile, setEnrollmentFile] = useState(null);
  const [progressFile, setProgressFile] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attemptFilter, setAttemptFilter] = useState({ quiz_id: '', user_id: '' });
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [selectedLeaderboardQuiz, setSelectedLeaderboardQuiz] = useState('all');
  const [filteredLeaderboardData, setFilteredLeaderboardData] = useState([]);
  const [eventImageFile, setEventImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const CLOUDINARY_CLOUD_NAME = 'dfe2hivwb';
  const CLOUDINARY_UPLOAD_PRESET = 'gdgciare';
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    secretKey: ''
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showUserHistoryModal, setShowUserHistoryModal] = useState(false);
  const [userHistoryData, setUserHistoryData] = useState(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);
  
  const [userHistorySearch, setUserHistorySearch] = useState('');
  const [eventForm, setEventForm] = useState({
    eventName: '',
    description: '',
    date: '',
    eventType: 'workshop',
    status: 'upcoming',
    imageUrl: '',
    referenceUrl: ''
  });
  const [quizForm, setQuizForm] = useState({
    quiz_id: '',
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    time_limit_min: 10,
    time_per_question: 30, // Live mode: seconds per question
    total_marks: 10,
    access_code: ''
  });
  const MASTER_ADMIN = 'kranthi';
  const [currentUsername, setCurrentUsername] = useState(() => {
    return localStorage.getItem('adminUsername') || user?.username || '';
  });
  const isMasterAdmin = currentUsername?.toLowerCase() === MASTER_ADMIN.toLowerCase();
  
  // Firebase Users State
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [firebaseUsersLoading, setFirebaseUsersLoading] = useState(false);
  const [firebaseUsersSearch, setFirebaseUsersSearch] = useState('');
  const [firebaseUsersError, setFirebaseUsersError] = useState(null);
  const [firebaseUsersStatusFilter, setFirebaseUsersStatusFilter] = useState('all'); // 'all', 'active', 'blocked'
  const [firebaseUsersTimeFilter, setFirebaseUsersTimeFilter] = useState('all'); // 'all', '12h', '1d', '1w', '1m', '1y'
  
  // Study Jams Visibility State
  const [studyJamsNavbarVisible, setStudyJamsNavbarVisible] = useState(true);
  const [studyJamsVisibilityLoading, setStudyJamsVisibilityLoading] = useState(false);
  
  // Socket.io state for real-time leaderboard updates
  const [socket, setSocket] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(false);
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('adminUsername');
    if (storedUsername) {
      setCurrentUsername(storedUsername);
    } else if (user?.username) {
      localStorage.setItem('adminUsername', user.username);
      setCurrentUsername(user.username);
    }
  }, [user]);
  
  // Track if we've already initiated data fetching
  const hasInitiatedFetch = useRef(false);
  const isRedirecting = useRef(false);
  
  // MAIN INITIALIZATION EFFECT - Handles the Token Race Condition
  // This effect checks localStorage DIRECTLY instead of relying on React state
  useEffect(() => {
    // Prevent double fetching or redirecting
    if (hasInitiatedFetch.current || isRedirecting.current) {
      console.log('🔄 Skipping - already initiated or redirecting');
      return;
    }
    
    // CRITICAL: Check token SYNCHRONOUSLY first before any async operations
    const token = localStorage.getItem('token');
    const hasUserFromNav = !!location.state?.user;
    
    console.log('🔍 SYNC Check on mount:');
    console.log('   Token exists:', !!token);
    console.log('   User from navigation:', hasUserFromNav);
    console.log('   Context user:', !!user);
    console.log('   Context loading:', contextLoading);
    
    // If we have a token OR user data from navigation, we're authenticated
    if (!token && !hasUserFromNav) {
      // Double check - maybe context has user
      if (!user && !contextLoading) {
        console.log('🚫 No authentication found, redirecting...');
        isRedirecting.current = true;
        navigate('/quiz', { replace: true });
        return;
      }
      // Context is still loading, wait for it
      if (contextLoading) {
        console.log('⏳ Context still loading, waiting...');
        return;
      }
    }
    
    // We have authentication! Proceed with data loading
    console.log('✅ Authentication confirmed, starting data fetch...');
    hasInitiatedFetch.current = true;
    
    const loadAllData = async () => {
      setLoading(true);
      
      // If we have user data from navigation state, use it
      if (location.state?.user) {
        console.log('📍 Using user data from navigation state');
        setUser(location.state.user);
        window.history.replaceState({}, document.title);
      }
      
      // Fetch all data
      try {
        console.log('📡 Making API calls with token...');
        
        // Fetch events first (most important)
        try {
          const eventsRes = await api.get('/events/', { timeout: 40000 });
          console.log('✅ Events loaded:', eventsRes.data?.length || 0);
          if (Array.isArray(eventsRes.data)) {
            setEvents(eventsRes.data);
          }
        } catch (e) {
          console.error('❌ Events failed:', e.message);
          setEvents([]);
        }
        
        // Fetch all other data in parallel
        const results = await Promise.allSettled([
          api.get('/quiz/admin/all', { timeout: 35000 }),
          getAllAdmins(),
          api.get('/quiz/admin/attempts', { timeout: 35000 }),
          getLeaderboard({ page: 1, limit: 50 }),
          getStudyJamsData()
        ]);
        
        // Process quizzes
        if (results[0].status === 'fulfilled') {
          const data = results[0].value.data;
          const quizzesArray = data.quizzes || (Array.isArray(data) ? data : []);
          console.log('✅ Quizzes loaded:', quizzesArray.length);
          setQuizzes(quizzesArray);
        } else {
          console.error('❌ Quizzes failed:', results[0].reason?.message);
          setQuizzes([]);
        }
        
        // Process admins
        if (results[1].status === 'fulfilled') {
          const data = results[1].value.admins || results[1].value;
          const adminsArray = Array.isArray(data) ? data : [];
          console.log('✅ Admins loaded:', adminsArray.length);
          setAdmins(adminsArray);
        } else {
          console.error('❌ Admins failed:', results[1].reason?.message);
          setAdmins([]);
        }
        
        // Process attempts
        if (results[2].status === 'fulfilled') {
          const responseData = results[2].value.data;
          console.log('📋 Attempts API response:', responseData);
          const attemptsArray = responseData?.attempts || (Array.isArray(responseData) ? responseData : []);
          console.log('✅ Attempts loaded:', attemptsArray.length);
          if (attemptsArray.length > 0) {
            console.log('📋 Sample attempt:', attemptsArray[0]);
          }
          setAttempts(attemptsArray);
        } else {
          console.error('❌ Attempts failed:', results[2].reason?.message);
          console.error('❌ Full error:', results[2].reason);
          setAttempts([]);
        }
        
        // Process leaderboard
        if (results[3].status === 'fulfilled') {
          const data = results[3].value.data || results[3].value;
          console.log('✅ Leaderboard loaded:', Array.isArray(data) ? data.length : 0);
          setLeaderboardData(Array.isArray(data) ? data : []);
        } else {
          console.error('❌ Leaderboard failed:', results[3].reason?.message);
          setLeaderboardData([]);
        }
        
        // Process participants
        if (results[4].status === 'fulfilled') {
          const participantsData = results[4].value.data || [];
          console.log('✅ Participants loaded:', participantsData.length);
          setParticipants(participantsData);
        } else {
          console.error('❌ Participants failed:', results[4].reason?.message);
          setParticipants([]);
        }
        
        console.log('🎉 All data loading complete!');
        
        // Also fetch Firebase users for dashboard stats
        fetchFirebaseUsers();
      } catch (error) {
        console.error('❌ Data loading error:', error);
        showToastMessage('Failed to load data. Please try refreshing.', 'error');
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };
    
    loadAllData();
  }, [navigate, location.state?.user, setUser, user, contextLoading]);

  // Helper function to find Firebase user photo by matching rollNo with email prefix
  const getPhotoUrlFromFirebaseUsers = useCallback((rollNo) => {
    if (!rollNo || !firebaseUsers || firebaseUsers.length === 0) return null;
    
    // Normalize rollNo for comparison (lowercase, trim)
    const normalizedRollNo = rollNo.toLowerCase().trim();
    
    // Find Firebase user whose email prefix matches the rollNo
    const matchedUser = firebaseUsers.find(user => {
      if (!user.email) return false;
      // Extract email prefix (part before @)
      const emailPrefix = user.email.split('@')[0].toLowerCase().trim();
      return emailPrefix === normalizedRollNo;
    });
    
    if (matchedUser) {
      console.log(`📸 Matched rollNo "${rollNo}" with Firebase user "${matchedUser.email}", photoURL: ${matchedUser.photoURL ? 'Found' : 'None'}`);
    }
    
    return matchedUser?.photoURL || null;
  }, [firebaseUsers]);

  useEffect(() => {
    console.log('🔍 Leaderboard filter debug:');
    console.log('   selectedLeaderboardQuiz:', selectedLeaderboardQuiz);
    console.log('   attempts count:', attempts.length);
    console.log('   attempts quiz_ids:', [...new Set(attempts.map(a => a.quiz_id))]);
    console.log('   quizzes quiz_ids:', quizzes.map(q => q.quiz_id));
    
    if (selectedLeaderboardQuiz === 'all') {
      // Enrich leaderboard data with Firebase user photos
      const enrichedData = leaderboardData.map(entry => ({
        ...entry,
        photoURL: entry.photoURL || getPhotoUrlFromFirebaseUsers(entry.rollNo)
      }));
      setFilteredLeaderboardData(enrichedData);
    } else {
      console.log('🔍 Filtering attempts for quiz:', selectedLeaderboardQuiz);
      const quizAttempts = attempts.filter(a => {
        const match = a.quiz_id === selectedLeaderboardQuiz;
        console.log(`   Attempt quiz_id: ${a.quiz_id}, matches: ${match}`);
        return match;
      });
      console.log('🔍 Filtered attempts count:', quizAttempts.length);
      const leaderboard = quizAttempts
        .sort((a, b) => b.score - a.score || b.percentage - a.percentage)
        .map((attempt, index) => ({
          rank: index + 1,
          name: attempt.user_name,
          rollNo: attempt.user_id,
          score: attempt.score,
          percentage: attempt.percentage,
          quizTitle: attempt.quiz_title,
          photoURL: getPhotoUrlFromFirebaseUsers(attempt.user_id)
        }));
      setFilteredLeaderboardData(leaderboard);
    }
  }, [selectedLeaderboardQuiz, leaderboardData, attempts, firebaseUsers, getPhotoUrlFromFirebaseUsers]);

  // Fetch Firebase users when Users tab OR Leaderboard tab is selected
  useEffect(() => {
    if ((activeTab === 'users' || activeTab === 'leaderboard') && firebaseUsers.length === 0 && !firebaseUsersLoading) {
      fetchFirebaseUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const SOCKET_URL = API_BASE_URL.replace('/api', '');
    
    // Connect to Socket.io server
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      console.log('🔌 Socket transport:', newSocket.io.engine.transport.name);
      newSocket.emit('join-admin'); // Join admin room for updates
      console.log('📤 Emitted join-admin event');
      setLiveIndicator(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected, reason:', reason);
      setLiveIndicator(false);
    });

    newSocket.on('leaderboard-update', (liveData) => {
      console.log('📊 Live leaderboard update received!', liveData?.length || 0, 'entries');
      if (liveData && Array.isArray(liveData)) {
        setLeaderboardData(liveData);
        setLiveIndicator(true);
        // Flash indicator
        setTimeout(() => setLiveIndicator(false), 2000);
        setTimeout(() => setLiveIndicator(true), 2100);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setLiveIndicator(false);
    });

    // Debug: log all incoming events
    newSocket.onAny((eventName, ...args) => {
      console.log('📨 Socket event received:', eventName, args);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting socket...');
      newSocket.disconnect();
    };
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchLeaderboard(),
        fetchQuizzes(),
        fetchAttempts(),
        fetchEvents(),
        fetchAdmins(),
        fetchParticipants()
      ]);
      showToastMessage('Data refreshed successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const fetchWithRetry = async (fetchFn, name, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await fetchFn();
            return;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      };

      await fetchWithRetry(fetchEvents, 'Events', 3);
      
      await Promise.allSettled([
        fetchWithRetry(fetchQuizzes, 'Quizzes', 2),
        fetchWithRetry(fetchAdmins, 'Admins', 2),
        fetchWithRetry(fetchAttempts, 'Attempts', 2),
        fetchWithRetry(fetchParticipants, 'Participants', 2),
        fetchWithRetry(fetchLeaderboard, 'Leaderboard', 2),
        fetchStudyJamsVisibility()
      ]);
    } catch (error) {
      showToastMessage('Failed to load data. Backend might be waking up - please wait and refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch Study Jams visibility setting
  const fetchStudyJamsVisibility = async () => {
    try {
      const visible = await getStudyJamsVisibility();
      setStudyJamsNavbarVisible(visible);
    } catch (error) {
      console.error('Error fetching Study Jams visibility:', error);
    }
  };
  
  // Toggle Study Jams visibility
  const handleToggleStudyJamsVisibility = async () => {
    setStudyJamsVisibilityLoading(true);
    try {
      const newVisibility = !studyJamsNavbarVisible;
      await setStudyJamsVisibility(newVisibility);
      setStudyJamsNavbarVisible(newVisibility);
      showToastMessage(
        `Study Jams ${newVisibility ? 'is now visible' : 'has been hidden'} in the navbar`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling Study Jams visibility:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update Study Jams visibility';
      showToastMessage(errorMessage, 'error');
    } finally {
      setStudyJamsVisibilityLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/', { timeout: 40000 });
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      }
    } catch (error) {
      setEvents([]);
      throw error;
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quiz/admin/all', { timeout: 35000 });
      const data = response.data;
      const quizzesArray = data.quizzes || (Array.isArray(data) ? data : []);
      setQuizzes(quizzesArray);
    } catch (error) {
      setQuizzes([]);
      throw error;
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await getAllAdmins();
      const data = response.admins || response;
      const adminsArray = Array.isArray(data) ? data : [];
      setAdmins(adminsArray);
    } catch (error) {
      setAdmins([]);
      throw error;
    }
  };

  const fetchAttempts = async () => {
    try {
      const response = await api.get('/quiz/admin/attempts', { 
        timeout: 35000,
        params: attemptFilter.quiz_id || attemptFilter.user_id ? attemptFilter : {}
      });
      const data = response.data;
      const attemptsArray = data.attempts || (Array.isArray(data) ? data : []);
      setAttempts(attemptsArray);
    } catch (error) {
      setAttempts([]);
      throw error;
    }
  };

  const handleDeleteAttempt = async (attempt) => {
    const quizLabel = attempt.quiz_title || attempt.quiz_id;
    const userLabel = attempt.user_name || attempt.user_id;

    if (!window.confirm(`Remove attempt for ${userLabel} on ${quizLabel}?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete('/quiz/admin/attempts', {
        timeout: 20000,
        data: {
          quiz_id: attempt.quiz_id,
          user_id: attempt.user_id
        }
      });

      setAttempts((prev) => prev.filter(a => !(a.quiz_id === attempt.quiz_id && a.user_id === attempt.user_id)));
      showToastMessage('Attempt removed. User can retake now.', 'success');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete attempt';
      showToastMessage(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await getLeaderboard({ page: leaderboardPage, limit: 50 });
      const data = response.data || response;
      setLeaderboardData(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeaderboardData([]);
      throw error;
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await getStudyJamsData();
      const participantsData = response.data || [];
      setParticipants(participantsData);
    } catch (error) {
      setParticipants([]);
      throw error;
    }
  };

  // Fetch Firebase Users (Google Sign-In users)
  const fetchFirebaseUsers = async () => {
    setFirebaseUsersLoading(true);
    setFirebaseUsersError(null);
    try {
      const response = await getFirebaseUsers();
      if (response.success && response.users) {
        setFirebaseUsers(response.users);
        console.log('✅ Firebase users loaded:', response.users.length);
      } else {
        setFirebaseUsers([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch Firebase users:', error);
      setFirebaseUsersError(error.message || 'Failed to load users');
      setFirebaseUsers([]);
    } finally {
      setFirebaseUsersLoading(false);
    }
  };

  // Handle Firebase user deletion
  const handleDeleteFirebaseUser = async (uid, email) => {
    if (!window.confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteFirebaseUser(uid);
      showToastMessage(`User "${email}" deleted successfully`, 'success');
      // Refresh the list
      fetchFirebaseUsers();
    } catch (error) {
      showToastMessage(error.message || 'Failed to delete user', 'error');
    }
  };

  // Handle Firebase user enable/disable
  const handleToggleFirebaseUserStatus = async (uid, email, currentDisabled) => {
    try {
      await updateFirebaseUserStatus(uid, !currentDisabled);
      showToastMessage(`User "${email}" ${currentDisabled ? 'enabled' : 'disabled'} successfully`, 'success');
      // Refresh the list
      fetchFirebaseUsers();
    } catch (error) {
      showToastMessage(error.message || 'Failed to update user status', 'error');
    }
  };

  // Filter Firebase users based on search, status, and time
  const filteredFirebaseUsers = firebaseUsers.filter(user => {
    // Status filter
    if (firebaseUsersStatusFilter === 'active' && user.disabled) return false;
    if (firebaseUsersStatusFilter === 'blocked' && !user.disabled) return false;
    
    // Time filter based on last sign in
    if (firebaseUsersTimeFilter !== 'all' && user.lastSignInTime) {
      const lastSignIn = new Date(user.lastSignInTime);
      const now = new Date();
      const diffMs = now - lastSignIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;
      
      switch (firebaseUsersTimeFilter) {
        case '12h':
          if (diffHours > 12) return false;
          break;
        case '1d':
          if (diffDays > 1) return false;
          break;
        case '1w':
          if (diffDays > 7) return false;
          break;
        case '1m':
          if (diffDays > 30) return false;
          break;
        case '1y':
          if (diffDays > 365) return false;
          break;
        default:
          break;
      }
    } else if (firebaseUsersTimeFilter !== 'all' && !user.lastSignInTime) {
      return false; // Exclude users with no login time when a time filter is active
    }
    
    // Search filter
    if (!firebaseUsersSearch) return true;
    const search = firebaseUsersSearch.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.displayName && user.displayName.toLowerCase().includes(search)) ||
      (user.uid && user.uid.toLowerCase().includes(search))
    );
  });

  // Export functions for Firebase Users
  const exportUsersToCSV = () => {
    const headers = ['Name', 'Email', 'UID', 'Status', 'Email Verified', 'Last Sign In', 'Created At'];
    const csvData = filteredFirebaseUsers.map(user => [
      user.displayName || 'N/A',
      user.email || 'N/A',
      user.uid,
      user.disabled ? 'Blocked' : 'Active',
      user.emailVerified ? 'Yes' : 'No',
      user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleString() : 'Never',
      user.creationTime ? new Date(user.creationTime).toLocaleString() : 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gdgc_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToastMessage('Users exported to CSV', 'success');
  };

  const exportUsersToJSON = () => {
    const jsonData = filteredFirebaseUsers.map(user => ({
      uid: user.uid,
      displayName: user.displayName || null,
      email: user.email || null,
      photoURL: user.photoURL || null,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      lastSignInTime: user.lastSignInTime,
      creationTime: user.creationTime
    }));
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gdgc_users_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToastMessage('Users exported to JSON', 'success');
  };

  const exportUsersToPDF = () => {
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GDGC Users Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #4285F4; margin-bottom: 10px; }
            .subtitle { color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4285F4; color: white; padding: 12px 8px; text-align: left; font-size: 12px; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
            tr:nth-child(even) { background: #f8f9fa; }
            .status-active { color: #34A853; font-weight: 600; }
            .status-blocked { color: #EA4335; font-weight: 600; }
            .footer { margin-top: 30px; text-align: center; color: #888; font-size: 11px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>GDGC Users Report</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleString()} • ${filteredFirebaseUsers.length} users</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              ${filteredFirebaseUsers.map(user => `
                <tr>
                  <td>${user.displayName || 'N/A'}</td>
                  <td>${user.email || 'N/A'}</td>
                  <td class="${user.disabled ? 'status-blocked' : 'status-active'}">${user.disabled ? 'Blocked' : 'Active'}</td>
                  <td>${user.emailVerified ? '✓' : '✗'}</td>
                  <td>${user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'Never'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="footer">GDGC Platform - Admin Dashboard</p>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    showToastMessage('PDF print dialog opened', 'success');
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('user');
      setUser(null);
      setCurrentUsername('');
      window.location.href = '/quiz';
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminForm.username.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim() || !newAdminForm.secretKey.trim()) {
      showToastMessage('Please fill all required fields including secret key', 'error');
      return;
    }
    
    try {
      setAddingAdmin(true);
      await registerAdmin({
        username: newAdminForm.username.trim(),
        email: newAdminForm.email.trim(),
        password: newAdminForm.password,
        secretKey: newAdminForm.secretKey.trim()
      });
      
      showToastMessage('Admin added successfully!', 'success');
      setShowAddAdminModal(false);
      setNewAdminForm({
        username: '',
        email: '',
        password: '',
        secretKey: ''
      });
      await fetchAdmins();
    } catch (error) {
      let errorMsg = 'Failed to add admin';
      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      // Provide more helpful error messages
      if (errorMsg.includes('Invalid secret key') || errorMsg.includes('Unauthorized')) {
        errorMsg = 'Invalid secret key. Please enter the correct ADMIN_SECRET_KEY from server configuration.';
      } else if (errorMsg.includes('already exists')) {
        errorMsg = 'Admin with this username or email already exists.';
      }
      showToastMessage(errorMsg, 'error');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToastMessage('Please fill all password fields', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToastMessage('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToastMessage('New passwords do not match', 'error');
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToastMessage('Password changed successfully!', 'success');
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      let errorMsg = 'Failed to change password';
      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToastMessage(errorMsg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleFetchUserHistory = async () => {
    if (!userHistorySearch.trim()) {
      showToastMessage('Please enter a roll number or user ID', 'error');
      return;
    }
    try {
      setUserHistoryLoading(true);
      const response = await api.get(`/quiz/admin/user/${userHistorySearch.trim()}/history`);
      setUserHistoryData(response.data);
    } catch (error) {
      let errorMsg = 'Failed to fetch user history';
      if (error.response?.status === 404) {
        errorMsg = 'No quiz history found for this user';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      showToastMessage(errorMsg, 'error');
      setUserHistoryData(null);
    } finally {
      setUserHistoryLoading(false);
    }
  };

  const handleEventUpload = async () => {
    try {
      const data = JSON.parse(eventJson);
      setLoading(true);
      
      if (Array.isArray(data)) {
        for (const event of data) {
          await api.post('/events/', event);
        }
        showToastMessage(`${data.length} events created!`, 'success');
      } else {
        await api.post('/events/', data);
        showToastMessage('Event created!', 'success');
      }
      
      setShowEventModal(false);
      setEventJson('');
      await fetchEvents();
    } catch (error) {
      showToastMessage('Failed to create event: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/events/${eventId}`);
      showToastMessage('Event deleted!', 'success');
      await fetchEvents();
    } catch (error) {
      showToastMessage('Failed to delete event: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    
    return response.data.secure_url;
  };
  const handleEventFormSubmit = async () => {
    if (!eventForm.eventName.trim()) {
      showToastMessage('Event name is required', 'error');
      return;
    }
    if (!eventForm.date) {
      showToastMessage('Event date is required', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      let imageUrl = eventForm.imageUrl.trim();
      
      if (eventImageFile) {
        setImageUploading(true);
        showToastMessage('Uploading image...', 'info');
        imageUrl = await uploadImageToCloudinary(eventImageFile);
        setImageUploading(false);
      }
      
      const eventData = {
        eventName: eventForm.eventName.trim(),
        description: eventForm.description.trim(),
        date: eventForm.date,
        eventType: eventForm.eventType,
        status: eventForm.status,
        ...(imageUrl && { imageUrl }),
        ...(eventForm.referenceUrl.trim() && { referenceUrl: eventForm.referenceUrl.trim() })
      };
      
      await api.post('/events/', eventData);
      showToastMessage('Event created successfully!', 'success');
      
      setShowEventModal(false);
      setEventImageFile(null);
      setEventForm({
        eventName: '',
        description: '',
        date: '',
        eventType: 'workshop',
        status: 'upcoming',
        imageUrl: '',
        referenceUrl: ''
      });
      await fetchEvents();
    } catch (error) {
      showToastMessage('Failed to create event: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };
  const handleEventEdit = (event) => {
    setSelectedEvent(event);
    setEventImageFile(null);
    setEventForm({
      eventName: event.eventName || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      eventType: event.eventType || 'workshop',
      status: event.status || 'upcoming',
      imageUrl: event.imageUrl || '',
      referenceUrl: event.referenceUrl || ''
    });
    setShowEventEditModal(true);
  };
  const handleEventUpdate = async () => {
    if (!selectedEvent) return;
    if (!eventForm.eventName.trim()) {
      showToastMessage('Event name is required', 'error');
      return;
    }
    if (!eventForm.date) {
      showToastMessage('Event date is required', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      let imageUrl = eventForm.imageUrl.trim();
      
      if (eventImageFile) {
        setImageUploading(true);
        showToastMessage('Uploading image...', 'info');
        imageUrl = await uploadImageToCloudinary(eventImageFile);
        setImageUploading(false);
      }
      
      const eventData = {
        eventName: eventForm.eventName.trim(),
        description: eventForm.description.trim(),
        date: eventForm.date,
        eventType: eventForm.eventType,
        status: eventForm.status,
        ...(imageUrl && { imageUrl }),
        ...(eventForm.referenceUrl.trim() && { referenceUrl: eventForm.referenceUrl.trim() })
      };
      
      await api.put(`/events/${selectedEvent._id || selectedEvent.id}`, eventData);
      showToastMessage('Event updated successfully!', 'success');
      
      setShowEventEditModal(false);
      setSelectedEvent(null);
      setEventImageFile(null);
      setEventForm({
        eventName: '',
        description: '',
        date: '',
        eventType: 'workshop',
        status: 'upcoming',
        imageUrl: '',
        referenceUrl: ''
      });
      await fetchEvents();
    } catch (error) {
      showToastMessage('Failed to update event: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  const handleQuizUpload = async () => {
    try {
      const data = JSON.parse(quizJson);
      setLoading(true);
      
      await api.post('/quiz/create', data);
      showToastMessage('Quiz created successfully!', 'success');
      
      setShowQuizModal(false);
      setQuizJson('');
      await fetchQuizzes();
    } catch (error) {
      showToastMessage('Failed to create quiz: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [questionImageUploading, setQuestionImageUploading] = useState({});
  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      question_id: `q${quizQuestions.length + 1}`,
      type: 'single_choice',
      question_text: '',
      image: null,
      options: [
        { option_id: 'a', text: '' },
        { option_id: 'b', text: '' },
        { option_id: 'c', text: '' },
        { option_id: 'd', text: '' }
      ],
      correct_answers: [],
      marks: 1
    }]);
  };
  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };
  const updateQuestionOption = (qIndex, oIndex, text) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex].text = text;
    setQuizQuestions(updated);
  };
  const toggleCorrectAnswer = (qIndex, optionId) => {
    const updated = [...quizQuestions];
    const question = updated[qIndex];
    if (question.type === 'single_choice') {
      question.correct_answers = [optionId];
    } else {
      const idx = question.correct_answers.indexOf(optionId);
      if (idx > -1) {
        question.correct_answers.splice(idx, 1);
      } else {
        question.correct_answers.push(optionId);
      }
    }
    setQuizQuestions(updated);
  };
  const removeQuizQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };
  const handleQuestionImageUpload = async (qIndex, file) => {
    if (!file) return;
    try {
      setQuestionImageUploading(prev => ({ ...prev, [qIndex]: true }));
      showToastMessage('Uploading image...', 'info');
      const imageUrl = await uploadImageToCloudinary(file);
      const updated = [...quizQuestions];
      updated[qIndex].image = imageUrl;
      setQuizQuestions(updated);
      showToastMessage('Image uploaded successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to upload image', 'error');
    } finally {
      setQuestionImageUploading(prev => ({ ...prev, [qIndex]: false }));
    }
  };
  const removeQuestionImage = (qIndex) => {
    const updated = [...quizQuestions];
    updated[qIndex].image = null;
    setQuizQuestions(updated);
  };
  const handleQuizFormSubmit = async () => {
    if (!quizForm.quiz_id.trim()) {
      showToastMessage('Quiz ID is required', 'error');
      return;
    }
    if (!quizForm.title.trim()) {
      showToastMessage('Quiz title is required', 'error');
      return;
    }
    if (quizQuestions.length === 0) {
      showToastMessage('At least one question is required', 'error');
      return;
    }
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question_text.trim()) {
        showToastMessage(`Question ${i + 1} text is required`, 'error');
        return;
      }
      if (q.correct_answers.length === 0) {
        showToastMessage(`Question ${i + 1} needs at least one correct answer`, 'error');
        return;
      }
    }
    
    try {
      setLoading(true);
      const timeInSeconds = (parseInt(quizForm.time_limit_min) || 10) * 60;
      const timePerQuestion = parseInt(quizForm.time_per_question) || 30; // Default 30 seconds for live mode
      const quizData = {
        quiz_id: quizForm.quiz_id.trim(),
        title: quizForm.title.trim(),
        description: quizForm.description.trim() || quizForm.title.trim(),
        category: quizForm.category.trim() || 'General',
        difficulty: quizForm.difficulty,
        time_limit_sec: timeInSeconds,
        time_per_question: timePerQuestion, // Live mode: seconds per question
        total_marks: quizQuestions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0),
        access_code: quizForm.access_code.trim() || undefined,
        questions: quizQuestions.map(q => ({
          question_id: q.question_id,
          type: q.type,
          question_text: q.question_text,
          image: q.image || null,
          options: q.options.filter(o => o.text.trim()),
          correct_answers: q.correct_answers,
          marks: parseInt(q.marks) || 1
        }))
      };
      
      // Debug: Log quiz data being sent
      console.log('Submitting quiz with images:', JSON.stringify({
        quiz_id: quizData.quiz_id,
        questions: quizData.questions.map(q => ({
          question_id: q.question_id,
          image: q.image,
          hasImage: !!q.image
        }))
      }, null, 2));
      
      await api.post('/quiz/create', quizData);
      showToastMessage('Quiz created successfully!', 'success');
      
      setShowQuizModal(false);
      setQuizForm({
        quiz_id: '',
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        time_limit_min: 10,
        time_per_question: 30,
        total_marks: 10,
        access_code: ''
      });
      setQuizQuestions([]);
      setQuestionImageUploading({});
      await fetchQuizzes();
    } catch (error) {
      showToastMessage('Failed to create quiz: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizToggle = async (quizId) => {
    try {
      setLoading(true);
      await api.patch(`/quiz/${quizId}/toggle`);
      showToastMessage('Quiz status updated!', 'success');
      await fetchQuizzes();
    } catch (error) {
      showToastMessage('Failed to toggle quiz status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await api.delete(`/quiz/${quizId}`);
      showToastMessage('Quiz deleted successfully!', 'success');
      await fetchQuizzes();
    } catch (error) {
      showToastMessage('Failed to delete quiz: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToastMessage('Quiz code copied to clipboard!', 'success');
  };

  const handleHostLiveQuiz = (quiz) => {
    navigate(`/quiz/host/${quiz.id || quiz._id}`, { 
      state: { quiz } 
    });
  };

  const handleEnrollmentUpload = async () => {
    if (!enrollmentFile) {
      showToastMessage('Please select a file', 'error');
      return;
    }
    
    if (!window.confirm('This will enroll new participants. Continue?')) return;
    
    try {
      setLoading(true);
      const response = await uploadEnrollmentFile(enrollmentFile);
      showToastMessage(
        `${response.message} (Matched: ${response.results.matchedCount}, Modified: ${response.results.modifiedCount}, New: ${response.results.upsertedCount})`, 
        'success'
      );
      setShowEnrollmentModal(false);
      setEnrollmentFile(null);
      await fetchParticipants();
    } catch (error) {
      showToastMessage('Failed to upload: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpload = async () => {
    if (!progressFile) {
      showToastMessage('Please select a file', 'error');
      return;
    }
    
    if (!window.confirm('This will update participant progress. Continue?')) return;
    
    try {
      setLoading(true);
      const response = await uploadProgressFile(progressFile);
      showToastMessage(
        `${response.message} (Matched: ${response.results.matchedCount}, Modified: ${response.results.modifiedCount})`, 
        'success'
      );
      setShowProgressModal(false);
      setProgressFile(null);
      await fetchParticipants();
    } catch (error) {
      showToastMessage('Failed to upload: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (email) => {
    if (!window.confirm(`Delete participant ${email}?`)) return;
    
    try {
      setLoading(true);
      await deleteParticipant(email);
      showToastMessage('Participant deleted!', 'success');
      await fetchParticipants();
    } catch (error) {
      showToastMessage('Failed to delete participant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllParticipants = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL participants! Are you sure?')) return;
    if (!window.confirm('⚠️ FINAL WARNING: This cannot be undone. Proceed?')) return;
    
    try {
      setLoading(true);
      const response = await deleteAllParticipants();
      showToastMessage(response.message, 'success');
      await fetchParticipants();
    } catch (error) {
      showToastMessage('Failed to delete all participants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    return events.filter(event => {
      const title = (event.eventName || event.title || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = title.includes(search) || desc.includes(search);
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'upcoming') return matchesSearch && new Date(event.date) > new Date();
      if (filterStatus === 'past') return matchesSearch && new Date(event.date) <= new Date();
      return matchesSearch;
    });
  };

  const getFilteredQuizzes = () => {
    return quizzes
      .filter(quiz => {
        const title = (quiz.title || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = title.includes(search);
        
        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'active') return matchesSearch && quiz.isActive;
        if (filterStatus === 'inactive') return matchesSearch && !quiz.isActive;
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first
  };

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
    totalQuizzes: quizzes.length,
    activeQuizzes: quizzes.filter(q => q.isActive).length,
    totalUsers: firebaseUsers.length,
    totalAttempts: attempts.length,
    totalParticipants: participants.reduce((sum, team) => sum + (team.memberCount || 0), 0),
    totalTeams: participants.length,
    leaderboardEntries: leaderboardData.length
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown style={{ color: '#FFD700', filter: 'drop-shadow(0 0 8px #FFD700)' }} size={24} />;
    if (rank === 2) return <FaMedal style={{ color: '#C0C0C0', filter: 'drop-shadow(0 0 6px #C0C0C0)' }} size={22} />;
    if (rank === 3) return <FaMedal style={{ color: '#CD7F32', filter: 'drop-shadow(0 0 6px #CD7F32)' }} size={20} />;
    return <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>#{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)', boxShadow: '0 0 25px rgba(192, 192, 192, 0.3)' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)', boxShadow: '0 0 20px rgba(205, 127, 50, 0.3)' };
    return { background: 'rgba(255, 255, 255, 0.05)' };
  };

  if (contextLoading && !location.state?.fromLogin) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PageBackground animationsReady={true} />
        <Loader />
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();
  const filteredQuizzes = getFilteredQuizzes();

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <MdDashboard size={22} /> },
    { id: 'events', label: 'Events', icon: <MdEventNote size={22} /> },
    { id: 'quizzes', label: 'Quizzes', icon: <MdQuiz size={22} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <MdLeaderboard size={22} /> },
    { id: 'attempts', label: 'Quiz Attempts', icon: <FaClipboardList size={20} /> },
    { id: 'studyjams', label: 'Study Jams', icon: <GiProgression size={22} /> },
    { id: 'users', label: 'Users', icon: <MdPeople size={22} /> },
    { id: 'admins', label: 'Admins', icon: <FaUserShield size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)', display: 'flex' }}>
      <style>{`
        .admin-select option {
          background-color: #1a1f3a !important;
          color: #ffffff !important;
          padding: 12px !important;
        }
        .admin-select option:hover {
          background-color: #FBBC04 !important;
          color: #000000 !important;
        }
        .admin-select option:checked {
          background-color: #4285F4 !important;
          color: #ffffff !important;
        }
        .admin-select:focus option:checked {
          background: linear-gradient(#4285F4, #4285F4) !important;
          color: #ffffff !important;
        }
      `}</style>
      <PageBackground animationsReady={true} />
      
      <aside style={{
        width: sidebarCollapsed ? '80px' : '280px',
        height: '100vh',
        maxHeight: '100vh',
        background: 'rgba(15, 20, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: sidebarCollapsed ? '20px 15px' : '28px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <img 
            src={logoImg} 
            alt="GDGC Logo" 
            style={{ 
              width: sidebarCollapsed ? '50px' : '72px', 
              height: sidebarCollapsed ? '50px' : '72px',
              borderRadius: '16px',
              objectFit: 'contain',
              boxShadow: '0 4px 20px rgba(66, 133, 244, 0.3)'
            }} 
          />
          {!sidebarCollapsed && (
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>GDGC Admin</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Dashboard</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            position: 'absolute',
            right: '-16px',
            top: '70px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
            border: '3px solid #0a0e27',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(66, 133, 244, 0.5), 0 0 0 2px rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.7), 0 0 0 3px rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(66, 133, 244, 0.5), 0 0 0 2px rgba(255,255,255,0.1)';
          }}
        >
          <FaChevronRight size={14} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>

        <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto', minHeight: 0 }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchTerm(''); setFilterStatus('all'); }}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '14px' : '14px 16px',
                marginBottom: '8px',
                background: activeTab === item.id 
                  ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.2) 0%, rgba(52, 168, 83, 0.2) 100%)' 
                  : 'transparent',
                border: activeTab === item.id ? '1px solid rgba(66, 133, 244, 0.3)' : '1px solid transparent',
                borderRadius: '12px',
                color: activeTab === item.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontSize: '15px',
                fontWeight: activeTab === item.id ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <span style={{ color: activeTab === item.id ? GOOGLE_COLORS.blue : 'inherit' }}>{item.icon}</span>
              {!sidebarCollapsed && item.label}
              {activeTab === item.id && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '60%',
                  background: GOOGLE_COLORS.blue,
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
            </button>
          ))}
        </nav>

        <div style={{
          padding: sidebarCollapsed ? '16px 12px 24px' : '20px 20px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          flexShrink: 0
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: isMasterAdmin 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                boxShadow: isMasterAdmin ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none'
              }}>
                {isMasterAdmin ? <FaCrown size={18} /> : (currentUsername?.charAt(0).toUpperCase() || 'A')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, margin: 0 }}>{currentUsername || 'Admin'}</p>
                  {isMasterAdmin && <FaCrown size={12} style={{ color: '#FFD700' }} />}
                </div>
                <p style={{ color: isMasterAdmin ? '#FFD700' : 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
                  {isMasterAdmin ? 'Master Admin' : 'Administrator'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setShowChangePasswordModal(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(66, 133, 244, 0.15)',
              border: '1px solid rgba(66, 133, 244, 0.3)',
              borderRadius: '10px',
              color: GOOGLE_COLORS.blue,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '8px'
            }}
          >
            <FaCog />
            {!sidebarCollapsed && 'Change Password'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(234, 67, 53, 0.15)',
              border: '1px solid rgba(234, 67, 53, 0.3)',
              borderRadius: '10px',
              color: GOOGLE_COLORS.red,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <FaSignOutAlt />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? '80px' : '280px',
        padding: '32px 40px',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {sidebarItems.find(item => item.id === activeTab)?.icon}
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 800, 
                color: 'white', 
                margin: 0,
                background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              {/* Live indicator */}
              {liveIndicator && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: 'rgba(52, 168, 83, 0.2)',
                  borderRadius: '20px',
                  border: '1px solid rgba(52, 168, 83, 0.4)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: GOOGLE_COLORS.green,
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ color: GOOGLE_COLORS.green, fontSize: '12px', fontWeight: 600 }}>LIVE</span>
                </div>
              )}
            </div>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: isRefreshing ? 'rgba(66, 133, 244, 0.3)' : 'rgba(66, 133, 244, 0.15)',
                border: '1px solid rgba(66, 133, 244, 0.4)',
                borderRadius: '12px',
                color: GOOGLE_COLORS.blue,
                fontSize: '14px',
                fontWeight: 600,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => !isRefreshing && (e.target.style.background = 'rgba(66, 133, 244, 0.25)')}
              onMouseLeave={(e) => !isRefreshing && (e.target.style.background = 'rgba(66, 133, 244, 0.15)')}
            >
              <FaSync style={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
            Manage your GDGC platform efficiently
          </p>
        </div>

        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '100px 20px',
            gap: '24px'
          }}>
            <Loader />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Loading Dashboard...</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                Backend services are starting up, please wait...
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                  gap: '20px', 
                  marginBottom: '32px' 
                }}>
                  {[
                    { icon: <MdEventNote size={28} />, label: 'Total Events', value: stats.totalEvents, color: GOOGLE_COLORS.blue, gradient: 'linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)' },
                    { icon: <FaCalendarAlt size={24} />, label: 'Upcoming Events', value: stats.upcomingEvents, color: GOOGLE_COLORS.green, gradient: 'linear-gradient(135deg, #34A853 0%, #2d8f47 100%)' },
                    { icon: <MdQuiz size={28} />, label: 'Total Quizzes', value: stats.totalQuizzes, color: GOOGLE_COLORS.yellow, gradient: 'linear-gradient(135deg, #FBBC04 0%, #f9ab00 100%)' },
                    { icon: <FaBolt size={24} />, label: 'Active Quizzes', value: stats.activeQuizzes, color: GOOGLE_COLORS.green, gradient: 'linear-gradient(135deg, #34A853 0%, #2d8f47 100%)' },
                    { icon: <MdPeople size={24} />, label: 'Users', value: stats.totalUsers, color: GOOGLE_COLORS.blue, gradient: 'linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)' },
                    { icon: <FaClipboardList size={24} />, label: 'Quiz Attempts', value: stats.totalAttempts, color: GOOGLE_COLORS.blue, gradient: 'linear-gradient(135deg, #4285F4 0%, #1a73e8 100%)' },
                    { icon: <GiProgression size={28} />, label: 'Study Jam Teams', value: stats.totalTeams, color: GOOGLE_COLORS.yellow, gradient: 'linear-gradient(135deg, #FBBC04 0%, #f9ab00 100%)' },
                    { icon: <FaTrophy size={24} />, label: 'Leaderboard', value: stats.leaderboardEntries, color: GOOGLE_COLORS.green, gradient: 'linear-gradient(135deg, #34A853 0%, #2d8f47 100%)' },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '24px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: stat.gradient,
                        opacity: 0.1,
                        borderRadius: '0 20px 0 100px'
                      }} />
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: `${stat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                        marginBottom: '16px'
                      }}>
                        {stat.icon}
                      </div>
                      <h3 style={{ 
                        fontSize: '36px', 
                        fontWeight: 800, 
                        color: 'white', 
                        margin: '0 0 4px 0',
                        lineHeight: 1
                      }}>{stat.value}</h3>
                      <p style={{ 
                        fontSize: '14px', 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        fontWeight: 500,
                        margin: 0
                      }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px',
                  marginBottom: '32px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaRocket style={{ color: GOOGLE_COLORS.blue }} />
                    Quick Actions
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { label: 'Create Event', icon: <FaPlus />, color: GOOGLE_COLORS.blue, action: () => { setActiveTab('events'); setShowEventModal(true); } },
                      { label: 'Create Quiz', icon: <MdQuiz />, color: GOOGLE_COLORS.green, action: () => { setActiveTab('quizzes'); setShowQuizModal(true); } },
                      { label: 'View Leaderboard', icon: <FaTrophy />, color: GOOGLE_COLORS.yellow, action: () => setActiveTab('leaderboard') },
                      { label: 'Upload Participants', icon: <FaUpload />, color: GOOGLE_COLORS.red, action: () => { setActiveTab('studyjams'); setShowEnrollmentModal(true); } },
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={action.action}
                        style={{
                          padding: '16px 20px',
                          background: `${action.color}15`,
                          border: `1px solid ${action.color}30`,
                          borderRadius: '12px',
                          color: action.color,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '28px'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MdQuiz style={{ color: GOOGLE_COLORS.yellow }} />
                      Recent Quizzes
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {quizzes.slice(0, 5).map((quiz, i) => (
                        <div key={i} style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <p style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{quiz.title}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Code: {quiz.code}</p>
                          </div>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: quiz.isActive ? `${GOOGLE_COLORS.green}20` : 'rgba(128,128,128,0.2)',
                            color: quiz.isActive ? GOOGLE_COLORS.green : '#888'
                          }}>
                            {quiz.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                      {quizzes.length === 0 && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>No quizzes yet</p>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '28px'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaTrophy style={{ color: GOOGLE_COLORS.yellow }} />
                      Top Performers
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {leaderboardData.slice(0, 5).map((entry, i) => (
                        <div key={i} style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {getRankIcon(entry.rank || i + 1)}
                            <div>
                              <p style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>{entry.name || entry.rollNo}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{entry.rollNo}</p>
                            </div>
                          </div>
                          <span style={{ color: GOOGLE_COLORS.green, fontWeight: 700, fontSize: '18px' }}>{entry.score}</span>
                        </div>
                      ))}
                      {leaderboardData.length === 0 && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>No data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '14px 20px',
                      background: '#1a1f3a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="all" style={{ background: '#1a1f3a', color: 'white' }}>All Status</option>
                    <option value="upcoming" style={{ background: '#1a1f3a', color: 'white' }}>Upcoming</option>
                    <option value="past" style={{ background: '#1a1f3a', color: 'white' }}>Past</option>
                  </select>
                  <button
                    onClick={() => setShowEventModal(true)}
                    style={{
                      padding: '14px 24px',
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue} 0%, ${GOOGLE_COLORS.green} 100%)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)'
                    }}
                  >
                    <FaPlus />
                    Add Event
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  {filteredEvents.length === 0 ? (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '80px 40px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <MdEventNote size={80} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '20px' }} />
                      <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No Events Found</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                        {events.length === 0 ? 'Create your first event to get started' : 'Try adjusting your search or filter'}
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => {
                      const eventId = event.id || event._id;
                      const isUpcoming = new Date(event.date) > new Date();
                      const eventImageSrc = getEventImageUrl(event.imageUrl);
                      return (
                        <div
                          key={eventId}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '24px',
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: '24px',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <img
                            src={eventImageSrc}
                            alt={event.eventName}
                            style={{
                              width: '140px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '12px'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>{event.eventName || event.title}</h3>
                              {event.eventType && (
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  background: `${GOOGLE_COLORS.blue}20`,
                                  color: GOOGLE_COLORS.blue
                                }}>{event.eventType}</span>
                              )}
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: isUpcoming ? `${GOOGLE_COLORS.green}20` : 'rgba(128, 128, 128, 0.2)',
                                color: isUpcoming ? GOOGLE_COLORS.green : '#888'
                              }}>
                                {isUpcoming ? 'Upcoming' : 'Past'}
                              </span>
                            </div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '12px', lineHeight: 1.6 }}>
                              {event.description?.substring(0, 150)}{event.description?.length > 150 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GOOGLE_COLORS.blue, fontSize: '13px', fontWeight: 500 }}>
                                <FaCalendarAlt />
                                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                              {event.referenceUrl && (
                                <a href={event.referenceUrl} target="_blank" rel="noopener noreferrer" style={{ color: GOOGLE_COLORS.green, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                                  View Details →
                                </a>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleEventEdit(event)}
                              style={{
                                padding: '12px 20px',
                                background: `${GOOGLE_COLORS.blue}15`,
                                border: `1px solid ${GOOGLE_COLORS.blue}30`,
                                borderRadius: '10px',
                                color: GOOGLE_COLORS.blue,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FaEdit />
                              Edit
                            </button>
                            <button
                              onClick={() => handleEventDelete(eventId)}
                              style={{
                                padding: '12px 20px',
                                background: `${GOOGLE_COLORS.red}15`,
                                border: `1px solid ${GOOGLE_COLORS.red}30`,
                                borderRadius: '10px',
                                color: GOOGLE_COLORS.red,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '14px 20px',
                      background: '#1a1f3a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="all" style={{ background: '#1a1f3a', color: 'white' }}>All Status</option>
                    <option value="active" style={{ background: '#1a1f3a', color: 'white' }}>Active</option>
                    <option value="inactive" style={{ background: '#1a1f3a', color: 'white' }}>Inactive</option>
                  </select>
                  <button
                    onClick={() => setShowQuizModal(true)}
                    style={{
                      padding: '14px 24px',
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.green} 0%, ${GOOGLE_COLORS.blue} 100%)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(52, 168, 83, 0.3)'
                    }}
                  >
                    <FaPlus />
                    Create Quiz
                  </button>
                  <button
                    onClick={() => setShowUserHistoryModal(true)}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(66, 133, 244, 0.15)',
                      color: GOOGLE_COLORS.blue,
                      border: '1px solid rgba(66, 133, 244, 0.3)',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaUser />
                    User History
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  {filteredQuizzes.length === 0 ? (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '80px 40px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <MdQuiz size={80} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '20px' }} />
                      <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No Quizzes Found</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                        {quizzes.length === 0 ? 'Create your first quiz to get started' : 'Try adjusting your search or filter'}
                      </p>
                    </div>
                  ) : (
                    filteredQuizzes.map((quiz) => (
                      <div
                        key={quiz._id || quiz.id}
                        style={{
                          background: quiz.isActive 
                            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)' 
                            : 'rgba(255, 255, 255, 0.03)',
                          backdropFilter: 'blur(10px)',
                          border: quiz.isActive 
                            ? '2px solid rgba(255, 215, 0, 0.4)' 
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '20px',
                          padding: '28px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: quiz.isActive ? '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 60px rgba(255, 215, 0, 0.05)' : 'none'
                        }}
                      >
                        {quiz.isActive && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, transparent, #FFD700, #FFC107, #FFD700, transparent)'
                          }} />
                        )}
                        {quiz.isActive && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'linear-gradient(135deg, #FFD700, #FFC107)',
                            padding: '8px 20px',
                            borderRadius: '0 18px 0 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                          }}>
                            <FaBolt style={{ color: '#1a1f3a' }} />
                            <span style={{ color: '#1a1f3a', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>LIVE</span>
                          </div>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
                          <div>
                            <h3 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{quiz.title}</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
                              {quiz.description || 'No description provided'}
                            </p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: `${GOOGLE_COLORS.blue}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FaQuestionCircle style={{ color: GOOGLE_COLORS.blue }} />
                                </div>
                                <div>
                                  <p style={{ color: 'white', fontWeight: 600, fontSize: '16px', margin: 0 }}>{quiz.questions_count || quiz.questions?.length || 0}</p>
                                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Questions</p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: `${GOOGLE_COLORS.green}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FaStar style={{ color: GOOGLE_COLORS.green }} />
                                </div>
                                <div>
                                  <p style={{ color: 'white', fontWeight: 600, fontSize: '16px', margin: 0 }}>{quiz.total_marks || 0}</p>
                                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Total Marks</p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: `${GOOGLE_COLORS.yellow}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FaCalendarAlt style={{ color: GOOGLE_COLORS.yellow }} />
                                </div>
                                <div>
                                  <p style={{ color: 'white', fontWeight: 600, fontSize: '16px', margin: 0 }}>{Math.floor((quiz.time_limit_sec || 0) / 60)}</p>
                                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>Minutes</p>
                                </div>
                              </div>
                            </div>

                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 20px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Access Code:</span>
                              <span style={{ color: GOOGLE_COLORS.blue, fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '2px' }}>{quiz.code}</span>
                              <button
                                onClick={() => handleCopyCode(quiz.code)}
                                style={{
                                  padding: '6px 12px',
                                  background: `${GOOGLE_COLORS.blue}20`,
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: GOOGLE_COLORS.blue,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '12px',
                                  fontWeight: 600
                                }}
                              >
                                <FaCopy />
                                Copy
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                            <button
                              onClick={() => handleHostLiveQuiz(quiz)}
                              style={{
                                padding: '12px 20px',
                                background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}30, ${GOOGLE_COLORS.green}30)`,
                                border: `1px solid ${GOOGLE_COLORS.blue}50`,
                                borderRadius: '10px',
                                color: GOOGLE_COLORS.blue,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FaRocket />
                              Host Live
                            </button>
                            <button
                              onClick={() => handleQuizToggle(quiz._id || quiz.id)}
                              style={{
                                padding: '12px 20px',
                                background: quiz.isActive ? `${GOOGLE_COLORS.red}15` : `${GOOGLE_COLORS.green}15`,
                                border: `1px solid ${quiz.isActive ? GOOGLE_COLORS.red : GOOGLE_COLORS.green}30`,
                                borderRadius: '10px',
                                color: quiz.isActive ? GOOGLE_COLORS.red : GOOGLE_COLORS.green,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {quiz.isActive ? <FaToggleOff /> : <FaToggleOn />}
                              {quiz.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleQuizDelete(quiz._id || quiz.id)}
                              style={{
                                padding: '12px 20px',
                                background: `${GOOGLE_COLORS.red}15`,
                                border: `1px solid ${GOOGLE_COLORS.red}30`,
                                borderRadius: '10px',
                                color: GOOGLE_COLORS.red,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          marginTop: '20px',
                          paddingTop: '20px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          flexWrap: 'wrap'
                        }}>
                          {quiz.category && (
                            <span style={{
                              padding: '6px 14px',
                              background: `${GOOGLE_COLORS.blue}15`,
                              borderRadius: '20px',
                              color: GOOGLE_COLORS.blue,
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {quiz.category}
                            </span>
                          )}
                          {quiz.difficulty && (
                            <span style={{
                              padding: '6px 14px',
                              background: quiz.difficulty === 'Advanced' ? `${GOOGLE_COLORS.red}15` : quiz.difficulty === 'Intermediate' ? `${GOOGLE_COLORS.yellow}15` : `${GOOGLE_COLORS.green}15`,
                              borderRadius: '20px',
                              color: quiz.difficulty === 'Advanced' ? GOOGLE_COLORS.red : quiz.difficulty === 'Intermediate' ? GOOGLE_COLORS.yellow : GOOGLE_COLORS.green,
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {quiz.difficulty}
                            </span>
                          )}
                          {quiz.tags?.map((tag, i) => (
                            <span key={i} style={{
                              padding: '6px 14px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '20px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '12px'
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.9) 0%, rgba(25, 30, 50, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '24px 28px',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px 16px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: '12px'
                  }}>
                    <FaFilter style={{ color: '#FFD700', fontSize: '18px' }} />
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', fontWeight: 700 }}>Filter Quiz:</span>
                  </div>
                  <select
                    value={selectedLeaderboardQuiz}
                    onChange={(e) => setSelectedLeaderboardQuiz(e.target.value)}
                    style={{
                      padding: '14px 20px',
                      background: '#1a1f3a',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: '240px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="all" style={{ background: '#1a1f3a', color: 'white' }}>All Quizzes (Combined)</option>
                    {quizzes.map(quiz => (
                      <option key={quiz.quiz_id} value={quiz.quiz_id} style={{ background: '#1a1f3a', color: 'white' }}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                  {selectedLeaderboardQuiz !== 'all' && (
                    <button
                      onClick={() => setSelectedLeaderboardQuiz('all')}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.2) 0%, rgba(234, 67, 53, 0.1) 100%)',
                        border: '1px solid rgba(234, 67, 53, 0.4)',
                        borderRadius: '10px',
                        color: GOOGLE_COLORS.red,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <FaTimes size={14} />
                      Clear Filter
                    </button>
                  )}
                </div>

                {filteredLeaderboardData.length >= 3 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: '0',
                    marginBottom: '48px',
                    padding: '60px 20px 0',
                    position: 'relative',
                    background: 'radial-gradient(ellipse at center bottom, rgba(255, 215, 0, 0.1) 0%, transparent 60%)'
                  }}>
                    {/* 2nd Place - Left */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {/* Crown */}
                      <div style={{ position: 'absolute', top: '-30px', zIndex: 10 }}>
                        <FaCrown size={32} style={{ color: '#C0C0C0', filter: 'drop-shadow(0 2px 8px rgba(192,192,192,0.6))' }} />
                      </div>
                      {/* Avatar */}
                      {filteredLeaderboardData[1]?.photoURL ? (
                        <img
                          src={filteredLeaderboardData[1].photoURL}
                          alt={filteredLeaderboardData[1]?.name || 'Player 2'}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #C0C0C0',
                            boxShadow: '0 8px 30px rgba(192,192,192,0.4)',
                            marginBottom: '12px',
                            position: 'relative',
                            zIndex: 5
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #3a4a7d 0%, #2a3a6d 100%)',
                        border: '4px solid #C0C0C0',
                        display: filteredLeaderboardData[1]?.photoURL ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 30px rgba(192,192,192,0.4)',
                        marginBottom: '12px',
                        position: 'relative',
                        zIndex: 5
                      }}>
                        <FaUser size={40} style={{ color: '#7a8abd' }} />
                      </div>
                      {/* Name */}
                      <p style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px', textAlign: 'center', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {filteredLeaderboardData[1]?.name || filteredLeaderboardData[1]?.rollNo || 'Player 2'}
                      </p>
                      <p style={{ color: '#C0C0C0', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
                        {filteredLeaderboardData[1]?.score || 0}
                      </p>
                      {/* Podium Block */}
                      <div style={{
                        width: '200px',
                        height: '140px',
                        background: 'linear-gradient(180deg, #3d4a7a 0%, #2d3a6a 50%, #1d2a5a 100%)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.1), 0 -5px 30px rgba(192,192,192,0.2)',
                        border: '2px solid rgba(192,192,192,0.4)',
                        borderBottom: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, transparent, rgba(192,192,192,0.5), transparent)'
                        }} />
                        <span style={{ 
                          color: '#C0C0C0', 
                          fontSize: '52px', 
                          fontWeight: 900,
                          textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                          fontFamily: 'system-ui'
                        }}>2nd</span>
                      </div>
                    </div>

                    {/* 1st Place - Center (Taller) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginTop: '-40px' }}>
                      {/* Crown */}
                      <div style={{ position: 'absolute', top: '-40px', zIndex: 10 }}>
                        <FaCrown size={48} style={{ color: '#FFD700', filter: 'drop-shadow(0 4px 15px rgba(255,215,0,0.8))' }} />
                      </div>
                      {/* Avatar */}
                      {filteredLeaderboardData[0]?.photoURL ? (
                        <img
                          src={filteredLeaderboardData[0].photoURL}
                          alt={filteredLeaderboardData[0]?.name || 'Champion'}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          style={{
                            width: '110px',
                            height: '110px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '5px solid #FFD700',
                            boxShadow: '0 8px 40px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.2)',
                            marginBottom: '12px',
                            position: 'relative',
                            zIndex: 5
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #4a5a8d 0%, #3a4a7d 100%)',
                        border: '5px solid #FFD700',
                        display: filteredLeaderboardData[0]?.photoURL ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 40px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.2)',
                        marginBottom: '12px',
                        position: 'relative',
                        zIndex: 5
                      }}>
                        <FaUser size={50} style={{ color: '#8a9acd' }} />
                      </div>
                      {/* Name */}
                      <p style={{ color: 'white', fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(255,215,0,0.3)' }}>
                        {filteredLeaderboardData[0]?.name || filteredLeaderboardData[0]?.rollNo || 'Champion'}
                      </p>
                      <p style={{ color: '#FFD700', fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>
                        {filteredLeaderboardData[0]?.score || 0}
                      </p>
                      {/* Podium Block */}
                      <div style={{
                        width: '240px',
                        height: '180px',
                        background: 'linear-gradient(180deg, #4d5a8a 0%, #3d4a7a 50%, #2d3a6a 100%)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 30px rgba(255,255,255,0.15), 0 -10px 50px rgba(255,215,0,0.3)',
                        border: '3px solid rgba(255,215,0,0.5)',
                        borderBottom: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '5px',
                          background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)'
                        }} />
                        <span style={{ 
                          color: '#FFD700', 
                          fontSize: '64px', 
                          fontWeight: 900,
                          textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.3)',
                          fontFamily: 'system-ui'
                        }}>1st</span>
                      </div>
                    </div>

                    {/* 3rd Place - Right */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      {/* Crown */}
                      <div style={{ position: 'absolute', top: '-25px', zIndex: 10 }}>
                        <FaCrown size={28} style={{ color: '#CD7F32', filter: 'drop-shadow(0 2px 8px rgba(205,127,50,0.6))' }} />
                      </div>
                      {/* Avatar */}
                      {filteredLeaderboardData[2]?.photoURL ? (
                        <img
                          src={filteredLeaderboardData[2].photoURL}
                          alt={filteredLeaderboardData[2]?.name || 'Player 3'}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          style={{
                            width: '85px',
                            height: '85px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #CD7F32',
                            boxShadow: '0 8px 25px rgba(205,127,50,0.4)',
                            marginBottom: '12px',
                            position: 'relative',
                            zIndex: 5
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '85px',
                        height: '85px',
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #3a4a7d 0%, #2a3a6d 100%)',
                        border: '4px solid #CD7F32',
                        display: filteredLeaderboardData[2]?.photoURL ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 25px rgba(205,127,50,0.4)',
                        marginBottom: '12px',
                        position: 'relative',
                        zIndex: 5
                      }}>
                        <FaUser size={36} style={{ color: '#7a8abd' }} />
                      </div>
                      {/* Name */}
                      <p style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px', textAlign: 'center', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {filteredLeaderboardData[2]?.name || filteredLeaderboardData[2]?.rollNo || 'Player 3'}
                      </p>
                      <p style={{ color: '#CD7F32', fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
                        {filteredLeaderboardData[2]?.score || 0}
                      </p>
                      {/* Podium Block */}
                      <div style={{
                        width: '200px',
                        height: '120px',
                        background: 'linear-gradient(180deg, #3d4a7a 0%, #2d3a6a 50%, #1d2a5a 100%)',
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.1), 0 -5px 25px rgba(205,127,50,0.2)',
                        border: '2px solid rgba(205,127,50,0.4)',
                        borderBottom: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, transparent, rgba(205,127,50,0.5), transparent)'
                        }} />
                        <span style={{ 
                          color: '#CD7F32', 
                          fontSize: '44px', 
                          fontWeight: 900,
                          textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                          fontFamily: 'system-ui'
                        }}>3rd</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  background: 'linear-gradient(180deg, rgba(15, 20, 40, 0.95) 0%, rgba(20, 25, 50, 0.95) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 60px rgba(0,0,0,0.4)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 140px 140px 180px',
                    padding: '22px 32px',
                    background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 50%, rgba(255, 215, 0, 0.1) 100%)',
                    borderBottom: '2px solid rgba(255, 215, 0, 0.2)'
                  }}>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Rank</span>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Participant</span>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Score</span>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Accuracy</span>
                    <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Quiz</span>
                  </div>

                  {filteredLeaderboardData.length === 0 ? (
                    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(255, 215, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                      }}>
                        <FaTrophy size={50} style={{ color: 'rgba(255,215,0,0.3)' }} />
                      </div>
                      <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No Champions Yet</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>The arena awaits its first competitors</p>
                    </div>
                  ) : (
                    filteredLeaderboardData.map((entry, index) => {
                      const rank = entry.rank || index + 1;
                      const isTopThree = rank <= 3;
                      const rankColors = {
                        1: { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.3)', text: '#FFD700' },
                        2: { bg: 'rgba(192, 192, 192, 0.1)', border: 'rgba(192, 192, 192, 0.2)', text: '#C0C0C0' },
                        3: { bg: 'rgba(205, 127, 50, 0.1)', border: 'rgba(205, 127, 50, 0.2)', text: '#CD7F32' }
                      };
                      return (
                        <div
                          key={index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '100px 1fr 140px 140px 180px',
                            padding: '20px 32px',
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: isTopThree ? rankColors[rank]?.bg : (index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                            borderLeft: isTopThree ? `3px solid ${rankColors[rank]?.border}` : '3px solid transparent',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getRankIcon(rank)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {entry.photoURL ? (
                              <img
                                src={entry.photoURL}
                                alt={entry.name || 'User'}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                                style={{
                                  width: '52px',
                                  height: '52px',
                                  borderRadius: '14px',
                                  objectFit: 'cover',
                                  border: isTopThree ? `3px solid ${rankColors[rank]?.text}` : '2px solid rgba(255,255,255,0.1)',
                                  boxShadow: isTopThree ? `0 4px 15px ${rankColors[rank]?.text}40` : 'none'
                                }}
                              />
                            ) : null}
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '14px',
                              background: isTopThree 
                                ? `linear-gradient(145deg, ${rankColors[rank]?.text}, ${rankColors[rank]?.text}80)`
                                : `linear-gradient(145deg, ${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][index % 4]}, ${[GOOGLE_COLORS.darkBlue, GOOGLE_COLORS.darkGreen, GOOGLE_COLORS.darkYellow, GOOGLE_COLORS.darkRed][index % 4]})`,
                              display: entry.photoURL ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              boxShadow: isTopThree ? `0 4px 15px ${rankColors[rank]?.text}40` : 'none'
                            }}>
                              <FaUser size={22} style={{ color: 'white', opacity: 0.9 }} />
                            </div>
                            <div>
                              <p style={{ 
                                color: isTopThree ? rankColors[rank]?.text : 'white', 
                                fontWeight: isTopThree ? 700 : 600, 
                                fontSize: '16px', 
                                marginBottom: '4px' 
                              }}>
                                {entry.name || entry.rollNo}
                              </p>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{entry.rollNo}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ 
                              color: isTopThree ? rankColors[rank]?.text : GOOGLE_COLORS.green, 
                              fontWeight: 800, 
                              fontSize: '22px',
                              textShadow: isTopThree ? `0 0 15px ${rankColors[rank]?.text}40` : 'none'
                            }}>
                              {entry.score}
                            </span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ 
                              padding: '8px 18px',
                              borderRadius: '25px',
                              background: `${entry.percentage >= 80 ? GOOGLE_COLORS.green : entry.percentage >= 50 ? GOOGLE_COLORS.yellow : GOOGLE_COLORS.red}20`,
                              color: entry.percentage >= 80 ? GOOGLE_COLORS.green : entry.percentage >= 50 ? GOOGLE_COLORS.yellow : GOOGLE_COLORS.red,
                              fontSize: '14px',
                              fontWeight: 700,
                              border: `1px solid ${entry.percentage >= 80 ? GOOGLE_COLORS.green : entry.percentage >= 50 ? GOOGLE_COLORS.yellow : GOOGLE_COLORS.red}30`
                            }}>
                              {entry.percentage || 0}%
                            </span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ 
                              color: 'rgba(255,255,255,0.7)', 
                              fontSize: '14px',
                              padding: '6px 12px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '8px'
                            }}>
                              {entry.quizTitle || 'N/A'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {filteredLeaderboardData.length > 0 && (
                  <div style={{
                    marginTop: '32px',
                    padding: '24px 32px',
                    background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 50%, rgba(251, 188, 4, 0.1) 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Participants</p>
                      <p style={{ color: GOOGLE_COLORS.blue, fontSize: '32px', fontWeight: 800 }}>{filteredLeaderboardData.length}</p>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Highest Score</p>
                      <p style={{ color: GOOGLE_COLORS.green, fontSize: '32px', fontWeight: 800 }}>{filteredLeaderboardData[0]?.score || 0}</p>
                    </div>
                    <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Avg Accuracy</p>
                      <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '32px', fontWeight: 800 }}>
                        {Math.round(filteredLeaderboardData.reduce((acc, e) => acc + (e.percentage || 0), 0) / filteredLeaderboardData.length) || 0}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attempts' && (
              <div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                    <input
                      type="text"
                      placeholder="Filter by User ID (Roll No)..."
                      value={attemptFilter.user_id}
                      onChange={(e) => setAttemptFilter(prev => ({ ...prev, user_id: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <select
                    value={attemptFilter.quiz_id}
                    onChange={(e) => setAttemptFilter(prev => ({ ...prev, quiz_id: e.target.value }))}
                    style={{
                      padding: '14px 20px',
                      background: '#1a1f3a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '200px'
                    }}
                  >
                    <option value="" style={{ background: '#1a1f3a', color: 'white' }}>All Quizzes</option>
                    {quizzes.map(quiz => (
                      <option key={quiz._id || quiz.id} value={quiz.quiz_id} style={{ background: '#1a1f3a', color: 'white' }}>{quiz.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={fetchAttempts}
                    style={{
                      padding: '14px 24px',
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue} 0%, ${GOOGLE_COLORS.green} 100%)`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaSearch />
                    Apply Filters
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {[
                    { label: 'Total Attempts', value: attempts.length, color: GOOGLE_COLORS.blue },
                    { label: 'Avg Score', value: attempts.length ? Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length) + '%' : '0%', color: GOOGLE_COLORS.green },
                    { label: 'Passed (>50%)', value: attempts.filter(a => (a.percentage || 0) >= 50).length, color: GOOGLE_COLORS.green },
                    { label: 'Failed (<50%)', value: attempts.filter(a => (a.percentage || 0) < 50).length, color: GOOGLE_COLORS.red },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: stat.color, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 100px 100px 120px 150px 140px',
                    padding: '20px 24px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>User</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Quiz</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Score</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>%</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Time</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Submitted</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>Actions</span>
                  </div>

                  {attempts.length === 0 ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <FaClipboardList size={60} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No quiz attempts found</p>
                    </div>
                  ) : (
                    attempts.map((attempt, index) => (
                      <div
                        key={attempt._id || index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 100px 100px 120px 150px 140px',
                          padding: '18px 24px',
                          alignItems: 'center',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}>
                            {(attempt.user_name || attempt.user_id)?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{attempt.user_name || attempt.user_id}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{attempt.user_id}</p>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>{attempt.quiz_title || attempt.quiz_id}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: GOOGLE_COLORS.blue, fontWeight: 700, fontSize: '16px' }}>
                            {attempt.score}/{attempt.total_marks || 0}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ 
                            padding: '5px 12px',
                            borderRadius: '20px',
                            background: `${(attempt.percentage || 0) >= 50 ? GOOGLE_COLORS.green : GOOGLE_COLORS.red}20`,
                            color: (attempt.percentage || 0) >= 50 ? GOOGLE_COLORS.green : GOOGLE_COLORS.red,
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            {attempt.percentage || 0}%
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {Math.floor((attempt.time_taken_sec || 0) / 60)}:{((attempt.time_taken_sec || 0) % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDeleteAttempt(attempt)}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(234, 67, 53, 0.2)',
                              border: '1px solid rgba(234, 67, 53, 0.4)',
                              color: GOOGLE_COLORS.red,
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaTrash size={12} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Firebase Users Tab - Google Sign-In Users */}
            {activeTab === 'users' && (
              <div>
                {/* Header Section */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%)',
                  border: '1px solid rgba(66, 133, 244, 0.2)',
                  borderRadius: '20px',
                  padding: '28px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MdPeople size={28} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                          Google Sign-In Users
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                          {filteredFirebaseUsers.length} of {firebaseUsers.length} users 
                          {firebaseUsersStatusFilter !== 'all' && ` (${firebaseUsersStatusFilter})`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchFirebaseUsers}
                      disabled={firebaseUsersLoading}
                      style={{
                        padding: '12px 20px',
                        background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.darkBlue})`,
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: firebaseUsersLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: firebaseUsersLoading ? 0.7 : 1
                      }}
                    >
                      {firebaseUsersLoading ? (
                        <>
                          <span style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            display: 'inline-block'
                          }} />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaDownload />
                          Refresh
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Filters and Actions Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    {/* Left: Search and Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative' }}>
                        <FaSearch style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '14px'
                        }} />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={firebaseUsersSearch}
                          onChange={(e) => setFirebaseUsersSearch(e.target.value)}
                          style={{
                            padding: '10px 16px 10px 42px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '14px',
                            width: '240px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Status Filter */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { value: 'all', label: 'All', icon: <MdPeople size={14} /> },
                          { value: 'active', label: 'Active', icon: <FaUserCheck size={12} /> },
                          { value: 'blocked', label: 'Blocked', icon: <FaBan size={12} /> }
                        ].map(filter => (
                          <button
                            key={filter.value}
                            onClick={() => setFirebaseUsersStatusFilter(filter.value)}
                            style={{
                              padding: '8px 14px',
                              background: firebaseUsersStatusFilter === filter.value 
                                ? filter.value === 'blocked' 
                                  ? 'rgba(234, 67, 53, 0.2)'
                                  : filter.value === 'active'
                                    ? 'rgba(52, 168, 83, 0.2)'
                                    : 'rgba(66, 133, 244, 0.2)'
                                : 'rgba(255,255,255,0.05)',
                              border: firebaseUsersStatusFilter === filter.value 
                                ? `1px solid ${filter.value === 'blocked' ? GOOGLE_COLORS.red : filter.value === 'active' ? GOOGLE_COLORS.green : GOOGLE_COLORS.blue}50`
                                : '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: firebaseUsersStatusFilter === filter.value 
                                ? filter.value === 'blocked' ? GOOGLE_COLORS.red : filter.value === 'active' ? GOOGLE_COLORS.green : GOOGLE_COLORS.blue
                                : 'rgba(255,255,255,0.6)',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {filter.icon}
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Time Filter */}
                      <select
                        value={firebaseUsersTimeFilter}
                        onChange={(e) => setFirebaseUsersTimeFilter(e.target.value)}
                        style={{
                          padding: '8px 14px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all" style={{ background: '#1a1a2e', color: 'white' }}>All Time</option>
                        <option value="12h" style={{ background: '#1a1a2e', color: 'white' }}>Last 12 Hours</option>
                        <option value="1d" style={{ background: '#1a1a2e', color: 'white' }}>Last 24 Hours</option>
                        <option value="1w" style={{ background: '#1a1a2e', color: 'white' }}>Last Week</option>
                        <option value="1m" style={{ background: '#1a1a2e', color: 'white' }}>Last Month</option>
                        <option value="1y" style={{ background: '#1a1a2e', color: 'white' }}>Last Year</option>
                      </select>
                    </div>
                    
                    {/* Right: Export Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginRight: '4px' }}>Export:</span>
                      <button
                        onClick={exportUsersToCSV}
                        disabled={filteredFirebaseUsers.length === 0}
                        title="Export to CSV"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(52, 168, 83, 0.15)',
                          border: '1px solid rgba(52, 168, 83, 0.3)',
                          borderRadius: '8px',
                          color: GOOGLE_COLORS.green,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: filteredFirebaseUsers.length === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: filteredFirebaseUsers.length === 0 ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FaFileCsv size={14} />
                        CSV
                      </button>
                      <button
                        onClick={exportUsersToJSON}
                        disabled={filteredFirebaseUsers.length === 0}
                        title="Export to JSON"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(251, 188, 4, 0.15)',
                          border: '1px solid rgba(251, 188, 4, 0.3)',
                          borderRadius: '8px',
                          color: GOOGLE_COLORS.yellow,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: filteredFirebaseUsers.length === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: filteredFirebaseUsers.length === 0 ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FaFileCode size={14} />
                        JSON
                      </button>
                      <button
                        onClick={exportUsersToPDF}
                        disabled={filteredFirebaseUsers.length === 0}
                        title="Export to PDF"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(234, 67, 53, 0.15)',
                          border: '1px solid rgba(234, 67, 53, 0.3)',
                          borderRadius: '8px',
                          color: GOOGLE_COLORS.red,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: filteredFirebaseUsers.length === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: filteredFirebaseUsers.length === 0 ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FaFilePdf size={14} />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                {firebaseUsersError && (
                  <div style={{
                    background: 'rgba(234, 67, 53, 0.1)',
                    border: '1px solid rgba(234, 67, 53, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <FaTimesCircle style={{ color: GOOGLE_COLORS.red, fontSize: '20px' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      {firebaseUsersError}
                    </span>
                  </div>
                )}

                {firebaseUsersLoading ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '80px 40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      border: '3px solid rgba(255,255,255,0.1)',
                      borderTop: `3px solid ${GOOGLE_COLORS.blue}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 20px'
                    }} />
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>Loading users...</p>
                  </div>
                ) : filteredFirebaseUsers.length === 0 ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '80px 40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <MdPeople size={80} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '20px' }} />
                    <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                      {firebaseUsersSearch ? 'No Users Found' : 'No Users Yet'}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>
                      {firebaseUsersSearch 
                        ? 'Try a different search term' 
                        : 'Users who sign in with Google will appear here'}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                      padding: '16px 24px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      fontWeight: 600,
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <div>User</div>
                      <div>Email</div>
                      <div style={{ textAlign: 'center' }}>Status</div>
                      <div style={{ textAlign: 'center' }}>Last Sign In</div>
                      <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>

                    {/* Table Body */}
                    {filteredFirebaseUsers.map((fbUser, index) => (
                      <div
                        key={fbUser.uid}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                          padding: '16px 24px',
                          alignItems: 'center',
                          borderBottom: index < filteredFirebaseUsers.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {fbUser.photoURL ? (
                            <img
                              src={fbUser.photoURL}
                              alt={fbUser.displayName || 'User'}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                objectFit: 'cover',
                                border: '2px solid rgba(255,255,255,0.1)'
                              }}
                            />
                          ) : null}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][index % 4]}, ${[GOOGLE_COLORS.darkBlue, GOOGLE_COLORS.darkGreen, GOOGLE_COLORS.darkYellow, GOOGLE_COLORS.darkRed][index % 4]})`,
                            display: fbUser.photoURL ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            <FaUser size={18} />
                          </div>
                          <div>
                            <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                              {fbUser.displayName || 'No Name'}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'monospace' }}>
                              {fbUser.uid.substring(0, 12)}...
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                            {fbUser.email || 'No email'}
                          </span>
                          {fbUser.emailVerified && (
                            <FaCheckCircle style={{ 
                              color: GOOGLE_COLORS.green, 
                              marginLeft: '6px', 
                              fontSize: '12px',
                              verticalAlign: 'middle'
                            }} title="Email verified" />
                          )}
                        </div>

                        {/* Status */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: fbUser.disabled 
                              ? 'rgba(234, 67, 53, 0.15)'
                              : 'rgba(52, 168, 83, 0.15)',
                            color: fbUser.disabled 
                              ? GOOGLE_COLORS.red
                              : GOOGLE_COLORS.green
                          }}>
                            {fbUser.disabled ? 'Disabled' : 'Active'}
                          </span>
                        </div>

                        {/* Last Sign In */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {fbUser.lastSignInTime 
                              ? new Date(fbUser.lastSignInTime).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleFirebaseUserStatus(fbUser.uid, fbUser.email, fbUser.disabled)}
                            title={fbUser.disabled ? 'Enable user' : 'Disable user'}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              border: 'none',
                              background: fbUser.disabled 
                                ? 'rgba(52, 168, 83, 0.15)'
                                : 'rgba(251, 188, 4, 0.15)',
                              color: fbUser.disabled 
                                ? GOOGLE_COLORS.green
                                : GOOGLE_COLORS.yellow,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {fbUser.disabled ? <FaToggleOff size={16} /> : <FaToggleOn size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteFirebaseUser(fbUser.uid, fbUser.email)}
                            title="Delete user"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              border: 'none',
                              background: 'rgba(234, 67, 53, 0.15)',
                              color: GOOGLE_COLORS.red,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats Cards */}
                {!firebaseUsersLoading && firebaseUsers.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '24px'
                  }}>
                    <div style={{
                      background: 'rgba(66, 133, 244, 0.1)',
                      border: '1px solid rgba(66, 133, 244, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Total Users</p>
                      <p style={{ color: GOOGLE_COLORS.blue, fontSize: '32px', fontWeight: 700 }}>{firebaseUsers.length}</p>
                    </div>
                    <div style={{
                      background: 'rgba(52, 168, 83, 0.1)',
                      border: '1px solid rgba(52, 168, 83, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Active Users</p>
                      <p style={{ color: GOOGLE_COLORS.green, fontSize: '32px', fontWeight: 700 }}>
                        {firebaseUsers.filter(u => !u.disabled).length}
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(234, 67, 53, 0.1)',
                      border: '1px solid rgba(234, 67, 53, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Disabled Users</p>
                      <p style={{ color: GOOGLE_COLORS.red, fontSize: '32px', fontWeight: 700 }}>
                        {firebaseUsers.filter(u => u.disabled).length}
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(251, 188, 4, 0.1)',
                      border: '1px solid rgba(251, 188, 4, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Verified Emails</p>
                      <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '32px', fontWeight: 700 }}>
                        {firebaseUsers.filter(u => u.emailVerified).length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admins' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(234, 67, 53, 0.1) 0%, rgba(66, 133, 244, 0.1) 100%)',
                  border: '1px solid rgba(234, 67, 53, 0.2)',
                  borderRadius: '20px',
                  padding: '28px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.red}, ${GOOGLE_COLORS.blue})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaUserShield size={28} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Administrator Management</h2>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                        {admins.length} registered administrators
                        {isMasterAdmin && <span style={{ color: GOOGLE_COLORS.yellow, marginLeft: '8px' }}>• Master Access</span>}
                      </p>
                    </div>
                  </div>
                  {isMasterAdmin && (
                    <button
                      onClick={() => {
                        setNewAdminForm(prev => ({ ...prev, secretKey: 'GDGC_ADMIN_REGISTRATION_2025_SECRET' }));
                        setShowAddAdminModal(true);
                      }}
                      style={{
                        padding: '12px 24px',
                        background: `linear-gradient(135deg, ${GOOGLE_COLORS.green}, ${GOOGLE_COLORS.blue})`,
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaPlus />
                      Add Admin
                    </button>
                  )}
                </div>

                {!isMasterAdmin && (
                  <div style={{
                    background: 'rgba(251, 188, 4, 0.1)',
                    border: '1px solid rgba(251, 188, 4, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <FaCrown style={{ color: GOOGLE_COLORS.yellow, fontSize: '20px' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      Only the master administrator can add or remove admin accounts.
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {admins.length === 0 ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '80px 40px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <FaUsers size={80} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '20px' }} />
                      <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>No Admins Found</h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '16px' }}>Admin accounts will appear here</p>
                    </div>
                  ) : (
                    admins.map((admin, index) => {
                      const isThisAdminMaster = admin.username === MASTER_ADMIN;
                      return (
                        <div
                          key={admin._id || admin.id || index}
                          style={{
                            background: isThisAdminMaster 
                              ? 'linear-gradient(135deg, rgba(251, 188, 4, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
                              : 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: isThisAdminMaster 
                              ? '2px solid rgba(251, 188, 4, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {isThisAdminMaster && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)'
                            }}>
                              <FaCrown size={12} style={{ color: 'white' }} />
                              <span style={{ color: 'white', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Master</span>
                            </div>
                          )}
                          
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: `linear-gradient(135deg, ${isThisAdminMaster ? '#FFD700' : [GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][index % 4]}, transparent)`,
                            opacity: 0.1,
                            borderRadius: '0 20px 0 100px'
                          }} />
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '16px',
                              background: isThisAdminMaster 
                                ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                : `linear-gradient(135deg, ${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][index % 4]}, ${[GOOGLE_COLORS.darkBlue, GOOGLE_COLORS.darkGreen, GOOGLE_COLORS.darkYellow, GOOGLE_COLORS.darkRed][index % 4]})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 800,
                              fontSize: '22px',
                              boxShadow: `0 4px 15px ${isThisAdminMaster ? 'rgba(255, 215, 0, 0.4)' : `${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][index % 4]}40`}`
                            }}>
                              {admin.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{admin.username}</h3>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: isThisAdminMaster ? 'rgba(255, 215, 0, 0.2)' : `${GOOGLE_COLORS.blue}20`,
                                color: isThisAdminMaster ? '#FFD700' : GOOGLE_COLORS.blue,
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>
                                {isThisAdminMaster ? 'Master Admin' : (admin.role || 'Admin')}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <span style={{ fontSize: '14px' }}>📧</span>
                              </div>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{admin.email}</span>
                            </div>
                            
                            {admin.createdAt && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{ fontSize: '14px' }}>📅</span>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                  Joined: {new Date(admin.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {admin.lastLogin && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{ fontSize: '14px' }}>🕐</span>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                  Last login: {new Date(admin.lastLogin).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {isMasterAdmin && !isThisAdminMaster && (
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Are you sure you want to delete admin "${admin.username}"?`)) return;
                                try {
                                  setLoading(true);
                                  await api.delete(`/auth/admin/${admin._id || admin.id}`);
                                  showToastMessage('Admin deleted successfully', 'success');
                                  await fetchAdmins();
                                } catch (error) {
                                  showToastMessage('Failed to delete admin: ' + (error.response?.data?.message || error.message), 'error');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              style={{
                                marginTop: '16px',
                                padding: '10px 16px',
                                background: `${GOOGLE_COLORS.red}20`,
                                border: `1px solid ${GOOGLE_COLORS.red}40`,
                                borderRadius: '10px',
                                color: GOOGLE_COLORS.red,
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                justifyContent: 'center'
                              }}
                            >
                              <FaTrash size={12} />
                              Remove Admin
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'studyjams' && (
              <div>
                {/* Study Jams Visibility Toggle */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.08) 0%, rgba(52, 168, 83, 0.08) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: studyJamsNavbarVisible ? `${GOOGLE_COLORS.green}20` : `${GOOGLE_COLORS.red}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {studyJamsNavbarVisible ? (
                        <FaEye size={22} style={{ color: GOOGLE_COLORS.green }} />
                      ) : (
                        <FaBan size={22} style={{ color: GOOGLE_COLORS.red }} />
                      )}
                    </div>
                    <div>
                      <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                        Study Jams Navbar Visibility
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                        {studyJamsNavbarVisible 
                          ? 'Study Jams is currently visible in the navigation bar' 
                          : 'Study Jams is hidden from the navigation bar'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleStudyJamsVisibility}
                    disabled={studyJamsVisibilityLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 24px',
                      background: studyJamsNavbarVisible 
                        ? `linear-gradient(135deg, ${GOOGLE_COLORS.red} 0%, ${GOOGLE_COLORS.darkRed} 100%)`
                        : `linear-gradient(135deg, ${GOOGLE_COLORS.green} 0%, ${GOOGLE_COLORS.darkGreen} 100%)`,
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: studyJamsVisibilityLoading ? 'not-allowed' : 'pointer',
                      opacity: studyJamsVisibilityLoading ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {studyJamsVisibilityLoading ? (
                      <>
                        <FaSync size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Updating...
                      </>
                    ) : studyJamsNavbarVisible ? (
                      <>
                        <FaToggleOn size={18} />
                        Hide from Navbar
                      </>
                    ) : (
                      <>
                        <FaToggleOff size={18} />
                        Show in Navbar
                      </>
                    )}
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  <div
                    onClick={() => setShowEnrollmentModal(true)}
                    style={{
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}15 0%, ${GOOGLE_COLORS.green}15 100%)`,
                      border: `2px dashed ${GOOGLE_COLORS.blue}40`,
                      borderRadius: '20px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '20px',
                      background: `${GOOGLE_COLORS.blue}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <FaFileUpload size={32} style={{ color: GOOGLE_COLORS.blue }} />
                    </div>
                    <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Enroll Participants</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px' }}>Upload CSV/XLSX file</p>
                    <span style={{
                      padding: '10px 24px',
                      background: GOOGLE_COLORS.blue,
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>Choose File</span>
                  </div>

                  <div
                    onClick={() => setShowProgressModal(true)}
                    style={{
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.green}15 0%, ${GOOGLE_COLORS.yellow}15 100%)`,
                      border: `2px dashed ${GOOGLE_COLORS.green}40`,
                      borderRadius: '20px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '20px',
                      background: `${GOOGLE_COLORS.green}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <GiProgression size={32} style={{ color: GOOGLE_COLORS.green }} />
                    </div>
                    <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Update Progress</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px' }}>Upload progress report</p>
                    <span style={{
                      padding: '10px 24px',
                      background: GOOGLE_COLORS.green,
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>Choose File</span>
                  </div>

                  <div
                    onClick={() => setShowParticipantsModal(true)}
                    style={{
                      background: `linear-gradient(135deg, ${GOOGLE_COLORS.yellow}15 0%, ${GOOGLE_COLORS.red}15 100%)`,
                      border: `2px dashed ${GOOGLE_COLORS.yellow}40`,
                      borderRadius: '20px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '20px',
                      background: `${GOOGLE_COLORS.yellow}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <FaUsers size={32} style={{ color: GOOGLE_COLORS.yellow }} />
                    </div>
                    <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>View Participants</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px' }}>{stats.totalParticipants} in {stats.totalTeams} teams</p>
                    <span style={{
                      padding: '10px 24px',
                      background: GOOGLE_COLORS.yellow,
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>View All</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GiPodium style={{ color: GOOGLE_COLORS.yellow }} />
                    Teams Leaderboard
                  </h3>

                  {participants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <GiProgression size={80} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '20px' }} />
                      <h4 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Teams Enrolled</h4>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Upload an enrollment file to get started</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {participants.map((team, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: idx < 3 ? `${[GOOGLE_COLORS.yellow, GOOGLE_COLORS.blue, GOOGLE_COLORS.green][idx]}10` : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${idx < 3 ? `${[GOOGLE_COLORS.yellow, GOOGLE_COLORS.blue, GOOGLE_COLORS.green][idx]}30` : 'rgba(255, 255, 255, 0.05)'}`,
                            borderRadius: '16px',
                            padding: '20px 24px',
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto auto auto',
                            gap: '24px',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '14px',
                            background: `linear-gradient(135deg, ${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][idx % 4]}, ${[GOOGLE_COLORS.darkBlue, GOOGLE_COLORS.darkGreen, GOOGLE_COLORS.darkYellow, GOOGLE_COLORS.darkRed][idx % 4]})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '18px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                          }}>
                            #{team.teamRank || idx + 1}
                          </div>
                          <div>
                            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Team {team.team}</h4>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                              {team.memberCount} members • Lead: {team.lead?.userName || 'N/A'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ color: GOOGLE_COLORS.blue, fontSize: '22px', fontWeight: 800 }}>{team.totalScore || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Score</p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ color: GOOGLE_COLORS.green, fontSize: '20px', fontWeight: 700 }}>{team.totalSkillBadges || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Badges</p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '20px', fontWeight: 700 }}>{team.totalArcadeGames || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Games</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowEventModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdEventNote style={{ color: GOOGLE_COLORS.blue }} />
                Create New Event
              </h2>
              <button onClick={() => setShowEventModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaInfoCircle style={{ color: GOOGLE_COLORS.blue }} />
                Event Name <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="text"
                value={eventForm.eventName}
                onChange={(e) => setEventForm(prev => ({ ...prev, eventName: e.target.value }))}
                placeholder="Enter event name..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaEdit style={{ color: GOOGLE_COLORS.green }} />
                Description
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <FaCalendarAlt style={{ color: GOOGLE_COLORS.yellow }} />
                  Date <span style={{ color: GOOGLE_COLORS.red }}>*</span>
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <MdEventNote style={{ color: GOOGLE_COLORS.blue }} />
                  Event Type
                </label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1a1f3a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="workshop" style={{ background: '#1a1f3a', color: 'white' }}>Workshop</option>
                  <option value="seminar" style={{ background: '#1a1f3a', color: 'white' }}>Seminar</option>
                  <option value="hackathon" style={{ background: '#1a1f3a', color: 'white' }}>Hackathon</option>
                  <option value="meetup" style={{ background: '#1a1f3a', color: 'white' }}>Meetup</option>
                  <option value="conference" style={{ background: '#1a1f3a', color: 'white' }}>Conference</option>
                  <option value="webinar" style={{ background: '#1a1f3a', color: 'white' }}>Webinar</option>
                  <option value="other" style={{ background: '#1a1f3a', color: 'white' }}>Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaCheckCircle style={{ color: GOOGLE_COLORS.green }} />
                Status
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['upcoming', 'ongoing', 'past'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEventForm(prev => ({ ...prev, status }))}
                    style={{
                      flex: 1,
                      minWidth: '90px',
                      padding: '12px 16px',
                      background: eventForm.status === status 
                        ? `linear-gradient(135deg, ${status === 'upcoming' ? GOOGLE_COLORS.green : status === 'ongoing' ? GOOGLE_COLORS.blue : '#666'}, ${status === 'upcoming' ? GOOGLE_COLORS.darkGreen : status === 'ongoing' ? GOOGLE_COLORS.darkBlue : '#444'})`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${eventForm.status === status ? 'transparent' : 'rgba(255, 255, 255, 0.15)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaImage style={{ color: GOOGLE_COLORS.yellow }} />
                Event Image (optional)
              </label>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEventImageFile(file);
                      setEventForm(prev => ({ ...prev, imageUrl: '' }));
                    }
                  }}
                  style={{ display: 'none' }}
                  id="event-image-upload-create"
                />
                <label htmlFor="event-image-upload-create" style={{ cursor: 'pointer', display: 'block' }}>
                  {eventImageFile ? (
                    <div>
                      <FaCheckCircle size={32} style={{ color: GOOGLE_COLORS.green, marginBottom: '8px' }} />
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{eventImageFile.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{(eventImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <FaUpload size={32} style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }} />
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '4px' }}>Click to upload image</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
                {eventImageFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventImageFile(null);
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '6px 16px',
                      background: 'rgba(234, 67, 53, 0.2)',
                      border: '1px solid rgba(234, 67, 53, 0.4)',
                      borderRadius: '8px',
                      color: GOOGLE_COLORS.red,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {imageUploading && (
                <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '12px', marginTop: '8px' }}>
                  ⏳ Uploading to cloud...
                </p>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaLink style={{ color: GOOGLE_COLORS.blue }} />
                Reference URL (optional)
              </label>
              <input
                type="url"
                value={eventForm.referenceUrl}
                onChange={(e) => setEventForm(prev => ({ ...prev, referenceUrl: e.target.value }))}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setEventImageFile(null);
                  setEventForm({ eventName: '', description: '', date: '', eventType: 'workshop', status: 'upcoming', imageUrl: '', referenceUrl: '' });
                }} 
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleEventFormSubmit} 
                disabled={!eventForm.eventName.trim() || !eventForm.date || imageUploading}
                style={{ 
                  padding: '14px 28px', 
                  background: (eventForm.eventName.trim() && eventForm.date && !imageUploading) 
                    ? `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})` 
                    : 'rgba(128,128,128,0.3)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (eventForm.eventName.trim() && eventForm.date && !imageUploading) ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  boxShadow: (eventForm.eventName.trim() && eventForm.date && !imageUploading) ? '0 4px 15px rgba(66, 133, 244, 0.3)' : 'none'
                }}
              >
                <FaPlus />
                {imageUploading ? 'Uploading...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventEditModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => { setShowEventEditModal(false); setSelectedEvent(null); }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaEdit style={{ color: GOOGLE_COLORS.yellow }} />
                Edit Event
              </h2>
              <button onClick={() => { setShowEventEditModal(false); setSelectedEvent(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaInfoCircle style={{ color: GOOGLE_COLORS.blue }} />
                Event Name <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="text"
                value={eventForm.eventName}
                onChange={(e) => setEventForm(prev => ({ ...prev, eventName: e.target.value }))}
                placeholder="Enter event name..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaEdit style={{ color: GOOGLE_COLORS.green }} />
                Description
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <FaCalendarAlt style={{ color: GOOGLE_COLORS.yellow }} />
                  Date <span style={{ color: GOOGLE_COLORS.red }}>*</span>
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <MdEventNote style={{ color: GOOGLE_COLORS.blue }} />
                  Event Type
                </label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1a1f3a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="workshop" style={{ background: '#1a1f3a', color: 'white' }}>Workshop</option>
                  <option value="seminar" style={{ background: '#1a1f3a', color: 'white' }}>Seminar</option>
                  <option value="hackathon" style={{ background: '#1a1f3a', color: 'white' }}>Hackathon</option>
                  <option value="meetup" style={{ background: '#1a1f3a', color: 'white' }}>Meetup</option>
                  <option value="conference" style={{ background: '#1a1f3a', color: 'white' }}>Conference</option>
                  <option value="webinar" style={{ background: '#1a1f3a', color: 'white' }}>Webinar</option>
                  <option value="other" style={{ background: '#1a1f3a', color: 'white' }}>Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaCheckCircle style={{ color: GOOGLE_COLORS.green }} />
                Status
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['upcoming', 'ongoing', 'past'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEventForm(prev => ({ ...prev, status }))}
                    style={{
                      flex: 1,
                      minWidth: '90px',
                      padding: '12px 16px',
                      background: eventForm.status === status 
                        ? `linear-gradient(135deg, ${status === 'upcoming' ? GOOGLE_COLORS.green : status === 'ongoing' ? GOOGLE_COLORS.blue : '#666'}, ${status === 'upcoming' ? GOOGLE_COLORS.darkGreen : status === 'ongoing' ? GOOGLE_COLORS.darkBlue : '#444'})`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${eventForm.status === status ? 'transparent' : 'rgba(255, 255, 255, 0.15)'}`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaImage style={{ color: GOOGLE_COLORS.yellow }} />
                Event Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                id="editEventImageUpload"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setEventImageFile(e.target.files[0]);
                    setEventForm(prev => ({ ...prev, imageUrl: '' }));
                  }
                }}
              />
              {eventImageFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}>
                  <img 
                    src={URL.createObjectURL(eventImageFile)} 
                    alt="Preview" 
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <span style={{ color: 'white', fontSize: '14px', flex: 1 }}>{eventImageFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setEventImageFile(null)}
                    style={{ background: 'rgba(255,0,0,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: GOOGLE_COLORS.red }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : eventForm.imageUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}>
                  <img 
                    src={eventForm.imageUrl} 
                    alt="Current" 
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', flex: 1 }}>Current image</span>
                  <button
                    type="button"
                    onClick={() => document.getElementById('editEventImageUpload').click()}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: 'white', fontSize: '13px' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="editEventImageUpload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaUpload /> Click to upload image
                </label>
              )}
              {imageUploading && (
                <div style={{ marginTop: '8px', color: GOOGLE_COLORS.blue, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCloudUploadAlt /> Uploading to cloud...
                </div>
              )}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaLink style={{ color: GOOGLE_COLORS.blue }} />
                Reference URL (optional)
              </label>
              <input
                type="url"
                value={eventForm.referenceUrl}
                onChange={(e) => setEventForm(prev => ({ ...prev, referenceUrl: e.target.value }))}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowEventEditModal(false);
                  setSelectedEvent(null);
                  setEventForm({ eventName: '', description: '', date: '', eventType: 'workshop', status: 'upcoming', imageUrl: '', referenceUrl: '' });
                  setEventImageFile(null);
                }} 
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleEventUpdate} 
                disabled={!eventForm.eventName.trim() || !eventForm.date}
                style={{ 
                  padding: '14px 28px', 
                  background: (eventForm.eventName.trim() && eventForm.date) 
                    ? `linear-gradient(135deg, ${GOOGLE_COLORS.yellow}, ${GOOGLE_COLORS.darkYellow})` 
                    : 'rgba(128,128,128,0.3)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (eventForm.eventName.trim() && eventForm.date) ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  boxShadow: (eventForm.eventName.trim() && eventForm.date) ? '0 4px 15px rgba(251, 188, 4, 0.3)' : 'none'
                }}
              >
                <FaEdit />
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowQuizModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdQuiz style={{ color: GOOGLE_COLORS.green }} />
                Create New Quiz
              </h2>
              <button onClick={() => setShowQuizModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>

            <div style={{ 
              background: 'rgba(66, 133, 244, 0.08)', 
              border: '1px solid rgba(66, 133, 244, 0.2)', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '24px' 
            }}>
              <h3 style={{ color: GOOGLE_COLORS.blue, fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaInfoCircle /> Quiz Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Quiz ID <span style={{ color: GOOGLE_COLORS.red }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={quizForm.quiz_id}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, quiz_id: e.target.value }))}
                    placeholder="unique-quiz-id"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Quiz Title <span style={{ color: GOOGLE_COLORS.red }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quiz title..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Description
                </label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Quiz description..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={quizForm.category}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Web Dev"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Difficulty
                  </label>
                  <select
                    className="admin-select"
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#1a1f3a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Beginner" style={{ background: '#1a1f3a', color: 'white' }}>Beginner</option>
                    <option value="Intermediate" style={{ background: '#1a1f3a', color: 'white' }}>Intermediate</option>
                    <option value="Advanced" style={{ background: '#1a1f3a', color: 'white' }}>Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={quizForm.time_limit_min}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, time_limit_min: e.target.value }))}
                    placeholder="10"
                    min="1"
                    max="180"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Time/Question (sec)
                      <span style={{ fontSize: '10px', padding: '2px 6px', background: 'linear-gradient(135deg, #EA4335, #FBBC05)', borderRadius: '4px', color: 'white', fontWeight: 700 }}>LIVE</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={quizForm.time_per_question}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, time_per_question: e.target.value }))}
                    placeholder="30"
                    min="10"
                    max="300"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(234, 67, 53, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>Used for live quiz mode only</span>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Access Code
                  </label>
                  <input
                    type="text"
                    value={quizForm.access_code}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, access_code: e.target.value }))}
                    placeholder="Optional"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaListOl style={{ color: GOOGLE_COLORS.yellow }} />
                  Questions ({quizQuestions.length})
                </h3>
                <button
                  onClick={addQuizQuestion}
                  style={{
                    padding: '10px 20px',
                    background: `linear-gradient(135deg, ${GOOGLE_COLORS.green}, ${GOOGLE_COLORS.darkGreen})`,
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaPlus size={12} />
                  Add Question
                </button>
              </div>

              {quizQuestions.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center'
                }}>
                  <FaQuestionCircle size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                    No questions added yet. Click "Add Question" to start building your quiz.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                  {quizQuestions.map((question, qIndex) => (
                    <div key={qIndex} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ 
                          background: `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.darkBlue})`,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'white'
                        }}>
                          Question {qIndex + 1}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            className="admin-select"
                            value={question.type}
                            onChange={(e) => updateQuizQuestion(qIndex, 'type', e.target.value)}
                            style={{
                              padding: '6px 12px',
                              background: '#1a1f3a',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '13px',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="single_choice" style={{ background: '#1a1f3a', color: 'white' }}>Single Choice</option>
                            <option value="multiple_choice" style={{ background: '#1a1f3a', color: 'white' }}>Multiple Choice</option>
                          </select>
                          <input
                            type="number"
                            value={question.marks}
                            onChange={(e) => updateQuizQuestion(qIndex, 'marks', e.target.value)}
                            style={{
                              width: '60px',
                              padding: '6px 10px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '13px',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                            placeholder="Marks"
                          />
                          <button
                            onClick={() => removeQuizQuestion(qIndex)}
                            style={{
                              padding: '6px 10px',
                              background: `${GOOGLE_COLORS.red}20`,
                              border: `1px solid ${GOOGLE_COLORS.red}40`,
                              borderRadius: '8px',
                              color: GOOGLE_COLORS.red,
                              cursor: 'pointer'
                            }}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        value={question.question_text}
                        onChange={(e) => updateQuizQuestion(qIndex, 'question_text', e.target.value)}
                        placeholder="Enter your question..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '14px',
                          outline: 'none',
                          marginBottom: '12px'
                        }}
                      />
                      
                      {/* Question Image Upload (Optional) */}
                      <div style={{ 
                        marginBottom: '16px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '10px',
                        border: '1px dashed rgba(255, 255, 255, 0.1)'
                      }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '13px',
                          marginBottom: '8px'
                        }}>
                          <FaImage style={{ color: GOOGLE_COLORS.blue }} />
                          Question Image (Optional)
                        </label>
                        {question.image ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={question.image} 
                              alt="Question" 
                              style={{ 
                                width: '100px', 
                                height: '60px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }} 
                            />
                            <button
                              onClick={() => removeQuestionImage(qIndex)}
                              style={{
                                padding: '6px 12px',
                                background: `${GOOGLE_COLORS.red}20`,
                                border: `1px solid ${GOOGLE_COLORS.red}40`,
                                borderRadius: '6px',
                                color: GOOGLE_COLORS.red,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FaTimes size={10} />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleQuestionImageUpload(qIndex, e.target.files[0])}
                              style={{ display: 'none' }}
                              id={`question-image-${qIndex}`}
                              disabled={questionImageUploading[qIndex]}
                            />
                            <label 
                              htmlFor={`question-image-${qIndex}`}
                              style={{
                                padding: '8px 16px',
                                background: questionImageUploading[qIndex] ? 'rgba(128, 128, 128, 0.3)' : `linear-gradient(135deg, ${GOOGLE_COLORS.blue}20, ${GOOGLE_COLORS.blue}10)`,
                                border: `1px solid ${GOOGLE_COLORS.blue}40`,
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '12px',
                                cursor: questionImageUploading[qIndex] ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {questionImageUploading[qIndex] ? (
                                <>
                                  <span className="spinner" style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FaUpload size={10} />
                                  Upload Image
                                </>
                              )}
                            </label>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                              Add an image to display with this question
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => toggleCorrectAnswer(qIndex, option.option_id)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border: question.correct_answers.includes(option.option_id) 
                                  ? `2px solid ${GOOGLE_COLORS.green}`
                                  : '2px solid rgba(255,255,255,0.2)',
                                background: question.correct_answers.includes(option.option_id) 
                                  ? GOOGLE_COLORS.green 
                                  : 'transparent',
                                color: question.correct_answers.includes(option.option_id) ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                flexShrink: 0
                              }}
                            >
                              {option.option_id.toUpperCase()}
                            </button>
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${option.option_id.toUpperCase()}`}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '8px' }}>
                        💡 Click the letter buttons to mark correct answer(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <button 
                onClick={() => {
                  setShowQuizModal(false);
                  setQuizForm({ quiz_id: '', title: '', description: '', category: '', difficulty: 'Beginner', time_limit_min: 10, time_per_question: 30, total_marks: 10, access_code: '' });
                  setQuizQuestions([]);
                  setQuestionImageUploading({});
                }} 
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleQuizFormSubmit} 
                disabled={!quizForm.quiz_id.trim() || !quizForm.title.trim() || quizQuestions.length === 0}
                style={{ 
                  padding: '14px 28px', 
                  background: (quizForm.quiz_id.trim() && quizForm.title.trim() && quizQuestions.length > 0) 
                    ? `linear-gradient(135deg, ${GOOGLE_COLORS.green}, ${GOOGLE_COLORS.blue})` 
                    : 'rgba(128,128,128,0.3)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (quizForm.quiz_id.trim() && quizForm.title.trim() && quizQuestions.length > 0) ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  boxShadow: (quizForm.quiz_id.trim() && quizForm.title.trim() && quizQuestions.length > 0) ? '0 4px 15px rgba(52, 168, 83, 0.3)' : 'none'
                }}
              >
                <FaPlus />
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {showEnrollmentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowEnrollmentModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaFileUpload style={{ color: GOOGLE_COLORS.blue }} />
                Enroll Participants
              </h2>
              <button onClick={() => { setShowEnrollmentModal(false); setEnrollmentFile(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            <div style={{
              border: '2px dashed rgba(66, 133, 244, 0.4)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              background: 'rgba(66, 133, 244, 0.05)'
            }}>
              <FaFileUpload size={48} style={{ color: GOOGLE_COLORS.blue, marginBottom: '16px' }} />
              <p style={{ color: 'white', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                {enrollmentFile ? `Selected: ${enrollmentFile.name}` : 'Select CSV or XLSX file'}
              </p>
              <input type="file" accept=".csv,.xlsx" onChange={(e) => setEnrollmentFile(e.target.files[0])} style={{ display: 'none' }} id="enrollment-file-input" />
              <label htmlFor="enrollment-file-input" style={{ padding: '12px 24px', background: GOOGLE_COLORS.blue, color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                Choose File
              </label>
            </div>
            <div style={{ background: 'rgba(66, 133, 244, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: `4px solid ${GOOGLE_COLORS.blue}` }}>
              <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>
                <strong>Required columns:</strong> userName, userEmail, team, isLead, skillBadgesCompleted, arcadeGamesCompleted
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEnrollmentModal(false); setEnrollmentFile(null); }} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEnrollmentUpload} disabled={!enrollmentFile || loading} style={{ padding: '12px 24px', background: (enrollmentFile && !loading) ? GOOGLE_COLORS.blue : 'rgba(128,128,128,0.3)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: (enrollmentFile && !loading) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUpload />
                {loading ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowProgressModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GiProgression style={{ color: GOOGLE_COLORS.green }} />
                Update Progress
              </h2>
              <button onClick={() => { setShowProgressModal(false); setProgressFile(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            <div style={{
              border: '2px dashed rgba(52, 168, 83, 0.4)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              background: 'rgba(52, 168, 83, 0.05)'
            }}>
              <GiProgression size={48} style={{ color: GOOGLE_COLORS.green, marginBottom: '16px' }} />
              <p style={{ color: 'white', fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>
                {progressFile ? `Selected: ${progressFile.name}` : 'Select CSV or XLSX file'}
              </p>
              <input type="file" accept=".csv,.xlsx" onChange={(e) => setProgressFile(e.target.files[0])} style={{ display: 'none' }} id="progress-file-input" />
              <label htmlFor="progress-file-input" style={{ padding: '12px 24px', background: GOOGLE_COLORS.green, color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                Choose File
              </label>
            </div>
            <div style={{ background: 'rgba(52, 168, 83, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px', borderLeft: `4px solid ${GOOGLE_COLORS.green}` }}>
              <p style={{ color: 'white', fontSize: '14px', margin: '0 0 8px 0' }}>
                <strong>Required columns:</strong> User Name, Total Skill Badges Completed, Total Arcade Games Completed
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
                ℹ️ This updates existing participants only
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowProgressModal(false); setProgressFile(null); }} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleProgressUpload} disabled={!progressFile || loading} style={{ padding: '12px 24px', background: (progressFile && !loading) ? GOOGLE_COLORS.green : 'rgba(128,128,128,0.3)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: (progressFile && !loading) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUpload />
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showParticipantsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowParticipantsModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '1100px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>All Participants</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{stats.totalParticipants} participants in {stats.totalTeams} teams</p>
              </div>
              <button onClick={() => setShowParticipantsModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              {participants.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <FaUsers size={64} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>No participants found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {participants.map((team, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '14px',
                          background: `linear-gradient(135deg, ${[GOOGLE_COLORS.blue, GOOGLE_COLORS.green, GOOGLE_COLORS.yellow, GOOGLE_COLORS.red][idx % 4]}, ${[GOOGLE_COLORS.darkBlue, GOOGLE_COLORS.darkGreen, GOOGLE_COLORS.darkYellow, GOOGLE_COLORS.darkRed][idx % 4]})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '20px'
                        }}>
                          #{team.teamRank || idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Team {team.team}</h3>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{team.memberCount} members • Lead: {team.lead?.userName || 'N/A'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
                          <div>
                            <p style={{ color: GOOGLE_COLORS.blue, fontSize: '24px', fontWeight: 800 }}>{team.totalScore || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Score</p>
                          </div>
                          <div>
                            <p style={{ color: GOOGLE_COLORS.green, fontSize: '24px', fontWeight: 800 }}>{team.totalSkillBadges || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Badges</p>
                          </div>
                          <div>
                            <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '24px', fontWeight: 800 }}>{team.totalArcadeGames || 0}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Games</p>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {team.members?.map((member, memberIdx) => (
                          <div key={memberIdx} style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto auto auto',
                            gap: '16px',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '10px'
                          }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: member.isLead ? `linear-gradient(135deg, ${GOOGLE_COLORS.yellow}, ${GOOGLE_COLORS.darkYellow})` : 'rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '14px'
                            }}>
                              {member.userName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{member.userName || 'Unknown'}</span>
                                {member.isLead && (
                                  <span style={{ padding: '2px 8px', background: GOOGLE_COLORS.yellow, color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>LEAD</span>
                                )}
                              </div>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{member.userEmail || 'No email'}</span>
                            </div>
                            <div style={{ textAlign: 'center', padding: '4px 12px', background: `${GOOGLE_COLORS.green}15`, borderRadius: '8px' }}>
                              <span style={{ color: GOOGLE_COLORS.green, fontWeight: 700 }}>{member.skillBadgesCompleted || 0}</span>
                            </div>
                            <div style={{ textAlign: 'center', padding: '4px 12px', background: `${GOOGLE_COLORS.yellow}15`, borderRadius: '8px' }}>
                              <span style={{ color: GOOGLE_COLORS.yellow, fontWeight: 700 }}>{member.arcadeGamesCompleted || 0}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteParticipant(member.userEmail)}
                              style={{
                                padding: '8px 12px',
                                background: `${GOOGLE_COLORS.red}15`,
                                border: `1px solid ${GOOGLE_COLORS.red}30`,
                                borderRadius: '8px',
                                color: GOOGLE_COLORS.red,
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={handleDeleteAllParticipants} style={{ padding: '12px 24px', background: `${GOOGLE_COLORS.red}15`, border: `1px solid ${GOOGLE_COLORS.red}`, color: GOOGLE_COLORS.red, borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTrash />
                Delete All
              </button>
              <button onClick={() => setShowParticipantsModal(false)} style={{ padding: '12px 32px', background: GOOGLE_COLORS.blue, color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowAddAdminModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUserShield style={{ color: GOOGLE_COLORS.green }} />
                Add New Admin
              </h2>
              <button onClick={() => setShowAddAdminModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaUser style={{ color: GOOGLE_COLORS.blue }} />
                Username <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="text"
                value={newAdminForm.username}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaInfoCircle style={{ color: GOOGLE_COLORS.yellow }} />
                Email <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="email"
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaCog style={{ color: GOOGLE_COLORS.red }} />
                Password <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="password"
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <FaCrown style={{ color: GOOGLE_COLORS.green }} />
                Secret Key <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="text"
                value={newAdminForm.secretKey}
                readOnly
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(52, 168, 83, 0.1)',
                  border: '1px solid rgba(52, 168, 83, 0.3)',
                  borderRadius: '12px',
                  color: GOOGLE_COLORS.green,
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
              <p style={{ color: 'rgba(52, 168, 83, 0.7)', fontSize: '12px', marginTop: '6px' }}>
                ✓ Pre-configured secret key for admin registration
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdminForm({ username: '', email: '', password: '', secretKey: '' });
                }} 
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAdmin} 
                disabled={!newAdminForm.username.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim() || !newAdminForm.secretKey.trim() || addingAdmin}
                style={{ 
                  padding: '14px 28px', 
                  background: (!newAdminForm.username.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim() || !newAdminForm.secretKey.trim() || addingAdmin) 
                    ? 'rgba(255,255,255,0.1)' 
                    : `linear-gradient(135deg, ${GOOGLE_COLORS.green}, ${GOOGLE_COLORS.blue})`, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (!newAdminForm.username.trim() || !newAdminForm.email.trim() || !newAdminForm.password.trim() || !newAdminForm.secretKey.trim() || addingAdmin) ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                {addingAdmin ? 'Adding...' : <><FaPlus /> Add Admin</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setShowChangePasswordModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaCog style={{ color: GOOGLE_COLORS.blue }} />
                Change Password
              </h2>
              <button onClick={() => setShowChangePasswordModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Current Password <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                New Password <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 chars)"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                name="new-password-field"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Confirm New Password <span style={{ color: GOOGLE_COLORS.red }}>*</span>
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                name="confirm-password-field"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }} 
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleChangePassword} 
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || changingPassword}
                style={{ 
                  padding: '14px 28px', 
                  background: (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || changingPassword) 
                    ? 'rgba(255,255,255,0.1)' 
                    : `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || changingPassword) ? 'not-allowed' : 'pointer'
                }}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* User Quiz History Modal */}
      {showUserHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }} onClick={() => { setShowUserHistoryModal(false); setUserHistoryData(null); setUserHistorySearch(''); }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUser style={{ color: GOOGLE_COLORS.blue }} />
                User Quiz History
              </h2>
              <button onClick={() => { setShowUserHistoryModal(false); setUserHistoryData(null); setUserHistorySearch(''); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', color: 'white' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                value={userHistorySearch}
                onChange={(e) => setUserHistorySearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetchUserHistory()}
                placeholder="Enter Roll Number / User ID"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleFetchUserHistory}
                disabled={userHistoryLoading || !userHistorySearch.trim()}
                style={{ 
                  padding: '14px 24px', 
                  background: (!userHistorySearch.trim() || userHistoryLoading) ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOOGLE_COLORS.blue}, ${GOOGLE_COLORS.green})`, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  cursor: (!userHistorySearch.trim() || userHistoryLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaSearch />
                {userHistoryLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {userHistoryData && (
              <div>
                {/* Summary */}
                <div style={{
                  background: 'rgba(66, 133, 244, 0.1)',
                  border: '1px solid rgba(66, 133, 244, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Summary for {userHistoryData.user_id}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: GOOGLE_COLORS.blue, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{userHistoryData.summary?.total_attempts || 0}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Total Attempts</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: GOOGLE_COLORS.green, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{userHistoryData.summary?.total_score || 0}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Total Score</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: GOOGLE_COLORS.yellow, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{userHistoryData.summary?.average_percentage || 0}%</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Avg Percentage</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: GOOGLE_COLORS.red, fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{userHistoryData.summary?.best_score || 0}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Best Score</p>
                    </div>
                  </div>
                </div>

                {/* Attempts List */}
                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Quiz Attempts</h3>
                {userHistoryData.attempts?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {userHistoryData.attempts.map((attempt, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{attempt.quiz_title}</p>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                            {new Date(attempt.submitted_at).toLocaleDateString()} • {attempt.quiz_id}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: GOOGLE_COLORS.green, fontSize: '18px', fontWeight: 700 }}>{attempt.score}</p>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{attempt.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>No quiz attempts found</p>
                )}
              </div>
            )}

            {!userHistoryData && !userHistoryLoading && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
                <FaSearch size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>Enter a roll number or user ID to view their quiz history</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default AdminDashboardPage;
