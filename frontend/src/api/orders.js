// src/api/orders.js
import axiosInstance from './axiosInstance'; // استيراد مثيل Axios المجهز

export const getOrders = async (params = {}) => {
  // `params` هو كائن يحتوي على معلمات الاستعلام مثل التصفية وتقسيم الصفحات
  // مثال: { page: 1, status: 'pending' }
  try {
    // إرسال طلب GET إلى '/orders' (الذي يصبح http://localhost:8000/api/orders)
    const response = await axiosInstance.get('/orders', { params });
    // Laravel paginate يُرجع البيانات الفعلية للطلبات داخل خاصية `data` من الاستجابة.
    return response.data; // نُرجع كائن التقسيم بالكامل
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error.response?.data || error.message;
  }
};

export const getOrderById = async (id) => {
  // `id` هو معرف الطلب الذي نريد جلب تفاصيله
  try {
    // إرسال طلب GET إلى '/orders/{id}'
    const response = await axiosInstance.get(`/orders/${id}`);
    // نفترض أن Laravel يُرجع كائن الطلب مع جميع تفاصيله وعلاقاته
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatus = async (id, status) => {
  // `id` هو معرف الطلب، و `status` هي الحالة الجديدة (مثلاً 'shipped')
  try {
    // إرسال طلب PATCH لتحديث حالة الطلب
    const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
    // نفترض أن Laravel يُرجع الطلب المحدّث
    return response.data;
  } catch (error) {
    console.error(`Error updating order status for ID ${id}:`, error);
    throw error.response?.data || error.message;
  }
};
