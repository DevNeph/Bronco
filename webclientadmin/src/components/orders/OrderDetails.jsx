import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  CreditCardIcon, 
  ArrowLeftIcon,
  PrinterIcon
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderStatusChanger from './OrderStatusChanger';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (err) {
      setError('Sipariş detayları yüklenirken bir hata oluştu.');
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(id, newStatus);
      setOrder(response.data);
    } catch (err) {
      console.error('Error updating order status:', err);
      // Show error notification
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Beklemede'
      },
      accepted: {
        color: 'bg-blue-100 text-blue-800',
        text: 'Kabul Edildi'
      },
      preparing: {
        color: 'bg-purple-100 text-purple-800',
        text: 'Hazırlanıyor'
      },
      ready: {
        color: 'bg-green-100 text-green-800',
        text: 'Hazır'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        text: 'Tamamlandı'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800',
        text: 'İptal Edildi'
      }
    };

    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      text: status
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const printOrder = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Sipariş bulunamadı.</p>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethodText = {
    balance: 'Bakiye',
    cash: 'Nakit',
    card: 'Kart',
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-gray-200">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Sipariş #{order.id.substring(0, 8)}
          </h1>
          {getStatusBadge(order.status)}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={printOrder}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Yazdır
          </button>

          <OrderStatusChanger
            currentStatus={order.status}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Sipariş Tarihi</h3>
                <p className="text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')} {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {order.pickupTime && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Teslim Zamanı</h3>
                  <p className="text-sm text-gray-900">
                    {new Date(order.pickupTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500">Ödeme Yöntemi</h3>
                <p className="text-sm text-gray-900">
                  {paymentMethodText[order.paymentMethod] || order.paymentMethod}
                  {order.isFreeCoffee && ' (Bedava Kahve)'}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="flex items-start md:col-span-2">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Sipariş Notu</h3>
                  <p className="text-sm text-gray-900">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Öğeleri</h3>
            <div className="border-t border-b border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adet
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Birim Fiyat
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.OrderItems && order.OrderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.Product?.name || 'Ürün bulunamadı'}
                        </div>
                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.customization).map(([key, value], idx) => (
                              <span key={key}>
                                {key}: {value}
                                {idx < Object.entries(item.customization).length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.unitPrice.toFixed(2)} ₺
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {(item.unitPrice * item.quantity).toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      Toplam
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {order.totalAmount.toFixed(2)} ₺
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Müşteri Bilgileri</h2>
          
          {order.User ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {order.User.firstName} {order.User.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{order.User.email}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to={`/users/${order.User.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Müşteri Profilini Görüntüle
                </Link>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Müşteri Siparişleri</h3>
                <Link
                  to={`/orders?userId=${order.User.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Tüm Siparişleri Görüntüle
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Müşteri bilgisi bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Order Timeline/History - Could be implemented if you track status changes */}
    </div>
  );
};

export default OrderDetails;