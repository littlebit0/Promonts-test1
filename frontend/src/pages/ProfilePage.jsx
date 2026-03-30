import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { profileAPI } from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
      alert('í”„ë¡œí•„ì´ ì—…ë°ì´íŠ¸ë˜ì—ˆìŠµë‹ˆë‹¤');
      fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('ì—…ë°ì´íŠ¸ ì‹¤íŒ¨: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('ìƒˆ ë¹„ë°€ë²ˆí˜¸ê°€ ì¼ì¹˜í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤');
      return;
    }
    try {
      await profileAPI.changePassword(passwordData.oldPassword, passwordData.newPassword);
      alert('ë¹„ë°€ë²ˆí˜¸ê°€ ë³€ê²½ë˜ì—ˆìŠµë‹ˆë‹¤');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('ë¹„ë°€ë²ˆí˜¸ ë³€ê²½ ì‹¤íŒ¨: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="text-center py-12">ë¡œë”© ì¤‘...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <User className="w-8 h-8 text-blue-600" />
        í”„ë¡œí•„
      </h1>

      {/* í”„ë¡œí•„ ì •ë³´ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">ê¸°ë³¸ ì •ë³´</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ìˆ˜ì •
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block font-medium mb-1 dark:text-gray-300">ì´ë¦„</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 dark:text-gray-300">ì´ë©”ì¼</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                ì €ìž¥
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({ name: profile.name, email: profile.email });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                ì·¨ì†Œ
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">ì´ë¦„:</span> <span className="font-medium dark:text-white">{profile.name}</span>
            </div>
            <div>
              <span className="text-gray-500">ì´ë©”ì¼:</span> <span className="font-medium dark:text-white">{profile.email}</span>
            </div>
            <div>
              <span className="text-gray-500">ì—­í• :</span> <span className="font-medium dark:text-white">{profile.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* ë¹„ë°€ë²ˆí˜¸ ë³€ê²½ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          <Lock className="w-6 h-6" />
          ë¹„ë°€ë²ˆí˜¸ ë³€ê²½
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 dark:text-gray-300">í˜„ìž¬ ë¹„ë°€ë²ˆí˜¸</label>
            <input
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 dark:text-gray-300">ìƒˆ ë¹„ë°€ë²ˆí˜¸</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 dark:text-gray-300">ìƒˆ ë¹„ë°€ë²ˆí˜¸ í™•ì¸</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            ë¹„ë°€ë²ˆí˜¸ ë³€ê²½
          </button>
        </form>
      </div>
    </div>
  );
}

