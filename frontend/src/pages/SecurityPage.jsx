import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Eye, EyeOff, ArrowLeft, CheckCircle, Unlink, RefreshCw } from 'lucide-react';
import { profileAPI } from '../services/api';
import api from '../services/api';
import { useToast } from '../components/Toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SecurityPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msStatus, setMsStatus] = useState(null);
  const [msLoading, setMsLoading] = useState(false);

  useEffect(() => {
    loadMsStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('ms') === 'linked') {
      toast.success('Microsoft 계정이 연동되었습니다!');
      window.history.replaceState({}, '', '/security');
    }
  }, []);

  const loadMsStatus = async () => {
    try {
      const res = await api.get('/ms/status');
      setMsStatus(res.data);
    } catch { setMsStatus({ linked: false, msEmail: '', msName: '' }); }
  };

  const openMsLinkPopup = () => {
    const token = localStorage.getItem('token') || '';
    sessionStorage.setItem('ms_link_return', '/security');
    window.location.href = `${BACKEND_URL}/api/ms/connect?token=${encodeURIComponent(token)}&returnTo=/oauth2/linked`;
  };

  const handleMsUnlink = async () => {
    if (!window.confirm('MS 연동을 해제하시겠습니까? 메일 기능을 사용할 수 없게 됩니다.')) return;
    setMsLoading(true);
    try {
      await api.delete('/ms/unlink');
      toast.success('MS 연동이 해제되었습니다.');
      setMsStatus({ linked: false, msEmail: '', msName: '' });
    } catch (e) {
      toast.error('해제 실패: ' + (e.response?.data?.error || e.message));
    } finally { setMsLoading(false); }
  };

  const handleChange = (field) => (e) => setPasswordData(prev => ({ ...prev, [field]: e.target.value }));
  const toggleShow = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  const isStrong = (pw) => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  const strength = !passwordData.newPassword ? null : isStrong(passwordData.newPassword) ? 'strong' : passwordData.newPassword.length >= 6 ? 'medium' : 'weak';
  const strengthConfig = {
    weak:   { label: '약함', color: 'bg-red-500',    text: 'text-red-600' },
    medium: { label: '보통', color: 'bg-yellow-400', text: 'text-yellow-600' },
    strong: { label: '강함', color: 'bg-green-500',  text: 'text-green-600' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('새 비밀번호가 일치하지 않습니다'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('비밀번호는 6자 이상이어야 합니다'); return; }
    setLoading(true);
    try {
      await profileAPI.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccess(true);
      toast.success('비밀번호가 변경되었습니다');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) { toast.error('변경 실패: ' + (error.response?.data?.error || error.message)); }
    finally { setLoading(false); }
  };

  const fields = [
    { key: 'oldPassword',     label: '현재 비밀번호',    showKey: 'old' },
    { key: 'newPassword',     label: '새 비밀번호',      showKey: 'new' },
    { key: 'confirmPassword', label: '새 비밀번호 확인', showKey: 'confirm' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">보안 설정</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">비밀번호 및 계정 보안을 관리하세요</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6"><Lock className="w-5 h-5 text-primary-600" /><h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">비밀번호 변경</h2></div>
        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />비밀번호가 성공적으로 변경되었습니다!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <div className="relative">
                <input type={showPasswords[showKey] ? 'text' : 'password'} value={passwordData[key]} onChange={handleChange(key)} placeholder={label}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" required />
                <button type="button" onClick={() => toggleShow(showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPasswords[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {key === 'newPassword' && strength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">{['weak','medium','strong'].map((s,i) => <div key={s} className={`h-1 flex-1 rounded-full transition-all ${['weak','medium','strong'].indexOf(strength) >= i ? strengthConfig[strength].color : 'bg-gray-200 dark:bg-gray-600'}`} />)}</div>
                  <p className={`text-xs font-medium ${strengthConfig[strength].text}`}>비밀번호 강도: {strengthConfig[strength].label}{strength === 'weak' && ' — 8자 이상, 대문자, 숫자 포함 권장'}</p>
                </div>
              )}
              {key === 'confirmPassword' && passwordData.confirmPassword && (
                <p className={`text-xs mt-1 font-medium ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                </p>
              )}
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />처리 중...</> : <><Lock className="w-4 h-4" />비밀번호 변경</>}
          </button>
        </form>
      </div>

      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">🔒 보안 팁</p>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <li>• 8자 이상, 대문자 + 숫자 조합을 권장합니다</li>
          <li>• 다른 서비스와 동일한 비밀번호 사용을 피하세요</li>
          <li>• 정기적으로 비밀번호를 변경하는 것이 안전합니다</li>
        </ul>
      </div>

      <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Microsoft 계정 연동</h2>
        </div>
        {msStatus === null ? (
          <div className="flex items-center justify-center py-6"><div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : msStatus.linked ? (
          <div>
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">연동됨</p>
                <p className="text-sm text-green-600 dark:text-green-400 truncate">{msStatus.msEmail}</p>
                {msStatus.msName && <p className="text-xs text-green-500 mt-0.5">{msStatus.msName}</p>}
              </div>
              <button onClick={loadMsStatus} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition" title="새로고침"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <button onClick={handleMsUnlink} disabled={msLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium text-sm disabled:opacity-50">
              {msLoading ? <><div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />해제 중...</> : <><Unlink className="w-4 h-4" />MS 연동 해제</>}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Microsoft 계정을 연동하면 Outlook 메일을 Promonts에서 바로 사용할 수 있어요.</p>
            <button onClick={openMsLinkPopup} className="w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
              Microsoft 계정 연동하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
