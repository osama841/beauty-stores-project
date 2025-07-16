// frontend/src/components/auth/Register.jsx

import React, { useState } from 'react';
import AuthLayout from './AuthLayout'; // استيراد مكون التخطيط
import apiClient from '../../api/axiosConfig'; // استيراد مثيل Axios الذي تم تكوينه
import { Link, useNavigate } from 'react-router-dom'; // لإنشاء الروابط والتنقل

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_admin: false,
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/register', formData); // استخدام apiClient
      setSuccessMessage('Registration successful! You can now log in.');
      console.log('Registration successful:', response.data);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors = err.response.data.errors;
        let errorMessage = 'Validation Error:';
        for (const key in validationErrors) {
          errorMessage += `\n- ${validationErrors[key].join(', ')}`;
        }
        setError(errorMessage);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* حقول النموذج: Username, Email, Password, Confirm Password, First Name, Last Name, Phone Number */}
        {/* تم تضمين حقول الإدخال مع ربطها بحالة formData ودالة handleChange */}
        {/* زر التسجيل */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-6">
          <label htmlFor="password_confirmation" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password:</label>
          <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">First Name:</label>
          <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">Last Name:</label>
          <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-6">
          <label htmlFor="phone_number" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
          <input type="text" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      <p className="text-center text-gray-600 text-sm mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:text-blue-700 font-bold">
          Login here
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
