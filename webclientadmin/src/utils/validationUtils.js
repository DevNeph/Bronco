/**
 * Form doğrulama yardımcı fonksiyonları
 */

/**
 * E-posta geçerliliğini kontrol eder
 * @param {string} email - E-posta adresi
 * @returns {boolean} - Geçerli ise true
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Telefon numarasının geçerliliğini kontrol eder
   * @param {string} phone - Telefon numarası
   * @returns {boolean} - Geçerli ise true
   */
  export const isValidPhone = (phone) => {
    // Basit bir doğrulama: sayılar, +, ve boşluk kabul edilir
    const phoneRegex = /^[0-9+\s]+$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * Şifre geçerliliğini kontrol eder (en az 6 karakter)
   * @param {string} password - Şifre
   * @returns {boolean} - Geçerli ise true
   */
  export const isValidPassword = (password) => {
    return password && password.length >= 6;
  };
  
  /**
   * Pozitif sayı kontrolü yapar
   * @param {number|string} value - Kontrol edilecek değer
   * @returns {boolean} - Geçerli ise true
   */
  export const isPositiveNumber = (value) => {
    const number = parseFloat(value);
    return !isNaN(number) && number > 0;
  };
  
  /**
   * URL'nin geçerli olup olmadığını kontrol eder
   * @param {string} url - URL
   * @returns {boolean} - Geçerli ise true
   */
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Genel bir form doğrulama fonksiyonu
   * @param {Object} values - Form değerleri
   * @param {Object} validationRules - Doğrulama kuralları
   * @returns {Object} - Hata mesajları
   * 
   * Örnek kullanım:
   * const errors = validateForm(formValues, {
   *   name: { required: true },
   *   email: { required: true, email: true },
   *   age: { required: true, min: 18 }
   * });
   */
  export const validateForm = (values, validationRules) => {
    const errors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];
      
      // Zorunlu alan kontrolü
      if (rules.required && (!value && value !== 0)) {
        errors[field] = `${field} alanı zorunludur`;
      }
      
      // Eğer değer varsa diğer kuralları kontrol et
      if (value !== undefined && value !== null && value !== '') {
        
        // Email kontrolü
        if (rules.email && !isValidEmail(value)) {
          errors[field] = 'Geçerli bir e-posta adresi giriniz';
        }
        
        // Telefon kontrolü
        if (rules.phone && !isValidPhone(value)) {
          errors[field] = 'Geçerli bir telefon numarası giriniz';
        }
        
        // Minimum uzunluk kontrolü
        if (rules.minLength && value.length < rules.minLength) {
          errors[field] = `En az ${rules.minLength} karakter giriniz`;
        }
        
        // Maximum uzunluk kontrolü
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] = `En fazla ${rules.maxLength} karakter giriniz`;
        }
        
        // Minimum değer kontrolü
        if (rules.min !== undefined) {
          const numberValue = parseFloat(value);
          if (isNaN(numberValue) || numberValue < rules.min) {
            errors[field] = `En az ${rules.min} olmalıdır`;
          }
        }
        
        // Maximum değer kontrolü
        if (rules.max !== undefined) {
          const numberValue = parseFloat(value);
          if (isNaN(numberValue) || numberValue > rules.max) {
            errors[field] = `En fazla ${rules.max} olmalıdır`;
          }
        }
        
        // Pozitif sayı kontrolü
        if (rules.positive && !isPositiveNumber(value)) {
          errors[field] = 'Pozitif bir sayı giriniz';
        }
        
        // URL kontrolü
        if (rules.url && !isValidUrl(value)) {
          errors[field] = 'Geçerli bir URL giriniz';
        }
        
        // Özel doğrulama fonksiyonu
        if (rules.validate && typeof rules.validate === 'function') {
          const customError = rules.validate(value, values);
          if (customError) {
            errors[field] = customError;
          }
        }
      }
    });
    
    return errors;
  };
  
  /**
   * Giriş formu doğrulama
   * @param {Object} values - Form değerleri
   * @returns {Object} - Hata mesajları
   */
  export const validateLoginForm = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!values.password) {
      errors.password = 'Şifre gereklidir';
    }
    
    return errors;
  };
  
  /**
   * Ürün formu doğrulama
   * @param {Object} values - Form değerleri
   * @returns {Object} - Hata mesajları
   */
  export const validateProductForm = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'Ürün adı gereklidir';
    }
    
    if (!values.price) {
      errors.price = 'Fiyat gereklidir';
    } else if (!isPositiveNumber(values.price)) {
      errors.price = 'Fiyat pozitif bir sayı olmalıdır';
    }
    
    if (!values.category) {
      errors.category = 'Kategori seçimi gereklidir';
    }
    
    return errors;
  };
  
  /**
   * Kullanıcı formu doğrulama
   * @param {Object} values - Form değerleri
   * @returns {Object} - Hata mesajları
   */
  export const validateUserForm = (values) => {
    const errors = {};
    
    if (!values.firstName) {
      errors.firstName = 'Ad gereklidir';
    }
    
    if (!values.lastName) {
      errors.lastName = 'Soyad gereklidir';
    }
    
    if (!values.email) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!values.phone) {
      errors.phone = 'Telefon numarası gereklidir';
    } else if (!isValidPhone(values.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (values.password && !isValidPassword(values.password)) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    return errors;
  };