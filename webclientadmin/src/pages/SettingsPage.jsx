import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    loyaltyProgram: {
      coffeeThreshold: 10,
      enabled: true
    },
    storeHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '09:00', close: '21:00' }
    },
    appInfo: {
      name: 'Bronco Coffee',
      version: '1.0.0',
      contact: {
        phone: '',
        email: '',
        address: ''
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Ayarları yükle
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/settings');
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data.data
        }));
      } catch (err) {
        setError('Ayarlar yüklenirken bir hata oluştu.');
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLoyaltyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      loyaltyProgram: {
        ...prevSettings.loyaltyProgram,
        [name]: type === 'checkbox' ? checked : parseInt(value, 10)
      }
    }));
  };

  const handleStoreHoursChange = (day, field, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      storeHours: {
        ...prevSettings.storeHours,
        [day]: {
          ...prevSettings.storeHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAppInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prevSettings => ({
        ...prevSettings,
        appInfo: {
          ...prevSettings.appInfo,
          [parent]: {
            ...prevSettings.appInfo[parent],
            [child]: value
          }
        }
      }));
    } else {
      setSettings(prevSettings => ({
        ...prevSettings,
        appInfo: {
          ...prevSettings.appInfo,
          [name]: value
        }
      }));
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Sadakat programı ayarlarını kaydet
      await api.put('/admin/settings', {
        key: 'loyalty_program',
        value: settings.loyaltyProgram
      });
      
      // Çalışma saatleri ayarlarını kaydet
      await api.put('/admin/settings', {
        key: 'store_hours',
        value: settings.storeHours
      });
      
      // Uygulama bilgileri ayarlarını kaydet
      await api.put('/admin/settings', {
        key: 'app_info',
        value: settings.appInfo
      });
      
      // Başarı mesajı göster
      alert('Ayarlar başarıyla kaydedildi.');
    } catch (err) {
      setError('Ayarlar kaydedilirken bir hata oluştu.');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-brown-400 border-t-brown-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
        <Button 
          onClick={handleSaveSettings}
          variant="primary"
          disabled={saving}
          Icon={saving ? Loader : Save}
        >
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Sekmeler */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'general'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              Genel Ayarlar
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'loyalty'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('loyalty')}
            >
              Sadakat Programı
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'hours'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('hours')}
            >
              Çalışma Saatleri
            </button>
          </nav>
        </div>

        {/* Sekme İçeriği */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Uygulama Bilgileri</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Uygulama Adı
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={settings.appInfo.name}
                        onChange={handleAppInfoChange}
                        className="form-control"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                        Uygulama Sürümü
                      </label>
                      <input
                        type="text"
                        id="version"
                        name="version"
                        value={settings.appInfo.version}
                        onChange={handleAppInfoChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-2">İletişim Bilgileri</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="text"
                          id="contact.phone"
                          name="contact.phone"
                          value={settings.appInfo.contact.phone}
                          onChange={handleAppInfoChange}
                          className="form-control"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-posta
                        </label>
                        <input
                          type="email"
                          id="contact.email"
                          name="contact.email"
                          value={settings.appInfo.contact.email}
                          onChange={handleAppInfoChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="contact.address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adres
                      </label>
                      <textarea
                        id="contact.address"
                        name="contact.address"
                        rows="3"
                        value={settings.appInfo.contact.address}
                        onChange={handleAppInfoChange}
                        className="form-control"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sadakat Programı Ayarları</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    name="enabled"
                    checked={settings.loyaltyProgram.enabled}
                    onChange={handleLoyaltyChange}
                    className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                    Sadakat Programını Etkinleştir
                  </label>
                </div>
                
                <div>
                  <label htmlFor="coffeeThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedava Kahve için Gereken Kahve Sayısı
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm w-full md:w-1/3">
                    <input
                      type="number"
                      name="coffeeThreshold"
                      id="coffeeThreshold"
                      className="form-control"
                      value={settings.loyaltyProgram.coffeeThreshold}
                      onChange={handleLoyaltyChange}
                      min="1"
                      max="100"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Müşterilerin kaç kahve alması durumunda 1 bedava kahve kazanacağını belirleyin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Çalışma Saatleri</h2>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Gün
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Açılış
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Kapanış
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.entries(settings.storeHours).map(([day, hours]) => {
                      const dayNames = {
                        monday: 'Pazartesi',
                        tuesday: 'Salı',
                        wednesday: 'Çarşamba',
                        thursday: 'Perşembe',
                        friday: 'Cuma',
                        saturday: 'Cumartesi',
                        sunday: 'Pazar'
                      };
                      
                      return (
                        <tr key={day}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {dayNames[day]}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleStoreHoursChange(day, 'open', e.target.value)}
                              className="border-gray-300 rounded-md shadow-sm focus:border-brown-500 focus:ring-brown-500"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleStoreHoursChange(day, 'close', e.target.value)}
                              className="border-gray-300 rounded-md shadow-sm focus:border-brown-500 focus:ring-brown-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;