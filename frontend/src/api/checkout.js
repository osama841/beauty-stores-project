    // src/api/checkout.js
    import axiosInstance from './axiosInstance';

    export const placeOrder = async (orderData) => {
      // orderData يجب أن تحتوي على:
      // {
      //   shipping_address: { address_line1, address_line2, city, state, postal_code, country, phone_number, address_type, is_default },
      //   payment: { method, card_number, expiry_date, cvv, status, amount, currency, transaction_id, payment_date, gateway_response, card_number_last_four },
      //   notes: '...'
      // }
      try {
        const response = await axiosInstance.post('/orders', orderData); // إرسال الطلب إلى OrderController@store
        return response.data; // يُرجع الطلب الذي تم إنشاؤه
      } catch (error) {
        console.error('Error placing order:', error);
        throw error.response?.data || error.message;
      }
    };
    