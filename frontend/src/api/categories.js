// src/api/categories.js
import axiosInstance from './axiosInstance';

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error.response?.data || error.message;
  }
};

// دالة مساعدة لإنشاء FormData من بيانات القسم والملف
const createCategoryFormData = (data, imageFile, imageRemoved) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);
  formData.append('description', data.description || '');
  formData.append('parent_id', data.parent_id || '');
  formData.append('status', data.status);

  if (imageFile) {
    formData.append('image', imageFile); // إضافة الملف
  } else if (imageRemoved) {
    formData.append('image_removed', '1'); // إشارة لإزالة الصورة الحالية
  }

  // إذا كانت العملية تحديث (PUT)، يجب إضافة _method=PUT
  // لأن FormData لا تدعم PUT/PATCH مباشرة مع الملفات
  if (data._method) {
    formData.append('_method', data._method);
  }

  return formData;
};


export const createCategory = async (categoryData, imageFile) => {
  try {
    const formData = createCategoryFormData(categoryData, imageFile, false);
    const response = await axiosInstance.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // مهم جداً لإرسال الملفات
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error.response?.data || error.message;
  }
};

export const updateCategory = async (id, categoryData, imageFile, imageRemoved) => {
  try {
    // إضافة _method=PUT لـ Laravel لمعالجة طلب PUT مع FormData
    const dataWithMethod = { ...categoryData, _method: 'PUT' };
    const formData = createCategoryFormData(dataWithMethod, imageFile, imageRemoved);

    const response = await axiosInstance.post(`/categories/${id}`, formData, { // نستخدم POST لكن نمرر _method=PUT
      headers: {
        'Content-Type': 'multipart/form-data', // مهم جداً لإرسال الملفات
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
