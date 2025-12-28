const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: hover ? 'pointer' : 'default',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
