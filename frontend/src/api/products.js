// src/api/products.js
import axiosInstance from './axiosInstance';

// دالة مساعدة لإنشاء FormData من بيانات المنتج والملفات
const createProductFormData = (data, mainImageFile, mainImageRemoved, additionalImageFiles, removedAdditionalImageIds) => {
  const formData = new FormData();
  // إضافة الحقول النصية والرقمية
  for (const key in data) {
    if (key === '_method') continue; // _method سيضاف يدوياً
    if (data[key] === null || data[key] === undefined) {
      formData.append(key, ''); // تحويل null/undefined إلى سلسلة فارغة
    } else if (typeof data[key] === 'boolean') {
      formData.append(key, data[key] ? '1' : '0'); // تحويل boolean إلى 1 أو 0
    } else {
      formData.append(key, data[key]);
    }
  }

  // إضافة ملف الصورة الرئيسية
  if (mainImageFile) {
    formData.append('main_image', mainImageFile);
  } else if (mainImageRemoved) {
    formData.append('main_image_removed', '1'); // إشارة لإزالة الصورة الرئيسية الحالية
  }

  // إضافة ملفات الصور الإضافية
  if (additionalImageFiles && additionalImageFiles.length > 0) {
    additionalImageFiles.forEach((file, index) => {
      formData.append(`additional_images[${index}]`, file); // يجب أن يكون الاسم additional_images[]
    });
  }

  // إضافة معرفات الصور الإضافية التي سيتم حذفها
  if (removedAdditionalImageIds && removedAdditionalImageIds.length > 0) {
    removedAdditionalImageIds.forEach((id, index) => {
      formData.append(`removed_additional_image_ids[${index}]`, id);
    });
  }

  // إذا كانت العملية تحديث (PUT)، يجب إضافة _method=PUT
  if (data._method) {
    formData.append('_method', data._method);
  }

  return formData;
};

export const getProducts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data || error.message;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const createProduct = async (productData, mainImageFile, additionalImageFiles) => {
  try {
    const formData = createProductFormData(productData, mainImageFile, false, additionalImageFiles, []);
    const response = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error.response?.data || error.message;
  }
};

export const updateProduct = async (id, productData, mainImageFile, mainImageRemoved, additionalImageFiles, removedAdditionalImageIds) => {
  try {
    const dataWithMethod = { ...productData, _method: 'PUT' };
    const formData = createProductFormData(dataWithMethod, mainImageFile, mainImageRemoved, additionalImageFiles, removedAdditionalImageIds);

    const response = await axiosInstance.post(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
