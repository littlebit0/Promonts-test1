import { useState, useEffect } from 'react';
import { BarChart3, Users, Book, FileText, CheckSquare, Bell } from 'lucide-react';
import { statisticsAPI } from '../services/api';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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

  if (loading) return <div className="text-center py-12">ë¡œë”© ì¤‘...</div>;
  if (!stats) return <div className="text-center py-12 text-gray-500">í†µê³„ ë°ì´í„°ê°€ ì—†ìŠµë‹ˆë‹¤</div>;

  const statCards = [
    { icon: Book, label: 'ìˆ˜ê°• ì¤‘ì¸ ê°•ì˜', value: stats.myCourses || 0, color: 'text-blue-600' },
    { icon: FileText, label: 'ê³¼ì œ', value: stats.myAssignments || 0, color: 'text-green-600' },
    { icon: CheckSquare, label: 'í•  ì¼', value: stats.myTodos || 0, color: 'text-purple-600' },
    { icon: Bell, label: 'ì™„ë£Œí•œ í•  ì¼', value: stats.completedTodos || 0, color: 'text-orange-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        í†µê³„
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
            <p className="text-3xl font-bold dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {stats.completedTodos > 0 && stats.myTodos > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
          <h2 className="font-bold text-xl mb-4 dark:text-white">í•  ì¼ ì™„ë£Œìœ¨</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  ì§„í–‰ ì¤‘
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {((stats.completedTodos / stats.myTodos) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${(stats.completedTodos / stats.myTodos) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

