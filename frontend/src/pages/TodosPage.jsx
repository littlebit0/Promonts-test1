import { useToast } from '../components/Toast';
import { useEffect, useState } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { todoAPI, courseAPI } from '../services/api';
import { CheckSquare, Plus, X, Calendar, AlertCircle, BookOpen, Filter } from 'lucide-react';

function TodosPage() {
  const [todos, setTodos] = useState([]);
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  useEscapeKey(() => { if (showModal) setShowModal(false); }, showModal);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    courseId: '',
  });

  useEffect(() => {
    loadTodos();
    loadCourses();
  }, [filter]);

  const loadTodos = async () => {
    try {
      const completed = filter === 'completed' ? true : filter === 'pending' ? false : undefined;
      const response = await todoAPI.getAll(completed);
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await todoAPI.create(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '', priority: 'MEDIUM', courseId: '' });
      loadTodos();
    } catch (error) {
      console.error('Failed to save todo:', error);
      toast.success('할 일 저장에 실패했습니다.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await todoAPI.toggle(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await todoAPI.delete(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const pendingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <CheckSquare className="w-8 h-8" />
              할 일 관리
            </h1>
            <p className="text-green-100">
              {pendingCount}개 남음 · {completedCount}개 완료
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            새 할 일
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          전체 ({todos.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'pending'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          미완료 ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'completed'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          완료 ({completedCount})
        </button>
      </div>

      {/* Todos List */}
      <div className="grid gap-4">
        {todos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">할 일이 없습니다.</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 ${
                todo.completed ? 'border-green-500 bg-gray-50 opacity-70' : 'border-primary-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  disabled={todo.title && todo.title.startsWith('[과제]')}
                  className={`mt-1 w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 ${
                    todo.title && todo.title.startsWith('[과제]') 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer'
                  }`}
                  title={todo.title && todo.title.startsWith('[과제]') ? '과제는 제출 시스템을 통해서만 완료할 수 있습니다.' : ''}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xl font-bold ${
                        todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.title && todo.title.startsWith('[과제]') && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                        제출 필요
                      </span>
                    )}
                  </div>
                  {todo.description && (
                    <p className="text-gray-600 mt-2">{todo.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm">
                    {(todo.relatedCourse || todo.courseName) && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        {todo.relatedCourse || todo.courseName}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className="flex items-center gap-1 text-accent-600 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(todo.dueDate).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {todo.priority && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        todo.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : todo.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {todo.priority === 'HIGH' ? '높음' : todo.priority === 'MEDIUM' ? '보통' : '낮음'}
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                새 할 일 추가
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="할 일 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="상세 설명 (선택)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">마감일</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">우선순위</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="LOW">낮음</option>
                    <option value="MEDIUM">보통</option>
                    <option value="HIGH">높음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">강의</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">선택 안 함</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodosPage;
