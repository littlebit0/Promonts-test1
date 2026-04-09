import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuth2CallbackPage({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name  = params.get('name');
    const email = params.get('email');
    const role  = params.get('role');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, email, role }));
      if (onLogin) onLogin({ name, email, role });
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=oauth2', { replace: true });
    }
  }, [navigate, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Microsoft 로그인 처리 중...</p>
      </div>
    </div>
  );
}
