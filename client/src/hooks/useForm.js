import { useState, useCallback } from 'react';

export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name] && validate) {
      const fieldError = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  }, [touched, validate]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    if (validate) {
      const fieldError = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  }, [validate]);

  const handleSubmit = useCallback((onSubmit) => (e) => {
    e.preventDefault();
    
    if (validate) {
      const newErrors = {};
      Object.keys(values).forEach((key) => {
        const error = validate(key, values[key]);
        if (error) newErrors[key] = error;
      });
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        onSubmit(values);
      }
    } else {
      onSubmit(values);
    }
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
};
