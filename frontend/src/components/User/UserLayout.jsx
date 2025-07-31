// src/components/User/UserLayout.jsx
import React from 'react';
import UserSidebar from './UserSidebar'; // استيراد الشريط الجانبي للمستخدم
import '../../styles/user/UserLayout.css'; // استيراد ملف CSS الخاص بالتخطيط

const UserLayout = ({ children }) => {
  return (
    <div className="container my-5">
      <div className="row">
        {/* الشريط الجانبي للمستخدم */}
        <div className="col-md-3 mb-4">
          <UserSidebar />
        </div>
        {/* المحتوى الرئيسي */}
        <div className="col-md-9">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;