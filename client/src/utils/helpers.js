import { format, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  try {
    return format(parseISO(`2000-01-01T${timeString}`), 'hh:mm a');
  } catch (error) {
    return timeString;
  }
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, interval) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      func(...args);
    }
  };
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    '#4285F4', '#EA4335', '#FBBC04', '#34A853', 
    '#FF6D00', '#7B1FA2', '#1976D2', '#388E3C'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
