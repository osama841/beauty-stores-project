import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PermissionGuard from './PermissionGuard';

/**
 * مكون لأزرار الإجراءات التي تظهر بناءً على صلاحيات المستخدم
 * @param {Object} props - خصائص المكون
 * @param {string} props.resource - نوع المورد
 * @param {Object} props.resourceData - بيانات المورد
 * @param {Function} props.onEdit - دالة التعديل
 * @param {Function} props.onDelete - دالة الحذف
 * @param {Function} props.onView - دالة العرض
 * @param {boolean} props.showEdit - هل تظهر زر التعديل
 * @param {boolean} props.showDelete - هل تظهر زر الحذف
 * @param {boolean} props.showView - هل تظهر زر العرض
 * @param {string} props.editText - نص زر التعديل
 * @param {string} props.deleteText - نص زر الحذف
 * @param {string} props.viewText - نص زر العرض
 * @param {string} props.size - حجم الأزرار (sm, md, lg)
 */
const ActionButtons = ({
  resource,
  resourceData,
  onEdit,
  onDelete,
  onView,
  showEdit = true,
  showDelete = true,
  showView = false,
  editText = 'Edit',
  deleteText = 'Delete',
  viewText = 'View',
  size = 'sm'
}) => {
  const { user } = useAuth();

  const hasPermission = (action) => {
    if (!user || !resourceData) return false;
    
    // المشرفون لديهم جميع الصلاحيات
    if (user.is_admin) return true;

    switch (resource) {
      case 'user':
        return user.user_id === resourceData.user_id;
      case 'order':
        return user.user_id === resourceData.user_id;
      case 'review':
        return user.user_id === resourceData.user_id;
      case 'address':
        return user.user_id === resourceData.user_id;
      case 'payment':
        return user.user_id === resourceData.user_id;
      case 'shoppingCart':
        return user.user_id === resourceData.user_id;
      default:
        return false;
    }
  };

  return (
    <div className="btn-group" role="group">
      {showView && onView && (
        <button
          type="button"
          className={`btn btn-outline-primary btn-${size}`}
          onClick={onView}
        >
          {viewText}
        </button>
      )}
      
      {showEdit && onEdit && (
        <PermissionGuard
          resource={resource}
          action="edit"
          resourceData={resourceData}
          fallback={null}
        >
          <button
            type="button"
            className={`btn btn-outline-warning btn-${size}`}
            onClick={onEdit}
          >
            {editText}
          </button>
        </PermissionGuard>
      )}
      
      {showDelete && onDelete && (
        <PermissionGuard
          resource={resource}
          action="delete"
          resourceData={resourceData}
          fallback={null}
        >
          <button
            type="button"
            className={`btn btn-outline-danger btn-${size}`}
            onClick={onDelete}
          >
            {deleteText}
          </button>
        </PermissionGuard>
      )}
    </div>
  );
};

/**
 * مكون خاص لأزرار إدارة المراجعات
 * @param {Object} props - خصائص المكون
 * @param {Object} props.review - بيانات المراجعة
 * @param {Function} props.onEdit - دالة التعديل
 * @param {Function} props.onDelete - دالة الحذف
 * @param {Function} props.onApprove - دالة الموافقة (للمشرفين)
 */
export const ReviewActionButtons = ({ review, onEdit, onDelete, onApprove }) => {
  const { user } = useAuth();

  return (
    <div className="btn-group" role="group">
      <PermissionGuard
        resource="review"
        action="edit"
        resourceData={review}
        fallback={null}
      >
        <button
          type="button"
          className="btn btn-outline-warning btn-sm"
          onClick={onEdit}
        >
          Edit
        </button>
      </PermissionGuard>
      
      <PermissionGuard
        resource="review"
        action="delete"
        resourceData={review}
        fallback={null}
      >
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onDelete}
        >
          Delete
        </button>
      </PermissionGuard>
      
      {user?.is_admin && onApprove && !review.is_approved && (
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={onApprove}
        >
          Approve
        </button>
      )}
    </div>
  );
};

/**
 * مكون خاص لأزرار إدارة الطلبات
 * @param {Object} props - خصائص المكون
 * @param {Object} props.order - بيانات الطلب
 * @param {Function} props.onView - دالة العرض
 * @param {Function} props.onCancel - دالة الإلغاء
 * @param {Function} props.onUpdateStatus - دالة تحديث الحالة (للمشرفين)
 */
export const OrderActionButtons = ({ order, onView, onCancel, onUpdateStatus }) => {
  const { user } = useAuth();

  return (
    <div className="btn-group" role="group">
      <PermissionGuard
        resource="order"
        action="view"
        resourceData={order}
        fallback={null}
      >
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onView}
        >
          View
        </button>
      </PermissionGuard>
      
      <PermissionGuard
        resource="order"
        action="edit"
        resourceData={order}
        fallback={null}
      >
        {order.status === 'pending' && onCancel && (
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </PermissionGuard>
      
      {user?.is_admin && onUpdateStatus && (
        <button
          type="button"
          className="btn btn-outline-info btn-sm"
          onClick={onUpdateStatus}
        >
          Update Status
        </button>
      )}
    </div>
  );
};

export default ActionButtons; 