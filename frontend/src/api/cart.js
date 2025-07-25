// src/api/cart.js
import axiosInstance from './axiosInstance';

export const getCartItems = async () => {
  try {
    const response = await axiosInstance.get('/shopping-cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error.response?.data || error.message;
  }
};

export const addProductToCart = async (productId, quantity = 1) => { // ****** تأكد من أن هذا هو اسم الدالة ******
  try {
    const response = await axiosInstance.post('/shopping-cart', { product_id: productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding product to cart:', error);
    throw error.response?.data || error.message;
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    const response = await axiosInstance.put(`/shopping-cart/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error.response?.data || error.message;
  }
};

export const removeCartItem = async (cartItemId) => {
  try {
    const response = await axiosInstance.delete(`/shopping-cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing cart item ${cartItemId}:`, error);
    throw error.response?.data || error.message;
  }
};
