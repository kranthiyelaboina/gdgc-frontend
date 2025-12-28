import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-weight-600 cursor-pointer border-none transition-all duration-300 font-size-16';
  
  const variants = {
    primary: 'background-color:#f9ab00 color:#000000 padding:16px 48px border-radius:50px hover:transform:scale(1.05) hover:box-shadow:0 8px 24px rgba(249, 171, 0, 0.3)',
    secondary: 'background-color:transparent border:2px solid white color:#333333 padding:16px 48px border-radius:50px hover:background:white hover:box-shadow:0 4px 16px rgba(0, 0, 0, 0.1)',
    gradient: 'background:linear-gradient(135deg, #4285f4 0%, #34a853 100%) color:white padding:16px 48px border-radius:12px hover:box-shadow:0 6px 20px rgba(66, 133, 244, 0.4) hover:transform:translateY(-2px)',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
