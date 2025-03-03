import { useState, useCallback } from 'react';

/**
 * Form işlemleri için özel hook
 * @param {Object} initialValues - Formun başlangıç değerleri
 * @param {Function} onSubmit - Form gönderildiğinde çalışacak fonksiyon
 * @param {Function} validate - Form doğrulama fonksiyonu (opsiyonel)
 * @returns {Object} - Form işlemleri için gerekli metodlar ve state
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form değerini güncelle
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Checkbox için checked değerini, diğer input'lar için value değerini kullan
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // Alan dokunuldu olarak işaretle
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Değerleri manuel olarak güncelle
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Bir alanın dokunuldu olarak işaretle
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Eğer doğrulama fonksiyonu varsa
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  // Form gönderildiğinde
  const handleSubmit = useCallback(async (e) => {
    e && e.preventDefault();
    
    setIsSubmitting(true);
    
    // Eğer doğrulama fonksiyonu varsa
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Hata varsa formu gönderme
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  // Formu sıfırla
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    setValues
  };
};

export default useForm;