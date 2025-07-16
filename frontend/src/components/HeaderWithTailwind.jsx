// src/components/HeaderWithTailwind.jsx
import React from 'react';
// لا تستورد react-router-dom أو AuthContext هنا الآن
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

const HeaderWithTailwind = () => {
  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-8 lg:px-12">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-800">
          <a href="#" className="text-blue-600 hover:text-blue-800 transition duration-300">متجر الجمال (مع Tailwind)</a>
        </div>
        <ul className="flex items-center space-x-6">
          <li>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-300">الرئيسية</a>
          </li>
          <li>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-semibold transition duration-300">المنتجات</a>
          </li>
          <li>
            <a href="#" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
              تسجيل الدخول
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderWithTailwind;
