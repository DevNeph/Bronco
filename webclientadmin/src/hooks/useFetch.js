import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * API istekleri için genel bir hook
 * @param {string} url - API endpoint'i
 * @param {Object} options - Fetch opsiyonları
 * @returns {Object} - { data, loading, error, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // İsteği yeniden çağırabilmek için state
  const [shouldRefetch, setShouldRefetch] = useState(0);
  
  // İsteği yeniden çağır
  const refetch = useCallback(() => {
    setShouldRefetch(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.request({
          url,
          ...options
        });
        
        setData(response.data.data);
      } catch (err) {
        setError(err.message || 'Veri alınırken bir hata oluştu');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Eğer URL varsa API isteği yap
    if (url) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [url, shouldRefetch, options.method, options.data]);

  return { data, loading, error, refetch };
};

export default useFetch;