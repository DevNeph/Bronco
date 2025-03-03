import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  CreditCardIcon, 
  GiftIcon, 
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  EditIcon,
  AlertCircleIcon
} from 'lucide-react';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import Table from '../ui/Table';
import Modal from '../ui/Modal';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const userData = await userService.getUserById(id);
      setUser(userData.data);
      
      // Load user's orders
      const ordersData = await orderService.getUserOrders(id);
      setOrders(ordersData.data.orders);
    } catch (err) {
      setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(id);
      navigate('/users');
    } catch (err) {
      setError('Kullanıcı silinirken bir hata oluştu.');
      console.error('Error deleting user:', err);
    }
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

  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Kullanıcı bulunamadı.</p>
          </div>
        </div>
      </div>
    );
  }

  const orderColumns = [
    {
      header: 'Sipariş No',
      accessor: 'id',
      cell: (row) => row.id.substring(0, 8),
    },
    {
      header: 'Tarih',
      accessor: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString('tr-TR'),
    },
    {
      header: 'Tutar',
      accessor: 'totalAmount',
      cell: (row) => `${row.totalAmount.toFixed(2)} ₺`,
    },
    {
      header: 'Durum',
      accessor: 'status',
      cell: (row) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          accepted: 'bg-blue-100 text-blue-800',
          preparing: 'bg-purple-100 text-purple-800',
          ready: 'bg-green-100 text-green-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };

        const statusText = {
          pending: 'Beklemede',
          accepted: 'Kabul Edildi',
          preparing: 'Hazırlanıyor',
          ready: 'Hazır',
          completed: 'Tamamlandı',
          cancelled: 'İptal Edildi',
        };

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[row.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusText[row.status] || row.status}
          </span>
        );
      },
    },
    {
      header: 'İşlemler',
      accessor: 'actions',
      cell: (row) => (
        <Link
          to={`/orders/${row.id}`}
          className="text-indigo-600 hover:text-indigo-900 font-medium"
        >
          Detaylar
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Basic Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Kullanıcı Bilgileri
            </h3>
            <div className="flex space-x-2">
              <Link
                to={`/users/edit/${id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EditIcon className="h-4 w-4 mr-1" />
                Düzenle
              </Link>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                onClick={() => setShowDeleteModal(true)}
              >
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                Sil
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Ad Soyad
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.firstName} {user.lastName}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MailIcon className="h-4 w-4 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Telefon
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Kayıt Tarihi
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="text-xl font-semibold text-gray-900">
                {user.orders?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Bakiye</p>
              <p className="text-xl font-semibold text-gray-900">
                {user.balance?.toFixed(2) || '0.00'} ₺
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <GiftIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Bedava Kahve</p>
              <p className="text-xl font-semibold text-gray-900">
                {user.loyalty?.availableFreeCoffees || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Orders */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Siparişler
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <Table
            columns={orderColumns}
            data={orders}
            emptyMessage="Bu kullanıcının henüz siparişi bulunmamaktadır."
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Kullanıcıyı Sil"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowDeleteModal(false)}
          >
            İptal
          </button>
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={handleDeleteUser}
          >
            Sil
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetails;