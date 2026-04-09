import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuth2LinkedPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const returnPath = sessionStorage.getItem('ms_link_return') || '/';
    sessionStorage.removeItem('ms_link_return');
    setStatus('done');
    setTimeout(() => {
      navigate(returnPath + (returnPath.includes('?') ? '&' : '?') + 'ms=linked', { replace: true });
    }, 800);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {status === 'done' ? (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">연동 완료! 이동 중...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Microsoft 연동 처리 중...</p>
          </>
        )}
      </div>
    </div>
  );
}
