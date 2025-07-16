    // src/api/brands.js
    import axiosInstance from './axiosInstance';

    export const getBrands = async () => {
      try {
        const response = await axiosInstance.get('/brands');
        return response.data; // نفترض أن Laravel يعيد array of brands
      } catch (error) {
        console.error('Error fetching brands:', error);
        throw error.response?.data || error.message;
      }
    };
        