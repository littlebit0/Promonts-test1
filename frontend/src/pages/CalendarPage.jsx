import { useToast } from '../components/Toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useState, useEffect } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Calendar as CalendarIcon, Plus, List, Trash2, X, MapPin, Clock, Palette } from 'lucide-react';
import { scheduleAPI } from '../services/api';
import SimpleCalendar from '../components/SimpleCalendar';

const COLOR_OPTIONS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

const defaultForm = { title: '', startTime: '', endTime: '', location: '', description: '', color: '#3b82f6' };

export default function CalendarPage() {
  const [schedules, setSchedules] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  useEscapeKey(() => {
    if (showDetailModal) { setShowDetailModal(false); return; }
    if (showAddModal) setShowAddModal(false);
  }, showDetailModal || showAddModal);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSchedules(); }, []);

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

  const openAddModal = (date = null) => {
    if (date) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const iso = local.toISOString().slice(0, 16);
      setForm({ ...defaultForm, startTime: iso });
    } else {
      setForm(defaultForm);
    }
    setShowAddModal(true);
  };

  const handleDateClick = (date) => {
    openAddModal(date);
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await scheduleAPI.create({
        title: form.title,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
        location: form.location,
        description: form.description,
        color: form.color,
      });
      setShowAddModal(false);
      setForm(defaultForm);
      fetchSchedules();
    } catch (error) {
      toast.error('일정 저장에 실패했습니다: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await scheduleAPI.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (showDetailModal && selectedSchedule?.id === id) setShowDetailModal(false);
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto p-6"><PageSkeleton /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          일정
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 dark:text-gray-200"
          >
            {viewMode === 'calendar' ? <List className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
            {viewMode === 'calendar' ? '목록 보기' : '캘린더 보기'}
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            일정 추가
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          <SimpleCalendar
            schedules={schedules}
            onDateClick={handleDateClick}
            onScheduleClick={handleScheduleClick}
          />
          {schedules.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-4">날짜를 클릭해 일정을 추가해보세요 ✨</p>
          )}
        </>
      ) : (
        <>
          {schedules.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">등록된 일정이 없습니다</div>
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
                    <h3 className="font-bold text-lg dark:text-white">{schedule.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {schedule.startTime ? new Date(schedule.startTime).toLocaleString() : '시간 미설정'}
                      {schedule.endTime ? ` ~ ${new Date(schedule.endTime).toLocaleString()}` : ''}
                    </p>
                    {schedule.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {schedule.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(schedule.id, e)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">일정 추가</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="일정 제목"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시작 시간</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">종료 시간</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />장소
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="장소 (선택)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="설명 (선택)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />색상
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full border-4 transition ${form.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedSchedule.title}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-2">
                  <Clock className="w-5 h-5" />일정 시간
                </div>
                {selectedSchedule.startTime && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">시작: {new Date(selectedSchedule.startTime).toLocaleString('ko-KR')}</p>
                )}
                {selectedSchedule.endTime && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">종료: {new Date(selectedSchedule.endTime).toLocaleString('ko-KR')}</p>
                )}
              </div>
              {selectedSchedule.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">장소</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedSchedule.location}</p>
                  </div>
                </div>
              )}
              {selectedSchedule.description && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">상세 내용</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedSchedule.description}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={(e) => handleDelete(selectedSchedule.id, e)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />삭제
                </button>
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
