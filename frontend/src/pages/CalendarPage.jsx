import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, List, Trash2 } from 'lucide-react';
import { scheduleAPI } from '../services/api';
import SimpleCalendar from '../components/SimpleCalendar';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await scheduleAPI.getMy();
      setSchedules(res.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    alert(`선택한 날짜: ${date.toLocaleDateString()}\n일정 추가 기능은 추후 구현 예정`);
  };

  if (loading) return <div className="text-center py-12">로딩 중...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          일정
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
          >
            {viewMode === 'calendar' ? <List className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
            {viewMode === 'calendar' ? '목록 보기' : '캘린더 보기'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            일정 추가
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">등록된 일정이 없습니다</div>
      ) : (
        <>
          {viewMode === 'calendar' ? (
            <SimpleCalendar schedules={schedules} onDateClick={handleDateClick} />
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between border-l-4" style={{ borderColor: schedule.color || '#3b82f6' }}>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{schedule.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(schedule.startTime).toLocaleString()} ~ {new Date(schedule.endTime).toLocaleString()}
                    </p>
                    {schedule.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {schedule.location}</p>
                    )}
                    {schedule.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{schedule.description}</p>
                    )}
                  </div>
                  <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
