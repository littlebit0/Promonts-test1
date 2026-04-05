import { useState, useEffect } from 'react';
import { BarChart3, Book, FileText, CheckSquare, TrendingUp, Award, Clock } from 'lucide-react';
import { statisticsAPI } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await statisticsAPI.getUser();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto p-6"><PageSkeleton /></div>;
  if (!stats) return (
    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow max-w-md mx-auto mt-10">
      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400">통계 데이터가 없습니다</p>
    </div>
  );

  const completionRate = stats.myTodos > 0
    ? ((stats.completedTodos / stats.myTodos) * 100).toFixed(1)
    : 0;

  const statCards = [
    { icon: Book,        label: '수강 중인 강의',  value: stats.myCourses || 0,        color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: FileText,    label: '과제',            value: stats.myAssignments || 0,    color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: CheckSquare, label: '전체 Todo',        value: stats.myTodos || 0,          color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: TrendingUp,  label: '완료한 Todo',      value: stats.completedTodos || 0,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        통계
      </h1>

      {/* 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl p-5`}>
            <card.icon className={`w-7 h-7 ${card.color} mb-3`} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
            <p className="text-3xl font-bold dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Todo 완료율 */}
      {stats.myTodos > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-600" />Todo 완료율
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">진행 중</span>
                <span className="font-bold text-purple-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>완료 {stats.completedTodos}개</span>
                <span>전체 {stats.myTodos}개</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600 w-20 text-right">{completionRate}%</div>
          </div>
        </div>
      )}

      {/* 추가 통계가 있으면 표시 */}
      {(stats.unreadNotifications > 0 || stats.activeAttendances > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {stats.unreadNotifications > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">읽지 않은 알림</p>
                <p className="text-2xl font-bold dark:text-white">{stats.unreadNotifications}</p>
              </div>
            </div>
          )}
          {stats.activeAttendances > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">출석 기록</p>
                <p className="text-2xl font-bold dark:text-white">{stats.activeAttendances}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
