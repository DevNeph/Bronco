import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, SearchIcon, FilterIcon, RefreshCwIcon } from 'lucide-react';
import { userService } from '../../services/userService';
import Pagination from '../ui/Pagination';
import Table from '../ui/Table';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, admin, customer

  useEffect(() => {
    loadUsers();
  }, [currentPage, filter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      };

      // Add filter if not 'all'
      if (filter === 'admin') {
        params.isAdmin = true;
      } else if (filter === 'customer') {
        params.isAdmin = false;
      }

      const response = await userService.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadUsers();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const columns = [
    {
      header: 'Ad Soyad',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Telefon',
      accessor: 'phone',
    },
    {
      header: 'Kayıt Tarihi',
      accessor: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString('tr-TR'),
    },
    {
      header: 'Rol',
      accessor: 'isAdmin',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isAdmin
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.isAdmin ? 'Admin' : 'Müşteri'}
        </span>
      ),
    },
    {
      header: 'İşlemler',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/users/${row.id}`}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Detaylar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
            Kullanıcılar
          </h2>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">Tüm Kullanıcılar</option>
                <option value="admin">Adminler</option>
                <option value="customer">Müşteriler</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => loadUsers()}
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
              data={users}
              emptyMessage="Kullanıcı bulunamadı."
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

export default UserList;