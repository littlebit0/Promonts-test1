import { useEffect, useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { courseAPI, noticeAPI } from '../services/api';

function NoticesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const isProfessor = user.role === 'PROFESSOR';

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadNotices(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async (courseId) => {
    try {
      const response = await noticeAPI.getAllByCourse(courseId);
      setNotices(response.data);
    } catch (error) {
      console.error('Failed to load notices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await noticeAPI.create(selectedCourse, formData);
      setShowModal(false);
      setFormData({ title: '', content: '' });
      loadNotices(selectedCourse);
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await noticeAPI.delete(id);
      setSelectedNotice(null);
      loadNotices(selectedCourse);
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 강의가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
        {isProfessor && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            + 새 공지
          </button>
        )}
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">강의 선택</label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {/* Notices List */}
      <div className="grid gap-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            등록된 공지사항이 없습니다.
            {isProfessor && ' 새 공지를 추가해보세요!'}
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{notice.authorName}</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                {isProfessor && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notice.id);
                    }}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNotice.title}</h2>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex gap-4 mb-4 text-sm text-gray-500">
              <span>작성자: {selectedNotice.authorName}</span>
              <span>{new Date(selectedNotice.createdAt).toLocaleString('ko-KR')}</span>
            </div>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{selectedNotice.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">새 공지사항 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="공지 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="공지 내용"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticesPage;


