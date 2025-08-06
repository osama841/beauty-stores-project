// src/api/products.js
import axiosInstance from './axiosInstance';

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
        'Content-Type': 'multipart/form-form-data',
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

// ****** دالة جديدة لجلب التوصيات ******
export const getRecommendedProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/recommendations');
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error.response?.data || error.message;
  }
};

// Helper function for FormData (should be defined outside)
const createProductFormData = (productData, mainImageFile, mainImageRemoved, additionalImageFiles, removedAdditionalImageIds) => {
  const formData = new FormData();
  for (const key in productData) {
    if (key === '_method') continue;
    if (productData[key] === null || productData[key] === undefined) {
      formData.append(key, '');
    } else if (typeof productData[key] === 'boolean') {
      formData.append(key, productData[key] ? '1' : '0');
    } else {
      formData.append(key, productData[key]);
    }
  }

  if (mainImageFile) {
    formData.append('main_image', mainImageFile);
  } else if (mainImageRemoved) {
    formData.append('main_image_removed', '1');
  }

  if (additionalImageFiles && additionalImageFiles.length > 0) {
    additionalImageFiles.forEach((file, index) => {
      formData.append(`additional_images[${index}]`, file);
    });
  }

  if (removedAdditionalImageIds && removedAdditionalImageIds.length > 0) {
    removedAdditionalImageIds.forEach((id, index) => {
      formData.append(`removed_additional_image_ids[${index}]`, id);
    });
  }

  if (productData._method) {
    formData.append('_method', productData._method);
  }

  return formData;
};
