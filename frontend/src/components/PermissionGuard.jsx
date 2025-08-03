import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * مكون لحماية الواجهات بناءً على صلاحيات المستخدم
 * @param {Object} props - خصائص المكون
 * @param {boolean} props.requireAuth - هل يتطلب المصادقة
 * @param {boolean} props.requireAdmin - هل يتطلب صلاحيات المشرف
 * @param {string} props.resource - نوع المورد (user, order, review, etc.)
 * @param {string} props.action - نوع الإجراء (view, edit, delete, etc.)
 * @param {Object} props.resourceData - بيانات المورد للتحقق من الملكية
 * @param {React.ReactNode} props.children - المحتوى المراد عرضه
 * @param {React.ReactNode} props.fallback - المحتوى البديل عند عدم وجود صلاحية
 */
const PermissionGuard = ({
  requireAuth = false,
  requireAdmin = false,
  resource = null,
  action = null,
  resourceData = null,
  children,
  fallback = null
}) => {
  const { user, isAuthenticated } = useAuth();

  // التحقق من المصادقة
  if (requireAuth && !isAuthenticated) {
    return fallback || <div className="text-muted">Please log in to access this feature.</div>;
  }

  // التحقق من صلاحيات المشرف
  if (requireAdmin && (!user || !user.is_admin)) {
    return fallback || <div className="text-muted">Admin access required.</div>;
  }

  // التحقق من صلاحيات المورد
  if (resource && action && resourceData) {
    const hasPermission = checkResourcePermission(user, resource, action, resourceData);
    if (!hasPermission) {
      return fallback || <div className="text-muted">You don't have permission to perform this action.</div>;
    }
  }

  return <>{children}</>;
};

/**
 * دالة للتحقق من صلاحيات المورد
 * @param {Object} user - بيانات المستخدم
 * @param {string} resource - نوع المورد
 * @param {string} action - نوع الإجراء
 * @param {Object} resourceData - بيانات المورد
 * @returns {boolean} - هل لديه صلاحية أم لا
 */
const checkResourcePermission = (user, resource, action, resourceData) => {
  if (!user) return false;

  // المشرفون لديهم جميع الصلاحيات
  if (user.is_admin) return true;

  switch (resource) {
    case 'user':
      // المستخدم يمكنه تعديل ملفه الشخصي فقط
      return user.user_id === resourceData.user_id;
    
    case 'order':
      // المستخدم يمكنه عرض وتعديل طلباته فقط
      return user.user_id === resourceData.user_id;
    
    case 'review':
      // المستخدم يمكنه تعديل مراجعاته فقط
      return user.user_id === resourceData.user_id;
    
    case 'address':
      // المستخدم يمكنه تعديل عناوينه فقط
      return user.user_id === resourceData.user_id;
    
    case 'payment':
      // المستخدم يمكنه عرض مدفوعاته فقط
      return user.user_id === resourceData.user_id;
    
    case 'shoppingCart':
      // المستخدم يمكنه تعديل سلته فقط
      return user.user_id === resourceData.user_id;
    
    default:
      return false;
  }
};

export default PermissionGuard; 