export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  return regex.test(username);
};

export const validatePassword = (password) => {
  if (password.length < 6) return false;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

export const validateQuizCode = (code) => {
  return code && code.length === 6 && /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

export const validateRollNumber = (rollNumber) => {
  return rollNumber && /^[A-Z0-9]+$/.test(rollNumber.toUpperCase());
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      if (!validateRequired(value)) return 'Email is required';
      if (!validateEmail(value)) return 'Invalid email format';
      return '';
    case 'username':
      if (!validateRequired(value)) return 'Username is required';
      if (!validateUsername(value)) return 'Username must be 3-30 characters, alphanumeric and underscore only';
      return '';
    case 'password':
      if (!validateRequired(value)) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      if (!validatePassword(value)) return 'Password must contain uppercase, lowercase and number';
      return '';
    case 'quizCode':
      if (!validateRequired(value)) return 'Quiz code is required';
      if (!validateQuizCode(value)) return 'Quiz code must be 6 alphanumeric characters';
      return '';
    case 'rollNumber':
      if (!validateRequired(value)) return 'Roll number is required';
      if (!validateRollNumber(value)) return 'Invalid roll number format';
      return '';
    default:
      if (!validateRequired(value)) return 'This field is required';
      return '';
  }
};
