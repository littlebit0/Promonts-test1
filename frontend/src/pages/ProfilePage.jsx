import { PageSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { profileAPI } from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      setProfile(res.data);
      setFormData({ name: res.data.name, email: res.data.email });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.update(formData);
      toast.success('프로필이 업데이트되었습니다');
      fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('업데이트 실패: ' + (error.response?.data?.error || error.message));
    }
  };


  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <User className="w-8 h-8 text-blue-600" />
        프로필
      </h1>

      {/* 프로필 정보 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">기본 정보</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              수정
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({ name: profile.name, email: profile.email });
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">이름:</span> <span className="font-medium">{profile.name}</span>
            </div>
            <div>
              <span className="text-gray-500">이메일:</span> <span className="font-medium">{profile.email}</span>
            </div>
            <div>
              <span className="text-gray-500">역할:</span> <span className="font-medium">{profile.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

