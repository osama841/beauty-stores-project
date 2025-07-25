// src/api/users.js
import axiosInstance from './axiosInstance';

export const getUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/users', { params });
    return response.data; // Laravel paginate object
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
