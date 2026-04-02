import { useToast } from '../components/Toast';
import { useEffect, useState } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { noticeAPI, courseAPI } from '../services/api';
import { Bell, Plus, X, Calendar, BookOpen, Filter } from 'lucide-react';

function NoticesPage({ user }) {
  const [notices, setNotices] = useState([]);
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(() => {
    if (showModal) { setShowModal(false); return; }
    if (selectedNotice) setSelectedNotice(null);
  }, showModal || !!selectedNotice);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', courseId: '' });

  const isProfessor = user.role === 'PROFESSOR';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [noticesRes, coursesRes] = await Promise.all([
        noticeAPI.getAll(),
        courseAPI.getAll(),
      ]);
      setNotices(noticesRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (selectedNotice) {
        await noticeAPI.update(selectedNotice.id, formData);
      } else {
        await noticeAPI.create(formData);
      }
      loadData();
      setShowModal(false);
      setFormData({ title: '', content: '', courseId: '' });
      setSelectedNotice(null);
    } catch (error) {
      console.error('Failed to save notice:', error);
      toast.success('공지사항 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await noticeAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete notice:', error);
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      courseId: notice.courseId,
    });
    setShowModal(true);
  };

  const handleViewDetail = (notice) => {
    setSelectedNotice(notice);
  };

  // 필터링된 공지사항
  const filteredNotices = selectedCourse === 'all'
    ? notices
    : notices.filter(n => n.courseId === parseInt(selectedCourse));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8" />
          공지사항
        </h1>
        <p className="text-primary-100">강의별 공지사항을 확인하세요</p>
      </div>

      {/* Filter & Create Button */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex justify-between items-center">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="all">전체 강의</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredNotices.length}개의 공지사항
            </span>
          </div>

          {/* Create Button (교수만) */}
          {isProfessor && (
            <button
              onClick={() => {
                setSelectedNotice(null);
                setFormData({ title: '', content: '', courseId: '' });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              공지 작성
            </button>
          )}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">공지사항이 없습니다.</p>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-primary-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                      <span className="font-medium text-primary-700">{notice.courseName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
                {isProfessor && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 line-clamp-2 mb-3">{notice.content}</p>
              <button
                onClick={() => handleViewDetail(notice)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                자세히 보기 →
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedNotice ? '공지사항 수정' : '새 공지사항'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedNotice(null);
                  setFormData({ title: '', content: '', courseId: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강의 선택 *
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">강의를 선택하세요</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="공지사항 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  rows="8"
                  placeholder="공지사항 내용을 입력하세요"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotice(null);
                    setFormData({ title: '', content: '', courseId: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  {selectedNotice ? '수정' : '작성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotice && !showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedNotice.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-primary-700">{selectedNotice.courseName}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedNotice.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNotice.content}
                </p>
              </div>
            </div>

            {isProfessor && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                <button
                  onClick={() => {
                    handleEdit(selectedNotice);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedNotice.id);
                    setSelectedNotice(null);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticesPage;
