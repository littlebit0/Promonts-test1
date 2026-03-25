import { useEffect, useState } from 'react';
import { courseAPI, assignmentAPI } from '../services/api';
import { FileText, Plus, Trash2, Calendar, BookOpen, AlertCircle } from 'lucide-react';

function AssignmentsPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const isProfessor = user.role === 'PROFESSOR';

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments(selectedCourse);
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

  const loadAssignments = async (courseId) => {
    try {
      const response = await assignmentAPI.getAllByCourse(courseId);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.create(selectedCourse, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '' });
      loadAssignments(selectedCourse);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('과제 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await assignmentAPI.delete(id);
      loadAssignments(selectedCourse);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              과제 관리
            </h1>
            <p className="text-accent-100">{assignments.length}개의 과제</p>
          </div>
          {isProfessor && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-accent-700 rounded-lg hover:bg-accent-50 transition-all font-bold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              새 과제
            </button>
          )}
        </div>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          강의 선택
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 font-medium"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">등록된 과제가 없습니다.</p>
            {isProfessor && <p className="text-gray-400 text-sm mt-2">새 과제를 추가해보세요!</p>}
          </div>
        ) : (
          assignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now;
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={assignment.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border-l-4 ${
                  isOverdue ? 'border-red-500' : 'border-accent-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-6 h-6 text-accent-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{assignment.title}</h3>
                        {assignment.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">{assignment.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        {assignment.courseName}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          isOverdue ? 'text-red-600' : 'text-accent-600'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        마감: {dueDate.toLocaleDateString('ko-KR')} {dueDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isOverdue && daysLeft <= 3 && (
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <AlertCircle className="w-4 h-4" />
                          {daysLeft}일 남음
                        </span>
                      )}
                    </div>
                  </div>

                  {isProfessor && (
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-accent-500 to-accent-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                새 과제 등록
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">과제 제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="예: 3장 연습문제"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">과제 설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="과제 상세 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">마감일 *</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all font-bold shadow-lg"
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

export default AssignmentsPage;
