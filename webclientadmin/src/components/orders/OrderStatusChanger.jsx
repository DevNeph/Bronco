import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

const OrderStatusChanger = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Beklemede', color: 'bg-yellow-500' },
    { value: 'accepted', label: 'Kabul Edildi', color: 'bg-blue-500' },
    { value: 'preparing', label: 'Hazırlanıyor', color: 'bg-purple-500' },
    { value: 'ready', label: 'Hazır', color: 'bg-green-500' },
    { value: 'completed', label: 'Tamamlandı', color: 'bg-green-500' },
    { value: 'cancelled', label: 'İptal Edildi', color: 'bg-red-500' },
  ];

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  const handleStatusClick = (status) => {
    if (status !== currentStatus) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          <span className={`h-2 w-2 rounded-full ${currentStatusOption.color} mr-2`}></span>
          {currentStatusOption.label}
        </span>
        <ChevronDownIcon className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  option.value === currentStatus
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                role="menuitem"
                onClick={() => handleStatusClick(option.value)}
              >
                <div className="flex items-center">
                  <span className={`h-2 w-2 rounded-full ${option.color} mr-2`}></span>
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusChanger;