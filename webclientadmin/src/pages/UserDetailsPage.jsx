import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';
import userService from '../services/userService';
import Button from '../components/ui/Button';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency, formatPhone } from '../utils/formatUtils';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
        console.error('Error loading user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  // Şifre sıfırlama
  const handleResetPassword = async () => {
    if (window.confirm('Kullanıcının şifresi sıfırlanacak. Devam etmek istiyor musunuz?')) {
      try {
        await userService.resetUserPassword(id);
        // Başarı mesajı göster
      } catch (err) {
        // Hata mesajı göster
        console.error('Error resetting password:', err);
      }
    }
  };

  // Bakiye ekleme
  const handleAddBalance = async (amount) => {
    try {
      await userService.addUserBalance(id, amount, 'Admin tarafından eklendi');
      // Kullanıcı bilgilerini yenile
      const data = await userService.getUserById(id);
      setUser(data);
      // Başarı mesajı göster
    } catch (err) {
      // Hata mesajı göster
      console.error('Error adding balance:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-brown-400 border-t-brown-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Kullanıcı bulunamadı.'}</p>
          <Button onClick={() => navigate('/users')} variant="primary">Kullanıcı Listesine Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        onClick={() => navigate('/users')}
        variant="link"
        className="mb-4"
        Icon={ArrowLeft}
      >
        Kullanıcı Listesine Dön
      </Button>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Kullanıcı Başlık */}
        <div className="bg-brown-700 text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white text-brown-700 flex items-center justify-center text-xl font-bold">
                {user.user.firstName.charAt(0)}{user.user.lastName.charAt(0)}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{`${user.user.firstName} ${user.user.lastName}`}</h1>
                <p className="text-brown-200">{user.user.email}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="secondary" onClick={handleResetPassword}>
                Şifreyi Sıfırla
              </Button>
              <Button 
                variant={user.user.isAdmin ? "danger" : "success"}
              >
                {user.user.isAdmin ? 'Admin Yetkisini Kaldır' : 'Admin Yap'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'profile'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profil Bilgileri
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'orders'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Siparişler
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'balance'
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('balance')}
            >
              Bakiye
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
          </nav>
        </div>

        {/* Sekme İçeriği */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Kullanıcı Bilgileri</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User size={20} />
                  <span className="font-medium">İsim:</span>
                  <span>{`${user.user.firstName} ${user.user.lastName}`}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={20} />
                  <span className="font-medium">E-posta:</span>
                  <span>{user.user.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={20} />
                  <span className="font-medium">Telefon:</span>
                  <span>{formatPhone(user.user.phone)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar size={20} />
                  <span className="font-medium">Kayıt Tarihi:</span>
                  <span>{formatDate(user.user.createdAt)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-lg font-medium mb-2">Kullanıcı Durumu</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.user.isAdmin ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-lg font-medium mb-2">Sipariş İstatistikleri</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Toplam Sipariş</div>
                      <div className="text-xl font-bold">
                        {Object.values(user.orders || {}).reduce((total, count) => total + count, 0) || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Aktif Sipariş</div>
                      <div className="text-xl font-bold">
                        {(user.orders?.pending || 0) + (user.orders?.accepted || 0) + (user.orders?.preparing || 0) + (user.orders?.ready || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Sipariş Geçmişi</h2>
                <Button variant="secondary" size="sm">Tüm Siparişler</Button>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <ShoppingBag size={40} className="mx-auto text-gray-400 mb-2" />
                <p>Kullanıcının sipariş geçmişi burada gösterilecek.</p>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Bakiye Bilgileri</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleAddBalance(50)}
                  >
                    Bakiye Yükle
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Mevcut Bakiye</p>
                      <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(user.balance || 0)}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CreditCard size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bakiye İşlemleri</h3>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <CreditCard size={40} className="mx-auto text-gray-400 mb-2" />
                  <p>Kullanıcının bakiye işlemleri burada gösterilecek.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Sadakat Programı</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Toplam Kahve</div>
                  <div className="text-2xl font-bold text-gray-900">{user.loyalty?.coffeeCount || 0}</div>
                </div>
                
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Kazanılan Bedava Kahveler</div>
                  <div className="text-2xl font-bold text-gray-900">{user.loyalty?.freeCoffees || 0}</div>
                </div>
                
                <div className="p-6 bg-white border rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Kullanılan Bedava Kahveler</div>
                  <div className="text-2xl font-bold text-gray-900">{user.loyalty?.usedCoffees || 0}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">İlerleme</h3>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  {user.loyalty?.coffeeCount ? (
                    <div 
                      className="h-full bg-brown-500" 
                      style={{ 
                        width: `${((user.loyalty.coffeeCount % 10) / 10) * 100}%` 
                      }}
                    ></div>
                  ) : (
                    <div className="h-full bg-gray-300 w-0"></div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 text-right">
                  {user.loyalty?.coffeeCount % 10} / 10 kahve
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;