import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CoursesPage from './pages/CoursesPage';
import TodosPage from './pages/TodosPage';
import AssignmentsPage from './pages/AssignmentsPage';
import NoticesPage from './pages/NoticesPage';
import ChatPage from './pages/ChatPage';
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
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="courses" element={<CoursesPage user={user} />} />
          <Route path="todos" element={<TodosPage />} />
          <Route path="assignments" element={<AssignmentsPage user={user} />} />
          <Route path="notices" element={<NoticesPage user={user} />} />
          <Route path="chat" element={<ChatPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
