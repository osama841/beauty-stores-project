    // frontend/src/components/auth/AuthLayout.jsx

    import React from 'react';

    function AuthLayout({ children }) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            {children}
          </div>
        </div>
      );
    }

    export default AuthLayout;
    