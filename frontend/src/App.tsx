import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from '@/store/StoreContext';
import AuthPage from '@/pages/AuthPage';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

function Router() {
  const { user } = useStore();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/customer"
        element={user?.role === 'Customer' ? <CustomerDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={user?.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={user ? (user.role === 'Admin' ? <Navigate to="/admin" /> : <Navigate to="/customer" />) : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </StoreProvider>
  );
}
