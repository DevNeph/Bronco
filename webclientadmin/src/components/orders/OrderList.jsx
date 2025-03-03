import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, SearchIcon, FilterIcon, RefreshCwIcon, ChevronDownIcon } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Pagination from '../ui/Pagination';
import Table from '../ui/Table';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, dateFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10
      };

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Add date filter
      if (dateFilter === 'today') {
        const today = new Date();
        params.startDate = today.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.startDate = monthAgo.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      }

      const response = await orderService.getOrders(params);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Siparişler yüklenirken bir hata oluştu.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadOrders();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const columns = [
    {
      header: 'Sipariş No',
      accessor: 'id',
      cell: (row) => row.id.substring(0, 8),
    },
    {
      header: 'Müşteri',
      accessor: 'user',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.User?.firstName} {row.User?.lastName}
          </div>
          <div className="text-gray-500 text-sm">{row.User?.email}</div>
        </div>
      ),
    },
    {
      header: 'Tarih',
      accessor: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString('tr-TR') + ' ' + new Date(row.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      header: 'Tutar',
      accessor: 'totalAmount',
      cell: (row) => `${row.totalAmount.toFixed(2)} ₺`,
    },
    {
      header: 'Ödeme',
      accessor: 'paymentMethod',
      cell: (row) => {
        const methods = {
          balance: 'Bakiye',
          cash: 'Nakit',
          card: 'Kart'
        };
        return methods[row.paymentMethod] || row.paymentMethod;
      },
    },
    {
      header: 'Durum',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'İşlemler',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/orders/${row.id}`}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Detaylar
          </Link>
          <button
            className="text-indigo-600 hover:text-indigo-900 font-medium focus:outline-none"
            onClick={() => {
              // Open dropdown or action menu
            }}
          >
            <ChevronDownIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
            Siparişler
          </h2>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Sipariş No veya Müşteri Adı"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="accepted">Kabul Edildi</option>
                <option value="preparing">Hazırlanıyor</option>
                <option value="ready">Hazır</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={dateFilter}
                onChange={handleDateFilterChange}
              >
                <option value="all">Tüm Tarihler</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => loadOrders()}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Yenile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loader">Loading...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={orders}
              emptyMessage="Sipariş bulunamadı."
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;