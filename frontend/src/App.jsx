import { useState, Suspense, lazy } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { AuthProvider } from './context/AuthContext';

// Lazy Imports
import ProtectedRoute from '../components/ProtectedRoute';
import Unauthorized from '../pages/Unauthorized';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Dashboard = lazy(() => import('../pages/Dashboard')); // Redirector
const AddStudent = lazy(() => import('../pages/AddStudent'));
const Attendance = lazy(() => import('../pages/Attendance'));
const StaffAttendance = lazy(() => import('../pages/StaffAttendance'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Project = lazy(() => import('../pages/Project'));
const Leave = lazy(() => import('../pages/Leave'));
const Plans = lazy(() => import('../pages/Plans'));
const PlanDetails = lazy(() => import('../pages/PlanDetails'));
const ManageStudents = lazy(() => import('../pages/ManageStudents'));
const Chat = lazy(() => import('../pages/Chat'));

// Role Specific Dashboards
const PrincipalDashboard = lazy(() => import('../pages/PrincipalDashboard'));
const TeacherDashboard = lazy(() => import('../pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ParentDashboard = lazy(() => import('../pages/ParentDashboard'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-100 min-h-screen">
          <Nav />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />


              {/* Redirect generic dashboard to specific one handled by component or separate route */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ALL']}><Dashboard /></ProtectedRoute>} />

              {/* PARENT ROUTES - EXCLUSIVE */}
              <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
              </Route>

              {/* PRINCIPAL ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['PRINCIPAL', 'STATE_ADMIN', 'DISTRICT_ADMIN']} />}>
                <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
                <Route path="/staff-attendance" element={<StaffAttendance />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/add-student" element={<AddStudent />} />
                <Route path="/edit-student/:id" element={<AddStudent />} />
              </Route>

              {/* STRICT TEACHER DASHBOARD */}
              <Route element={<ProtectedRoute allowedRoles={['STATE_ADMIN', 'STAFF', 'TEACHER']} />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              </Route>

              {/* SHARED STAFF/ADMIN ROUTES (EXCLUDES PARENT) */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TEACHER', 'PRINCIPAL', 'HEADMASTER', 'STATE_ADMIN', 'DISTRICT_ADMIN']} />}>
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/:id" element={<PlanDetails />} />
                <Route path="/projects" element={<Project />} />
                <Route path="/manage-students" element={<ManageStudents />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
