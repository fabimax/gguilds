/**
 * Protected Route component
 * Redirects to login if user is not authenticated
 */
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

const ProtectedRoute = () => {
  const { token, loading } = useAuthStore();
  
  // If still loading, show a loader
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, render the children
  return <Outlet />;
};

export default ProtectedRoute;