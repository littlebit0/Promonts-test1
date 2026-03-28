import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = filter === 'unread' 
        ? await notificationAPI.getUnread()
        : await notificationAPI.getAll();
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8 text-blue-600" />
          알림
        </h1>
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <CheckCheck className="w-5 h-5" />
          모두 읽음 처리
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded ${
            filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          읽지 않음
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">알림이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg flex items-start justify-between ${
                notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs rounded ${
                    notification.isRead ? 'bg-gray-200' : 'bg-blue-600 text-white'
                  }`}>
                    {notification.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-bold mb-1">{notification.title}</h3>
                <p className="text-gray-700">{notification.message}</p>
                {notification.link && (
                  <a href={notification.link} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    자세히 보기 →
                  </a>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 hover:bg-gray-200 rounded"
                    title="읽음 처리"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="삭제"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
