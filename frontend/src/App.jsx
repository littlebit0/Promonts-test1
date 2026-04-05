import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// 코드 스플리팅: 페이지별 lazy import
const Dashboard = lazy(() => import('./components/Dashboard'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const TodosPage = lazy(() => import('./pages/TodosPage'));
const AcademicPage = lazy(() => import('./pages/AcademicPage'));
const NoticesPage = lazy(() => import('./pages/NoticesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AssignmentsPage = lazy(() => import('./pages/AssignmentsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const ExamsPage = lazy(() => import('./pages/ExamsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));

// 페이지 로딩 스피너
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 dark:text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

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

  const isAdmin = user.role === 'ADMIN';

  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
                      <Route path="assignments" element={<AssignmentsPage user={user} />} />
                      <Route path="academic" element={<AcademicPage user={user} />} />
                      <Route path="notices" element={<NoticesPage user={user} />} />
                      <Route path="chat" element={<ChatPage user={user} />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="grades" element={<Navigate to="/academic" replace />} />
                      <Route path="calendar" element={<CalendarPage />} />
                      <Route path="attendance" element={<AttendancePage user={user} />} />
                      <Route path="exams" element={<ExamsPage user={user} />} />
                      <Route path="search" element={<SearchPage />} />
                      <Route path="stats" element={<StatsPage />} />
                      <Route path="security" element={<SecurityPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
