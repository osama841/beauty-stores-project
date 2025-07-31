// src/api/pages.js
import axiosInstance from './axiosInstance';

export const getPages = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/pages', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error.response?.data || error.message;
  }
};

export const getPageBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/pages/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createPage = async (pageData) => {
  try {
    const response = await axiosInstance.post('/pages', pageData);
    return response.data;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error.response?.data || error.message;
  }
};

export const updatePage = async (id, pageData) => {
  try {
    const response = await axiosInstance.put(`/pages/${id}`, pageData);
    return response.data;
  } catch (error) {
    console.error(`Error updating page with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deletePage = async (id) => {
  try {
    const response = await axiosInstance.delete(`/pages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting page with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
