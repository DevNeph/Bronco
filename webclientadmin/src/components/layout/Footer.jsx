import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center text-sm text-gray-500">
        <div>
          © {currentYear} Bronco Coffee Shop. Tüm Hakları Saklıdır.
        </div>
        <div>
          <span>Destek: </span>
          <a href="mailto:support@broncocoffee.com" className="text-brown-600 hover:text-brown-800">
            support@broncocoffee.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;