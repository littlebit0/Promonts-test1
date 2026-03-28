import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import TodosPage from './pages/TodosPage';
import AcademicPage from './pages/AcademicPage';
import NoticesPage from './pages/NoticesPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import GradesPage from './pages/GradesPage';
import CalendarPage from './pages/CalendarPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import SearchPage from './pages/SearchPage';
import StatsPage from './pages/StatsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <Login onLogin={handleLogin} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // 관리자는 관리자 페이지로 리다이렉트
  const isAdmin = user.role === 'ADMIN';

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
                {isAdmin ? (
                  <>
                    <Route index element={<Navigate to="/admin" replace />} />
                    <Route path="admin" element={<AdminPage user={user} />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </>
                ) : (
                  <>
                    <Route index element={<Dashboard user={user} />} />
                    <Route path="courses" element={<CoursesPage user={user} />} />
                    <Route path="course/:courseId" element={<CourseDetailPage user={user} />} />
                    <Route path="todos" element={<TodosPage />} />
                    <Route path="academic" element={<AcademicPage user={user} />} />
                    <Route path="notices" element={<NoticesPage user={user} />} />
                    <Route path="chat" element={<ChatPage user={user} />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="grades" element={<GradesPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="exams" element={<ExamsPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                )}
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
