// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { currentUser, currentAdmin, currentCashier } from '../api/auth';

const ProtectedRoute = ({ role }) => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthorized(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        if (role === 'ADMIN') {
          await currentAdmin();
        } else if (role === 'CASHIER') {
          await currentCashier();
        } else {
          await currentUser();
        }
        if (mounted) setAuthorized(true);
      } catch (err) {
        if (mounted) setAuthorized(false);
      }
    })();

    return () => { mounted = false; };
  }, [role]);

  if (authorized === null) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
