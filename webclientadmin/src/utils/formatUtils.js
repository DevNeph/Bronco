/**
 * Formatlar için yardımcı fonksiyonlar
 */

/**
 * Para birimini formatlar
 * @param {number} amount - Miktar
 * @param {string} currency - Para birimi (varsayılan: TRY)
 * @returns {string} - Formatlanmış para birimi
 */
export const formatCurrency = (amount, currency = 'TRY') => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Sayıyı formatlar
   * @param {number} number - Formatlanacak sayı
   * @param {number} decimals - Ondalık basamak sayısı
   * @returns {string} - Formatlanmış sayı
   */
  export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return '';
    
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  };
  
  /**
   * Telefon numarasını formatlar
   * @param {string} phone - Telefon numarası
   * @returns {string} - Formatlanmış telefon numarası
   */
  export const formatPhone = (phone) => {
    if (!phone) return '';
    
    // +90 formatında numaraları düzenle
    if (phone.startsWith('+')) {
      // +901234567890 -> +90 123 456 7890
      return phone.replace(/^\+(\d{2})(\d{3})(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
    }
    
    // 05xxxxxxxxx formatını düzenle
    if (phone.startsWith('0')) {
      // 05xxxxxxxxx -> 0xxx xxx xxxx
      return phone.replace(/^0(\d{3})(\d{3})(\d{4})$/, '0$1 $2 $3');
    }
    
    return phone;
  };
  
  /**
   * Ürün kategorisini formatlar (Türkçe isimlerini döndürür)
   * @param {string} category - Kategori adı
   * @returns {string} - Formatlanmış kategori
   */
  export const formatCategory = (category) => {
    const categories = {
      'coffee': 'Kahve',
      'tea': 'Çay',
      'food': 'Yiyecek',
      'dessert': 'Tatlı',
      'other': 'Diğer'
    };
    
    return categories[category] || category;
  };
  
  /**
   * Sipariş durumunu formatlar
   * @param {string} status - Sipariş durumu
   * @returns {string} - Formatlanmış durum
   */
  export const formatOrderStatus = (status) => {
    const statuses = {
      'pending': 'Beklemede',
      'accepted': 'Kabul Edildi',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi'
    };
    
    return statuses[status] || status;
  };
  
  /**
   * Ödeme yöntemini formatlar
   * @param {string} method - Ödeme yöntemi
   * @returns {string} - Formatlanmış ödeme yöntemi
   */
  export const formatPaymentMethod = (method) => {
    const methods = {
      'balance': 'Bakiye',
      'cash': 'Nakit',
      'card': 'Kredi Kartı'
    };
    
    return methods[method] || method;
  };
  
  /**
   * Metni belirli bir uzunlukta kısaltır
   * @param {string} text - Metin
   * @param {number} maxLength - Maksimum uzunluk
   * @returns {string} - Kısaltılmış metin
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Dosya boyutunu formatlar
   * @param {number} bytes - Bayt cinsinden boyut
   * @returns {string} - Formatlanmış boyut (1.5 KB, 2.3 MB gibi)
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bayt';
    
    const k = 1024;
    const sizes = ['Bayt', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };