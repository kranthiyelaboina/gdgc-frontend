import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, setUser, loading } = useAppContext();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = !!user;

  const isAdmin = user?.role === 'admin';

  return {
    user,
    setUser,
    loading,
    logout,
    isAuthenticated,
    isAdmin,
  };
};
