// frontend/src/api/addresses.js
import axiosInstance from './axiosInstance'; // تأكد من استيراد مثيل Axios المجهز

export const getAddresses = async (params = {}) => {
  // لجلب جميع العناوين للمستخدم المصادق عليه (أو جميعها للمسؤول)
  try {
    const response = await axiosInstance.get('/addresses', { params });
    // نفترض أن API يرجع مصفوفة من كائنات العناوين
    return response.data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error.response?.data || error.message;
  }
};

export const getAddressById = async (id) => {
  // لجلب تفاصيل عنوان معين
  try {
    const response = await axiosInstance.get(`/addresses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching address with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createAddress = async (addressData) => {
  // لإنشاء عنوان جديد
  try {
    const response = await axiosInstance.post('/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error.response?.data || error.message;
  }
};

export const updateAddress = async (id, addressData) => {
  // لتحديث عنوان موجود
  try {
    const response = await axiosInstance.put(`/addresses/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Error updating address with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteAddress = async (id) => {
  // لحذف عنوان
  try {
    const response = await axiosInstance.delete(`/addresses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting address with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};