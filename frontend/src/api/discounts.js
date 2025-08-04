// src/api/discounts.js
import axiosInstance from './axiosInstance';

export const getDiscounts = async () => {
  try {
    const response = await axiosInstance.get('/discounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error.response?.data || error.message;
  }
};

export const createDiscount = async (discountData) => {
  try {
    const response = await axiosInstance.post('/discounts', discountData);
    return response.data;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error.response?.data || error.message;
  }
};

export const updateDiscount = async (id, discountData) => {
  try {
    const response = await axiosInstance.put(`/discounts/${id}`, discountData);
    return response.data;
  } catch (error) {
    console.error(`Error updating discount with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteDiscount = async (id) => {
  try {
    const response = await axiosInstance.delete(`/discounts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting discount with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const applyDiscount = async (code, subtotal) => {
  try {
    const response = await axiosInstance.post('/discounts/apply', { code, subtotal });
    return response.data;
  } catch (error) {
    console.error('Error applying discount:', error);
    throw error.response?.data || error.message;
  }
};
