import { PageSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, BookOpen, Hash, Camera, Save, X, Edit2 } from 'lucide-react';
import { profileAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SERVER_BASE = API_BASE.replace('/api', '');

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', studentId: '', department: '', phone: '', avatarUrl: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        studentId: res.data.studentId || '',
        department: res.data.department || '',
        phone: res.data.phone || '',
        avatarUrl: res.data.avatarUrl || '',
      });
    } catch (error) {
      toast.error('프로필을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileAPI.update(formData);
      toast.success('프로필이 저장되었습니다');
      fetchProfile();
    } catch (error) {
      toast.error('저장 실패: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '업로드 실패');
      setFormData((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
      toast.success('프로필 사진이 변경되었습니다');
      fetchProfile();
    } catch (error) {
      toast.error('사진 업로드 실패: ' + error.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const avatarSrc = formData.avatarUrl
    ? (formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `${SERVER_BASE}${formData.avatarUrl}`)
    : null;

  const roleLabel = profile?.role === 'ADMIN' ? '관리자' : profile?.role === 'PROFESSOR' ? '교수' : '학생';

  if (loading) return <PageSkeleton />;

  const fields = [
    { key: 'name',       label: '이름',         icon: User,     type: 'text',  placeholder: '이름을 입력하세요',        required: true },
    { key: 'email',      label: '이메일',        icon: Mail,     type: 'email', placeholder: '이메일을 입력하세요',       required: true },
    { key: 'studentId',  label: '학번',          icon: Hash,     type: 'text',  placeholder: '학번을 입력하세요' },
    { key: 'department', label: '학과',          icon: BookOpen, type: 'text',  placeholder: '학과를 입력하세요' },
    { key: 'phone',      label: '휴대전화번호',   icon: Phone,    type: 'tel',   placeholder: '010-0000-0000' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">프로필 수정</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">개인 정보를 수정하세요</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 프로필 사진 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-600" /> 프로필 사진
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary-100 dark:border-primary-900">
                  {formData.name?.charAt(0) || 'U'}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {avatarUploading ? '업로드 중...' : '사진 변경'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, GIF · 최대 5MB</p>
              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, avatarUrl: '' }))}
                  className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> 사진 제거
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-primary-600" /> 기본 정보
          </h2>
          <div className="space-y-4">
            {fields.map(({ key, label, icon: Icon, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={type}
                    value={formData[key]}
                    onChange={handleChange(key)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            ))}

            {/* 역할 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">역할</label>
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400">
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />저장 중...</>
          ) : (
            <><Save className="w-4 h-4" />변경사항 저장</>
          )}
        </button>
      </form>
    </div>
  );
}
