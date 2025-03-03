import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

const OrderStatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusText = {
    pending: 'Beklemede',
    accepted: 'Kabul Edildi',
    preparing: 'Hazırlanıyor',
    ready: 'Hazır',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
      {statusText[status] || status}
    </span>
  );
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Sipariş detayları yüklenirken bir hata oluştu: ' + err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Sipariş durumunu "${newStatus}" olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
      setOrder(updatedOrder);
    } catch (err) {
      setError('Sipariş durumu güncellenirken bir hata oluştu: ' + err.toString());
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Sipariş bulunamadı</h2>
        <p className="mt-2 text-gray-600">İstediğiniz sipariş detaylarına ulaşılamadı.</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brown-600 hover:bg-brown-700"
        >
          Siparişlere Dön
        </button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sipariş Detayı <span className="text-gray-500">#{order.id.substring(0, 8)}</span>
          </h1>
          <p className="text-sm text-gray-500">
            Oluşturma: {formatDate(order.createdAt)}
          </p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-brown-600 hover:text-brown-800"
        >
          Siparişlere Dön
        </button>
      </div>

      {/* Status Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-sm text-gray-500 mb-1">Sipariş Durumu</div>
            <div className="text-lg font-medium flex items-center">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          
          {/* Actions for Order Status Change */}
          <div className="flex flex-wrap gap-2">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('accepted')}
                  disabled={updatingStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Kabul Et
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updatingStatus}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  İptal Et
                </button>
              </>
            )}
            
            {order.status === 'accepted' && (
              <button
                onClick={() => handleStatusChange('preparing')}
                disabled={updatingStatus}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Hazırlanıyor
              </button>
            )}
            
            {order.status === 'preparing' && (
              <button
                onClick={() => handleStatusChange('ready')}
                disabled={updatingStatus}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Hazır
              </button>
            )}
            
            {order.status === 'ready' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={updatingStatus}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Tamamlandı
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sipariş Ürünleri</h2>
            </div>
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adet
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birim Fiyat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.OrderItems && order.OrderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={item.Product?.imageUrl || `https://via.placeholder.com/40?text=${item.Product?.name?.charAt(0) || 'P'}`} 
                                alt={item.Product?.name || 'Ürün'} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.Product?.name || 'Ürün'}
                              </div>
                              {Object.keys(item.customization || {}).length > 0 && (
                                <div className="text-sm text-gray-500">
                                  {Object.entries(item.customization).map(([key, value]) => (
                                    `${key}: ${value}`
                                  )).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseFloat(item.unitPrice).toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(item.quantity * parseFloat(item.unitPrice)).toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-right font-bold">
                        Toplam:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                        {parseFloat(order.totalAmount).toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Sipariş Notları</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Details and Order Info */}
        <div>
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Müşteri Bilgileri</h2>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Ad Soyad</div>
                <div className="text-sm text-gray-900">
                  {order.User?.firstName} {order.User?.lastName}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">E-posta</div>
                <div className="text-sm text-gray-900">{order.User?.email || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Telefon</div>
                <div className="text-sm text-gray-900">{order.User?.phone || '-'}</div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/users/${order.userId}`)}
                  className="text-sm text-brown-600 hover:text-brown-800"
                >
                  Müşteri Detayları
                </button>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sipariş Bilgisi</h2>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Sipariş ID</div>
                <div className="text-sm text-gray-900">{order.id}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Oluşturma Tarihi</div>
                <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Teslimat Zamanı</div>
                <div className="text-sm text-gray-900">{formatDate(order.pickupTime) || 'Hemen'}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Ödeme Yöntemi</div>
                <div className="text-sm text-gray-900">
                  {order.paymentMethod === 'balance' ? 'Bakiye' : 
                   order.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Bedava Kahve Kullanımı</div>
                <div className="text-sm text-gray-900">
                  {order.isFreeCoffee ? 'Evet' : 'Hayır'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;