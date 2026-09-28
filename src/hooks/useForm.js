import { useState, useCallback, useMemo } from 'react';

// initialValues: object. validate(values) -> { field: 'message' } (empty object = valid).
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // clear that field's error as soon as the user edits it
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const handleSubmit = (onSubmit) => () => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [values, validate]);

  return { values, errors, handleChange, handleSubmit, reset, isValid };
}
