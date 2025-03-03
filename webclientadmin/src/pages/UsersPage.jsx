import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Filter, RefreshCw } from 'lucide-react';
import userService from '../services/userService';
import { formatDate } from '../utils/dateUtils';

// UI bileşenleri
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import UserStatsCard from '../components/users/UserStatsCard';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Kullanıcıları yükle
  const loadUsers = async (page = 1, searchTerm = filters.search) => {
    setLoading(true);
    try {
      const data = await userService.getUsers({
        page,
        limit: 10,
        search: searchTerm,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      setUsers(data.users);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalCount
      });
    } catch (err) {
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadUsers();
  }, []);

  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1, filters.search);
  };

  // Sayfa değişikliği
  const handlePageChange = (page) => {
    loadUsers(page);
  };

  // Tablo sütunları
  const columns = [
    {
      header: 'Kullanıcı',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Telefon',
      accessor: 'phone',
    },
    {
      header: 'Yetkiler',
      accessor: 'isAdmin',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isAdmin ? 'Admin' : 'Kullanıcı'}
        </span>
      )
    },
    {
      header: 'Kayıt Tarihi',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt)
    },
    {
      header: 'İşlemler',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Link to={`/users/${row.id}`}>
            <Button variant="secondary" size="sm">Detay</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          Icon={UserPlus}
        >
          Yeni Admin Ekle
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="mb-6">
        <UserStatsCard />
      </div>

      {/* Filtreleme ve Arama */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <button type="submit" className="hidden">Ara</button>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => loadUsers(1)}
            Icon={RefreshCw}
          >
            Yenile
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            Icon={Filter}
          >
            Filtrele
          </Button>
        </div>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-brown-400 border-t-brown-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => loadUsers()} variant="primary">Tekrar Dene</Button>
            </div>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={users}
              emptyMessage="Kullanıcı bulunamadı."
            />
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.totalItems}
            />
          </>
        )}
      </div>

      {/* Yeni Admin Ekleme Modal */}
      {showCreateModal && (
        <Modal
          title="Yeni Admin Ekle"
          onClose={() => setShowCreateModal(false)}
        >
          {/* Burada CreateAdminForm bileşeni olacak */}
          <p>Form içeriği</p>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;