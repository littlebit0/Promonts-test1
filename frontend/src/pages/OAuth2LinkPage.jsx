import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import api from '../services/api';

export default function OAuth2LinkPage({ onLogin }) {
  const navigate = useNavigate();
  const [params, setParams] = useState({ msEmail: '', msName: '', msToken: '' });
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setParams({ msEmail: p.get('msEmail') || '', msName: p.get('msName') || '', msToken: p.get('msToken') || '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let response;
      if (mode === 'login') {
        response = await authAPI.login({ email: form.email, password: form.password });
      } else {
        response = await authAPI.register(form);
      }
      const { token, email, name, role } = response.data;
      await api.post('/ms/link', { msEmail: params.msEmail, msName: params.msName, msToken: params.msToken },
        { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email, name, role }));
      if (onLogin) onLogin({ email, name, role });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'login' ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg width="32" height="32" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            <span className="text-lg font-bold dark:text-white">Microsoft 계정 연동</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">{params.msName}</p>
            <p className="text-xs mt-0.5 opacity-80">{params.msEmail}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">이 MS 계정을 Promonts 계정에 연동해주세요.</p>
        </div>
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'login' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>기존 계정 연동</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'register' ? 'bg-white dark:bg-gray-600 shadow text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>신규 가입</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Promonts 계정 이메일" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
          </div>
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={params.msName || '홍길동'} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">역할</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg">
                  <option value="STUDENT">학생</option>
                  <option value="PROFESSOR">교수</option>
                </select>
              </div>
            </>
          )}
          {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400">
            {loading ? '처리 중...' : mode === 'login' ? '연동하기' : '가입 후 연동'}
          </button>
        </form>
        <button onClick={() => navigate('/login', { replace: true })} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">취소 (로그인 화면으로)</button>
      </div>
    </div>
  );
}
