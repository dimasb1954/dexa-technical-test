import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthProvider';
import AttendancesPage from './pages/AttendancesPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeesPage from './pages/EmployeesPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute role="EMPLOYEE" />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
            </Route>
            <Route element={<ProtectedRoute role="ADMIN_HRD" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="employees" replace />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="attendances" element={<AttendancesPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}