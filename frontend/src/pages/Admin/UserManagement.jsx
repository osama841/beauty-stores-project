// src/pages/Admin/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import '../../styles/admin/UserManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.data);
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

  const handleAddUserClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setNewFirstName(user.first_name);
    setNewLastName(user.last_name);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewPassword('');
    setNewPhoneNumber(user.phone_number || '');
    setNewIsAdmin(user.is_admin);
    setNewStatus(user.status);
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

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

    if (newPassword) {
      userData.password = newPassword;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.user_id, userData);
        alert('تم تحديث المستخدم بنجاح!');
      } else {
        if (!newPassword) {
          setFormError('كلمة المرور مطلوبة لإنشاء مستخدم جديد.');
          return;
        }
        await createUser(userData);
        alert('تم إضافة المستخدم بنجاح!');
      }
      handleCloseModal();
      fetchUsers();
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

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      try {
        await deleteUser(id);
        alert('تم حذف المستخدم بنجاح!');
        fetchUsers();
      } catch (err) {
        console.error('خطأ في حذف المستخدم:', err);
        alert('فشل حذف المستخدم: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

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

  return (
    <div className="container-fluid px-2 py-4">
      <h1 className="mb-4 fw-bold text-primary text-center text-md-start">إدارة المستخدمين</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddUserClick}>
          <FaPlusCircle className="me-2" /> إضافة مستخدم جديد
        </button>
      </div>

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white fw-bold py-3 text-center">
          المستخدمون الحاليون
        </div>
        <div className="card-body p-0">
          {users.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد مستخدمون حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
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
                           <td><h6 className="mb-0 fw-bold">{userItem.first_name} {userItem.last_name}</h6></td>
                          <td><span className="text-muted small">{userItem.username}</span></td>
                          <td><span className="text-muted small">{userItem.email}</span></td>
                          <td><span className="text-muted small">{userItem.phone_number || 'N/A'}</span></td>
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
                             <button className="btn btn-sm btn-success text-white me-2 shadow-sm" onClick={() => handleEditClick(userItem)}>
                              <FaPencilAlt /> تعديل
                            </button>
                             <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(userItem.user_id)}>
                              <FaTrashAlt /> حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* عرض القائمة للشاشات الصغيرة */}
              <div className="d-lg-none p-3">
                {users.map((userItem) => (
                  <div key={userItem.user_id} className="card mb-3 shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle fs-3 me-3 text-secondary"></i>
                        <div className="flex-grow-1">
                          <h6 className="card-title fw-bold mb-1">{userItem.first_name} {userItem.last_name}</h6>
                          <p className="card-text text-muted small mb-0">{userItem.username}</p>
                        </div>
                        <span className={`badge ms-2 ${
                          userItem.status === 'active' ? 'bg-success' :
                          userItem.status === 'inactive' ? 'bg-secondary' :
                          'bg-danger'
                        }`} style={{ backgroundColor: userItem.status === 'active' ? '#60c78c' : userItem.status === 'inactive' ? '#6c757d' : '#e74c3c' }}>
                          {userItem.status === 'active' ? 'نشط' :
                          userItem.status === 'inactive' ? 'غير نشط' : 'معلق'}
                        </span>
                      </div>
                      <ul className="list-group list-group-flush mb-3">
                        <li className="list-group-item d-flex justify-content-between align-items-center p-0 pt-2 bg-transparent border-top-0" style={{ backgroundColor: 'transparent' }}>
                          <small className="text-muted">البريد الإلكتروني:</small>
                          <small className="fw-bold" style={{ color: '#343a40' }}>{userItem.email}</small>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center p-0 pt-2 bg-transparent" style={{ backgroundColor: 'transparent' }}>
                          <small className="text-muted">رقم الهاتف:</small>
                          <small className="fw-bold" style={{ color: '#343a40' }}>{userItem.phone_number || 'N/A'}</small>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center p-0 pt-2 bg-transparent" style={{ backgroundColor: 'transparent' }}>
                          <small className="text-muted">مسؤول:</small>
                          {userItem.is_admin ? (
                            <i className="bi bi-check-circle-fill text-success" style={{ color: '#60c78c' }}></i>
                          ) : (
                            <i className="bi bi-x-circle-fill text-danger" style={{ color: '#e74c3c' }}></i>
                          )}
                        </li>
                      </ul>
                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-info text-white shadow-sm"
                          onClick={() => handleEditClick(userItem)}
                          
                        >
                          <FaPencilAlt /> تعديل
                        </button>
                        <button
                          className="btn btn-sm btn-danger shadow-sm"
                          onClick={() => handleDelete(userItem.user_id)}
                          
                        >
                          <FaTrashAlt /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal لإضافة/تعديل المستخدمين */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        {showModal && <div className="modal-backdrop-custom" />}
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label small text-muted">الاسم الأول:</label>
                  <input
                    type="text"
                    id="firstName"
                    className={`form-control form-control-sm ${validationErrors.first_name ? 'is-invalid' : ''}`}
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    required
                  />
                  {validationErrors.first_name && <div className="invalid-feedback">{validationErrors.first_name[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label small text-muted">اسم العائلة:</label>
                  <input
                    type="text"
                    id="lastName"
                    className={`form-control form-control-sm ${validationErrors.last_name ? 'is-invalid' : ''}`}
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    required
                  />
                  {validationErrors.last_name && <div className="invalid-feedback">{validationErrors.last_name[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label small text-muted">اسم المستخدم:</label>
                  <input
                    type="text"
                    id="username"
                    className={`form-control form-control-sm ${validationErrors.username ? 'is-invalid' : ''}`}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                  {validationErrors.username && <div className="invalid-feedback">{validationErrors.username[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label small text-muted">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    id="email"
                    className={`form-control form-control-sm ${validationErrors.email ? 'is-invalid' : ''}`}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  {validationErrors.email && <div className="invalid-feedback">{validationErrors.email[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label small text-muted">كلمة المرور:</label>
                  <input
                    type="password"
                    id="password"
                    className={`form-control form-control-sm ${validationErrors.password ? 'is-invalid' : ''}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required={!editingUser}
                    min="8"
                  />
                  {validationErrors.password && <div className="invalid-feedback">{validationErrors.password[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label small text-muted">رقم الهاتف:</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    className={`form-control form-control-sm ${validationErrors.phone_number ? 'is-invalid' : ''}`}
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
                  <label className="form-check-label small text-muted" htmlFor="isAdmin">
                    هل هو مسؤول؟
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="userStatus" className="form-label small text-muted">الحالة:</label>
                  <select
                    id="userStatus"
                    className={`form-select form-select-sm ${validationErrors.status ? 'is-invalid' : ''}`}
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

                {formError && <div className="alert alert-danger small">{formError}</div>}
                
                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-primary btn-sm shadow-sm">
                    {editingUser ? 'تحديث' : 'إضافة'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm shadow-sm" onClick={handleCloseModal}>
                    إغلاق
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;