// src/api/brands.js
import axiosInstance from './axiosInstance';

export const getBrands = async () => {
  try {
    const response = await axiosInstance.get('/brands');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error.response?.data || error.message;
  }
};

// دالة مساعدة لإنشاء FormData من بيانات العلامة التجارية والملف
const createBrandFormData = (data, logoFile, logoRemoved) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);
  formData.append('description', data.description || '');
  formData.append('status', data.status);

  if (logoFile) {
    formData.append('logo', logoFile); // إضافة ملف الشعار
  } else if (logoRemoved) {
    formData.append('logo_removed', '1'); // إشارة لإزالة الشعار الحالي
  }

  // إذا كانت العملية تحديث (PUT)، يجب إضافة _method=PUT
  if (data._method) {
    formData.append('_method', data._method);
  }

  return formData;
};

export const createBrand = async (brandData, logoFile) => {
  try {
    const formData = createBrandFormData(brandData, logoFile, false);
    const response = await axiosInstance.post('/brands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // مهم جداً لإرسال الملفات
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error.response?.data || error.message;
  }
};

export const updateBrand = async (id, brandData, logoFile, logoRemoved) => {
  try {
    const dataWithMethod = { ...brandData, _method: 'PUT' };
    const formData = createBrandFormData(dataWithMethod, logoFile, logoRemoved);

    const response = await axiosInstance.post(`/brands/${id}`, formData, { // نستخدم POST لكن نمرر _method=PUT
      headers: {
        'Content-Type': 'multipart/form-data', // مهم جداً لإرسال الملفات
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating brand with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await axiosInstance.delete(`/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting brand with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
