/**
 * Tarih işlemleri için yardımcı fonksiyonlar
 */

/**
 * Bir tarihi belirtilen formatta formatlar
 * @param {Date|string} date - Formatlanacak tarih
 * @param {Object} options - Intl.DateTimeFormat seçenekleri
 * @returns {string} - Formatlanmış tarih
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    // Varsayılan seçenekler
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    };
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Geçersiz tarih kontrolü
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat('tr-TR', defaultOptions).format(dateObj);
  };
  
  /**
   * Bir tarihi ve saati formatlar
   * @param {Date|string} date - Formatlanacak tarih
   * @returns {string} - Formatlanmış tarih ve saat
   */
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return formatDate(date, options);
  };
  
  /**
   * Bir tarihin saat kısmını formatlar
   * @param {Date|string} date - Formatlanacak tarih
   * @returns {string} - Formatlanmış saat
   */
  export const formatTime = (date) => {
    if (!date) return '';
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return formatDate(date, options);
  };
  
  /**
   * Geçen zamanı "şu kadar önce" şeklinde formatlar
   * @param {Date|string} date - Tarih
   * @returns {string} - "x saniye önce", "x dakika önce" gibi
   */
  export const timeAgo = (date) => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    // Geçersiz tarih kontrolü
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const seconds = Math.floor((now - dateObj) / 1000);
    
    // 60 saniyeden az
    if (seconds < 60) {
      return `${seconds} saniye önce`;
    }
    
    // 60 dakikadan az
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} dakika önce`;
    }
    
    // 24 saatten az
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} saat önce`;
    }
    
    // 30 günden az
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} gün önce`;
    }
    
    // 12 aydan az
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ay önce`;
    }
    
    // 1 yıldan fazla
    const years = Math.floor(months / 12);
    return `${years} yıl önce`;
  };
  
  /**
   * Tarih aralığı seçenekleri oluşturur
   * @returns {Array} - Tarih aralığı seçenekleri
   */
  export const getDateRangeOptions = () => {
    return [
      { value: 'today', label: 'Bugün' },
      { value: 'yesterday', label: 'Dün' },
      { value: 'last7days', label: 'Son 7 Gün' },
      { value: 'last30days', label: 'Son 30 Gün' },
      { value: 'thisMonth', label: 'Bu Ay' },
      { value: 'lastMonth', label: 'Geçen Ay' },
      { value: 'thisYear', label: 'Bu Yıl' },
      { value: 'custom', label: 'Özel Aralık' },
    ];
  };
  
  /**
   * Seçilen tarih aralığı için başlangıç ve bitiş tarihlerini hesaplar
   * @param {string} range - Tarih aralığı (today, yesterday, vs.)
   * @returns {Object} - { startDate, endDate }
   */
  export const getDateRangeFromOption = (range) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    
    switch (range) {
      case 'today':
        // startDate = today (varsayılan)
        break;
        
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
        
      case 'last7days':
        startDate.setDate(startDate.getDate() - 6);
        break;
        
      case 'last30days':
        startDate.setDate(startDate.getDate() - 29);
        break;
        
      case 'thisMonth':
        startDate.setDate(1);
        break;
        
      case 'lastMonth':
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setDate(0);
        break;
        
      case 'thisYear':
        startDate.setMonth(0, 1);
        break;
        
      default:
        return { startDate: null, endDate: null };
    }
    
    return {
      startDate,
      endDate,
    };
  };