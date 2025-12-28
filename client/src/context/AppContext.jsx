import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔑 AppContext init - Token exists:', !!token);
      
      if (token) {
        // Don't call getCurrentAdmin() here - it causes race conditions
        // The token exists, that's enough to consider user potentially authenticated
        // The admin dashboard will handle fetching user data
        const savedUsername = localStorage.getItem('adminUsername');
        if (savedUsername) {
          // Create a minimal user object from localStorage
          setUser({ username: savedUsername, token });
          console.log('👤 AppContext - Restored user from localStorage:', savedUsername);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    setUser,
    theme,
    setTheme,
    language,
    setLanguage,
    sidebarOpen,
    setSidebarOpen,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
