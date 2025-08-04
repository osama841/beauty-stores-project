// src/api/wishlist.js
import axiosInstance from './axiosInstance';

export const getWishlistItems = async () => {
  try {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error.response?.data || error.message;
  }
};

export const addProductToWishlist = async (productId) => {
  try {
    const response = await axiosInstance.post('/wishlist', { product_id: productId });
    return response.data;
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    throw error.response?.data || error.message;
  }
};

export const removeProductFromWishlist = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing product ${productId} from wishlist:`, error);
    throw error.response?.data || error.message;
  }
};
