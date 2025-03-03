import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Truck, Coffee } from 'lucide-react';

// Sipariş durumuna göre ikon ve renk belirleme
const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return { icon: <CheckCircle size={18} />, color: 'text-green-500' };
    case 'cancelled':
      return { icon: <XCircle size={18} />, color: 'text-red-500' };
    case 'pending':
      return { icon: <Clock size={18} />, color: 'text-yellow-500' };
    case 'accepted':
    case 'preparing':
      return { icon: <Coffee size={18} />, color: 'text-blue-500' };
    case 'ready':
      return { icon: <Truck size={18} />, color: 'text-purple-500' };
    default:
      return { icon: <Clock size={18} />, color: 'text-gray-500' };
  }
};

// Sipariş durumunu Türkçe olarak gösterme
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Bekliyor',
    'accepted': 'Kabul Edildi',
    'preparing': 'Hazırlanıyor',
    'ready': 'Hazır',
    'completed': 'Tamamlandı',
    'cancelled': 'İptal Edildi'
  };
  
  return statusMap[status] || status;
};

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

const RecentOrdersList = ({ orders, title = "Son Siparişler" }) => {
  // Veri yoksa boş bir dizi kullan
  const orderList = orders || [];
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        
        <Link to="/orders" className="text-sm text-brown-600 hover:text-brown-800">
          Tümünü Gör →
        </Link>
      </div>
      
      {orderList.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderList.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-gray-800">Sipariş #{order.id.substring(0, 8)}</span>
                      <span className="ml-2 text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {order.User ? (
                        <span>{order.User.firstName} {order.User.lastName}</span>
                      ) : (
                        <span>Kullanıcı bilgisi yok</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`flex items-center ${getStatusIcon(order.status).color}`}>
                      {getStatusIcon(order.status).icon}
                      <span className="ml-1 text-sm">{getStatusText(order.status)}</span>
                    </div>
                    <span className="ml-4 font-medium">{order.totalAmount.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;