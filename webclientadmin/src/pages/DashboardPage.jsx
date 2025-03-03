import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dashboardService from '../services/dashboardService';

// Stat Card Component
const StatCard = ({ title, value, previousValue, icon, color }) => {
  const percentChange = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : 0;
  const isPositive = percentChange > 0;
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-t-4 border-${color}-500`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {previousValue !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-${isPositive ? 'green' : 'red'}-500 text-sm flex items-center`}>
                <svg 
                  className={`h-3 w-3 mr-1 ${!isPositive && 'transform rotate-180'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" 
                    clipRule="evenodd"
                  />
                </svg>
                {percentChange}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs önceki</span>
            </div>
          )}
        </div>
        
        <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu: ' + err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }

  // Format daily orders for chart
  const formatDailyOrders = () => {
    if (!stats?.dailyOrdersThisWeek) return [];
    
    return stats.dailyOrdersThisWeek.map(day => ({
      name: new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
      orders: parseInt(day.orderCount),
      amount: parseFloat(day.totalAmount)
    }));
  };

  // Format order status for pie chart
  const formatOrderStatus = () => {
    if (!stats?.ordersByStatus) return [];
    
    const statusTranslations = {
      'pending': 'Beklemede',
      'accepted': 'Kabul Edildi',
      'preparing': 'Hazırlanıyor',
      'ready': 'Hazır',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi'
    };
    
    return stats.ordersByStatus.map(status => ({
      name: statusTranslations[status.status] || status.status,
      value: parseInt(status.count)
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666'];

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel Özeti</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Günlük Gelir" 
          value={`${stats.revenue.today.toLocaleString('tr-TR')} ₺`}
          previousValue={stats.revenue.yesterday}
          icon={<svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
        <StatCard 
          title="Bugünkü Siparişler" 
          value={stats.orders.today}
          previousValue={stats.orders.yesterday}
          icon={<svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          color="blue"
        />
        <StatCard 
          title="Haftalık Gelir" 
          value={`${stats.revenue.thisWeek.toLocaleString('tr-TR')} ₺`}
          previousValue={stats.revenue.lastWeek}
          icon={<svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          color="purple"
        />
        <StatCard 
          title="Aktif Siparişler" 
          value={stats.orders.active}
          icon={<svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bu Haftanın Siparişleri</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatDailyOrders()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Sipariş Sayısı" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="amount" name="Ciro (₺)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumları</h2>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatOrderStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatOrderStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sipariş`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Orders and Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" 
                     onClick={() => navigate(`/orders/${order.id}`)}>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.User?.firstName} {order.User?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 text-right mt-1">
                        {order.totalAmount.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                Henüz sipariş bulunmuyor
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <button 
              onClick={() => navigate('/orders')}
              className="text-sm font-medium text-brown-600 hover:text-brown-800"
            >
              Tüm siparişleri gör
            </button>
          </div>
        </div>
        
        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Popüler Ürünler</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div key={product.productId} className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                     onClick={() => navigate(`/products/${product.productId}`)}>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={product.Product?.imageUrl || `https://via.placeholder.com/40?text=${product.Product?.name.charAt(0)}`} 
                          alt={product.Product?.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{product.Product?.name}</p>
                        <p className="text-sm text-gray-500">{product.Product?.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.totalQuantity} adet</p>
                      <p className="text-sm text-gray-500">{product.orderCount} sipariş</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                Henüz veri bulunmuyor
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <button 
              onClick={() => navigate('/products')}
              className="text-sm font-medium text-brown-600 hover:text-brown-800"
            >
              Tüm ürünleri gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;