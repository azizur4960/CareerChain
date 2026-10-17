import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import EditStudentProfile from './pages/student/EditStudentProfile';
import AlumniDirectory from './pages/student/AlumniDirectory';
import AlumniDetail from './pages/student/AlumniDetail';
import JobsBoard from './pages/student/JobsBoard';
import JobDetail from './pages/student/JobDetail';
import AIJobMatchPage from './pages/student/AIJobMatchPage';
import AICareerAssistant from './pages/student/AICareerAssistant';
import MessagingPage from './pages/student/MessagingPage';
import BlogsPage from './pages/student/BlogsPage';
import BlogDetailPage from './pages/student/BlogDetailPage';
import EventsPage from './pages/student/EventsPage';
import CommunityFeed from './pages/CommunityFeed';
import ResumeBuilder from './pages/ResumeBuilder';

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import EditAlumniProfile from './pages/alumni/EditAlumniProfile';
import CreateJob from './pages/alumni/CreateJob';
import MyJobs from './pages/alumni/MyJobs';
import CreateBlog from './pages/alumni/CreateBlog';
import MyPosts from './pages/alumni/MyPosts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AlumniVerification from './pages/admin/AlumniVerification';
import JobManagement from './pages/admin/JobManagement';
import EventManagement from './pages/admin/EventManagement';
import AdminProfilePage from './pages/admin/AdminProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Route>

          {/* Student Routes with DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/feed" element={<CommunityFeed />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/profile/edit" element={<EditStudentProfile />} />
            <Route path="/student/alumni" element={<AlumniDirectory />} />
            <Route path="/student/alumni/:id" element={<AlumniDetail />} />
            <Route path="/student/jobs" element={<JobsBoard />} />
            <Route path="/student/jobs/:id" element={<JobDetail />} />
            <Route path="/student/ai-match" element={<AIJobMatchPage />} />
            <Route path="/student/resume-builder" element={<ResumeBuilder />} />
            <Route path="/student/ai-chat" element={<AICareerAssistant />} />
            <Route path="/student/messages" element={<MessagingPage />} />
            <Route path="/student/blogs" element={<BlogsPage />} />
            <Route path="/student/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/student/events" element={<EventsPage />} />
          </Route>

          {/* Alumni Routes with DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ALUMNI', 'ADMIN']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
            <Route path="/alumni/feed" element={<CommunityFeed />} />
            <Route path="/alumni/resume-builder" element={<ResumeBuilder />} />
            <Route path="/alumni/messages" element={<MessagingPage />} />
            <Route path="/alumni/profile" element={<AlumniProfile />} />
            <Route path="/alumni/profile/edit" element={<EditAlumniProfile />} />
            <Route path="/alumni/jobs/create" element={<CreateJob />} />
            <Route path="/alumni/jobs" element={<MyJobs />} />
            <Route path="/alumni/blogs/create" element={<CreateBlog />} />
            <Route path="/alumni/blogs" element={<MyPosts />} />
          </Route>

          {/* Admin Routes with DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/feed" element={<CommunityFeed />} />
            <Route path="/admin/resume-builder" element={<ResumeBuilder />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/alumni-verify" element={<AlumniVerification />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
