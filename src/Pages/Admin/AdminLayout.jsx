// ...existing code...
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function AdminLayout() {
  const location = useLocation();

  // derive page title from pathname
  const path = location.pathname.replace('/admin/', '');
  const titleMap = {
    'users': 'Users',
    'activities': 'Activities',
    'earnings': 'Earnings',
    'subscription': 'Subscription',
    'support': 'Support',
    'profile-verification': 'Profile Verification',
    'profile-verification/care-seekers': 'Care Seekers',
    'profile-verification/care-providers': 'Care Providers',
    'messages': 'Notifications & Messages',
  };
  const pageTitle = titleMap[path] || 'Admin';

  const access = typeof window !== 'undefined' ? localStorage.getItem('access') : null
  console.log('AdminLayout check - Access token:', access)
  
  if (!access) {
    console.log('No access token, redirecting to /admin/login')
    return <Navigate to="/admin/login" replace />
  }

  console.log('Access token found, rendering admin layout')

  return (
    <div className="flex h-screen bg-[#f5f7f9]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
