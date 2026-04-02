import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, FileText, Award, Info } from 'lucide-react';
import { notificationAPI } from '../services/api';

const TYPE_CONFIG = {
  NOTICE:     { icon: Bell,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/30' },
  ASSIGNMENT: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  GRADE:      { icon: Award,    color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  SYSTEM:     { icon: Info,     color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-700/50' },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.SYSTEM;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, [filter]);

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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
          <Bell className="w-8 h-8 text-blue-600" />
          알림
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-sm rounded-full font-normal">
              {unreadCount}
            </span>
          )}
        </h1>
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <CheckCheck className="w-5 h-5" />
          모두 읽음
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: '전체' },
          { key: 'unread', label: '읽지 않음' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
              filter === key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 dark:text-gray-300">로딩 중...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">알림이 없습니다</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '아직 알림이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const typeConfig = getTypeConfig(notification.type);
            const TypeIcon = typeConfig.icon;
            return (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${typeConfig.bg} flex-shrink-0`}>
                    <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                        {notification.type}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('ko-KR')}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{notification.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{notification.message}</p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        onClick={e => e.stopPropagation()}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
                      >
                        자세히 보기 →
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                        title="읽음 처리"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
