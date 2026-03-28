import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { scheduleAPI } from '../services/api';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-12">로딩 중...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          일정
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          일정 추가
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">일정이 없습니다</div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white p-4 rounded-lg shadow border-l-4" style={{ borderColor: schedule.color }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{schedule.title}</h3>
                  {schedule.description && <p className="text-gray-600 mt-1">{schedule.description}</p>}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{new Date(schedule.startTime).toLocaleString()}</span>
                    <span>→</span>
                    <span>{new Date(schedule.endTime).toLocaleString()}</span>
                  </div>
                  {schedule.location && (
                    <div className="mt-2 text-sm text-gray-600">📍 {schedule.location}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
