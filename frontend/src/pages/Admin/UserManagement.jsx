// src/pages/Admin/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة النموذج
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newStatus, setNewStatus] = useState('active');

  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  // -------------------------------------------------------------------
  // الدوال المساعدة ومنطق جلب البيانات
  // -------------------------------------------------------------------

  // جلب المستخدمين
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.data); // Laravel paginate object
    } catch (err) {
      console.error('فشل تحميل المستخدمين. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل المستخدمين.';
      if (err && typeof err === 'object') {
          if (err.message) {
              errorMessage = err.message;
          }
          if (err.errors) {
              errorMessage = Object.values(err.errors).flat().join(' ');
          } else if (err.error) {
              errorMessage = err.error;
          }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // -------------------------------------------------------------------
  // دوال معالجة النموذج (Add/Edit)
  // -------------------------------------------------------------------

  // دالة لإعادة تعيين النموذج بالكامل
  const resetForm = () => {
    setNewFirstName('');
    setNewLastName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewPhoneNumber('');
    setNewIsAdmin(false);
    setNewStatus('active');
    setEditingUser(null);
    setFormError(null);
    setValidationErrors({});
  };

  // دالة لفتح Modal للإضافة
  const handleAddUserClick = () => {
    resetForm();
    setShowModal(true);
  };

  // دالة لبدء تعديل مستخدم (تفتح Modal وتملأ البيانات)
  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewFirstName(user.first_name);
    setNewLastName(user.last_name);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewPassword(''); // لا تملأ كلمة المرور لأسباب أمنية
    setNewPhoneNumber(user.phone_number || '');
    setNewIsAdmin(user.is_admin);
    setNewStatus(user.status);
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  // دالة لإغلاق Modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // دالة لإرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const userData = {
      first_name: newFirstName,
      last_name: newLastName,
      username: newUsername,
      email: newEmail,
      phone_number: newPhoneNumber,
      is_admin: newIsAdmin,
      status: newStatus,
    };

    // أضف كلمة المرور فقط إذا كانت موجودة (لإنشاء مستخدم جديد أو تحديثها)
    if (newPassword) {
      userData.password = newPassword;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.user_id, userData);
        alert('تم تحديث المستخدم بنجاح!');
      } else {
        // كلمة المرور مطلوبة عند إنشاء مستخدم جديد
        if (!newPassword) {
          setFormError('كلمة المرور مطلوبة لإنشاء مستخدم جديد.');
          return;
        }
        await createUser(userData);
        alert('تم إضافة المستخدم بنجاح!');
      }
      handleCloseModal();
      fetchUsers(); // إعادة جلب المستخدمين لتحديث القائمة
    } catch (err) {
      console.error('خطأ في العملية:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع.');
      }
    }
  };

  // دالة لحذف مستخدم
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      try {
        await deleteUser(id);
        alert('تم حذف المستخدم بنجاح!');
        fetchUsers(); // إعادة جلب المستخدمين لتحديث القائمة
      } catch (err) {
        console.error('خطأ في حذف المستخدم:', err);
        alert('فشل حذف المستخدم: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  // -------------------------------------------------------------------
  // عرض حالة التحميل والخطأ
  // -------------------------------------------------------------------

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل المستخدمين...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // عرض المكون الرئيسي
  // -------------------------------------------------------------------

  return (
    <div className="container-fluid">
      <h1 className="mb-4 fw-bold text-primary">إدارة المستخدمين</h1>

      {/* زر إضافة مستخدم جديد (يفتح Modal) */}
      <button className="btn btn-primary mb-4" onClick={handleAddUserClick}>
        <i className="bi bi-plus-circle me-2"></i> إضافة مستخدم جديد
      </button>

      {/* قائمة المستخدمين الحالية */}
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          المستخدمون الحاليون
        </div>
        <div className="card-body p-0">
          {users.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد مستخدمون حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>معرف المستخدم</th>
                    <th>الاسم</th>
                    <th>اسم المستخدم</th>
                    <th>البريد الإلكتروني</th>
                    <th>رقم الهاتف</th>
                    <th>مسؤول؟</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.user_id}>
                      <td>{userItem.user_id}</td>
                      <td>{userItem.first_name} {userItem.last_name}</td>
                      <td>{userItem.username}</td>
                      <td>{userItem.email}</td>
                      <td>{userItem.phone_number || 'N/A'}</td>
                      <td>
                        {userItem.is_admin ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : (
                          <i className="bi bi-x-circle-fill text-danger"></i>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          userItem.status === 'active' ? 'bg-success' :
                          userItem.status === 'inactive' ? 'bg-secondary' :
                          'bg-danger'
                        }`}>
                          {userItem.status === 'active' ? 'نشط' :
                           userItem.status === 'inactive' ? 'غير نشط' : 'معلق'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEditClick(userItem)}>
                          <i className="bi bi-pencil-square"></i> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(userItem.user_id)}>
                          <i className="bi bi-trash"></i> حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal لإضافة/تعديل المستخدمين */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingUser ? 'تعديل مستخدم موجود' : 'إضافة مستخدم جديد'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">الاسم الأول:</label>
                    <input
                      type="text"
                      id="firstName"
                      className={`form-control ${validationErrors.first_name ? 'is-invalid' : ''}`}
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      required
                    />
                    {validationErrors.first_name && <div className="invalid-feedback">{validationErrors.first_name[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">اسم العائلة:</label>
                    <input
                      type="text"
                      id="lastName"
                      className={`form-control ${validationErrors.last_name ? 'is-invalid' : ''}`}
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      required
                    />
                    {validationErrors.last_name && <div className="invalid-feedback">{validationErrors.last_name[0]}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">اسم المستخدم:</label>
                  <input
                    type="text"
                    id="username"
                    className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                  {validationErrors.username && <div className="invalid-feedback">{validationErrors.username[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    id="email"
                    className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  {validationErrors.email && <div className="invalid-feedback">{validationErrors.email[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">كلمة المرور:</label>
                  <input
                    type="password"
                    id="password"
                    className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required={!editingUser} // مطلوبة فقط عند الإضافة
                    min="8"
                  />
                  {validationErrors.password && <div className="invalid-feedback">{validationErrors.password[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">رقم الهاتف (اختياري):</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    className={`form-control ${validationErrors.phone_number ? 'is-invalid' : ''}`}
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                  />
                  {validationErrors.phone_number && <div className="invalid-feedback">{validationErrors.phone_number[0]}</div>}
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isAdmin"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isAdmin">
                    هل هو مسؤول؟
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="userStatus" className="form-label">الحالة:</label>
                  <select
                    id="userStatus"
                    className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger">{formError}</div>}
                <button type="submit" className="btn btn-primary me-2">
                  {editingUser ? 'تحديث المستخدم' : 'إضافة المستخدم'}
                </button>
                {editingUser && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    إلغاء التعديل
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
