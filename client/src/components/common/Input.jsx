const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  label,
  required = false,
  className = '',
  ...props
}) => {
  const handleFocus = (e) => {
    if (!error) {
      e.target.style.borderColor = '#34a853';
      e.target.style.boxShadow = '0 0 0 4px rgba(52, 168, 83, 0.1)';
    }
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#ea4335' : '#e0e0e0';
    e.target.style.boxShadow = 'none';
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`input-wrapper ${className}`} style={{ marginBottom: '20px' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#555555',
            marginBottom: '8px',
          }}
        >
          {label} {required && <span style={{ color: '#ea4335' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        style={{
          width: '100%',
          height: '54px',
          border: `2px solid ${error ? '#ea4335' : '#e0e0e0'}`,
          borderRadius: '14px',
          padding: '0 18px',
          fontSize: '16px',
          transition: 'all 0.3s',
          outline: 'none',
        }}
        {...props}
      />
      {error && (
        <span
          id={`${name}-error`}
          role="alert"
          style={{
            display: 'block',
            marginTop: '6px',
            fontSize: '13px',
            color: '#ea4335',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
