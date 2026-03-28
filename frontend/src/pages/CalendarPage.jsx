import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, List, Trash2, X, MapPin, Clock } from 'lucide-react';
import { scheduleAPI } from '../services/api';
import SimpleCalendar from '../components/SimpleCalendar';

export default function CalendarPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
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
                <div
                  key={schedule.id}
                  onClick={() => handleScheduleClick(schedule)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between border-l-4 cursor-pointer hover:shadow-lg transition"
                  style={{ borderColor: schedule.color || '#3b82f6' }}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{schedule.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(schedule.startTime).toLocaleString()} ~ {new Date(schedule.endTime).toLocaleString()}
                    </p>
                    {schedule.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {schedule.location}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 삭제 로직
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Schedule Detail Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedSchedule.title}</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Time */}
              <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-r-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-2">
                  <Clock className="w-5 h-5" />
                  일정 시간
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  시작: {new Date(selectedSchedule.startTime).toLocaleString('ko-KR')}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  종료: {new Date(selectedSchedule.endTime).toLocaleString('ko-KR')}
                </p>
              </div>

              {/* Location */}
              {selectedSchedule.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">장소</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedSchedule.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedSchedule.description && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">상세 내용</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedSchedule.description}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
