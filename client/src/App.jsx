import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import QuizPage from './pages/QuizPage';
import ContactPage from './pages/ContactPage';
import StudyJamsPage from './pages/StudyJamsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LiveQuizHostPage from './pages/LiveQuizHostPage';
import ScrollToTop from './components/common/ScrollToTop';
import './styles/theme.css';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/host/:quizId" element={<LiveQuizHostPage />} />
          <Route path="/studyjams" element={<StudyJamsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<Navigate to="/quiz" replace />} />
          <Route path="/admin/register" element={<Navigate to="/quiz" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
