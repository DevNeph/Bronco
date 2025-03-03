import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-brown-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 mt-2">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
        
        <Link 
          to="/dashboard"
          className="inline-flex items-center justify-center px-5 py-3 mt-8 text-base font-medium text-white bg-brown-600 border border-transparent rounded-md shadow-sm hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
        >
          <Home className="w-5 h-5 mr-2" />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;