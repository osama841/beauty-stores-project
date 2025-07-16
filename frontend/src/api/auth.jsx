    // src/api/auth.js
    import axiosInstance from './axiosInstance';

    export const loginUser = async (credentials) => {
      try {
        const response = await axiosInstance.post('/login', credentials);
        if (response.data.access_token) {
          localStorage.setItem('authToken', response.data.access_token);
        }
        return response.data;
      } catch (error) {
        console.error("Login API error:", error.response?.data || error.message);
        throw error.response?.data || error.message;
      }
    };

    export const registerUser = async (userData) => {
      try {
        const response = await axiosInstance.post('/register', userData);
        if (response.data.access_token) {
          localStorage.setItem('authToken', response.data.access_token);
        }
        return response.data;
      } catch (error) {
        console.error("Register API error:", error.response?.data || error.message);
        throw error.response?.data || error.message;
      }
    };

    export const logoutUser = async () => {
      try {
        await axiosInstance.post('/logout');
        localStorage.removeItem('authToken');
        return true;
      } catch (error) {
        console.error("Logout API error:", error.response?.data || error.message);
        localStorage.removeItem('authToken');
        return false;
      }
    };

    export const getAuthenticatedUser = async () => {
      try {
        const response = await axiosInstance.get('/user');
        return response.data.user;
      } catch (error) {
        console.error("Get authenticated user API error:", error.response?.data || error.message);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
        }
        throw error.response?.data || error.message;
      }
    };
    