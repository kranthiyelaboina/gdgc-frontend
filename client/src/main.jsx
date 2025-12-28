import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import App from './App.jsx';

// Ensure CSS is loaded before rendering
document.documentElement.style.opacity = '1';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
