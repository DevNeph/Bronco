import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlama isteği gönderilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brown-800">BRONCO</h1>
        <p className="text-gray-500 mt-2">Şifre Sıfırlama</p>
      </div>
      
      {success ? (
        <div className="text-center">
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.
          </div>
          <Link
            to="/login"
            className="inline-block py-2 px-4 bg-brown-700 text-white rounded-md hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
          >
            Giriş Sayfasına Dön
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            E-posta adresinizi girin ve şifrenizi sıfırlamak için bir bağlantı alın.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                placeholder="ornek@bronco.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 bg-brown-700 text-white rounded-md hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'İşleniyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-brown-600 hover:text-brown-800">
                Giriş Sayfasına Dön
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;