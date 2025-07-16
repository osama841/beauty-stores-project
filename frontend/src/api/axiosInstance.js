    // src/api/axiosInstance.js
    import axios from 'axios';

    const axiosInstance = axios.create({
      baseURL: 'http://localhost:8000/api', // ****** هام: تأكد من أن هذا هو رابط API Laravel الخاص بك ******
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    export default axiosInstance;
    