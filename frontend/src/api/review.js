// src/api/reviews.js
import axiosInstance from './axiosInstance';

export const getReviewsByProductId = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}/reviews`);
    return response.data; // نفترض أن Laravel يُرجع array of reviews
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error.response?.data || error.message;
  }
};

export const addReview = async (reviewData) => {
  try {
    // reviewData يجب أن تحتوي على product_id, rating, title, comment
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error.response?.data || error.message;
  }
};

// دوال إدارة المراجعات للمسؤول (ستُستخدم لاحقاً)
export const approveReview = async (reviewId) => {
  try {
    const response = await axiosInstance.patch(`/reviews/${reviewId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving review ${reviewId}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error.response?.data || error.message;
  }
};
