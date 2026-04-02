import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';

function Layout({ user, onLogout }) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setVisible(false);
      const t = setTimeout(() => {
        setVisible(true);
        prevPath.current = location.pathname;
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar user={user} onLogout={onLogout} />
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
