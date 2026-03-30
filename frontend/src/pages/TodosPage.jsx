import { useEffect, useState } from 'react';
import { todoAPI, courseAPI } from '../services/api';
import { CheckSquare, Plus, X, Calendar, AlertCircle, BookOpen, Filter } from 'lucide-react';

function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
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
      alert('í•  ì¼ ì €ìž¥ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
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
    if (!confirm('ì •ë§ ì‚­ì œí•˜ì‹œê² ìŠµë‹ˆê¹Œ?')) return;
    try {
      await todoAPI.delete(id);
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('ì‚­ì œì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
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
              í•  ì¼ ê´€ë¦¬
            </h1>
            <p className="text-green-100">
              {pendingCount}ê°œ ë‚¨ìŒ Â· {completedCount}ê°œ ì™„ë£Œ
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ìƒˆ í•  ì¼
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
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          ì „ì²´ ({todos.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'pending'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          ë¯¸ì™„ë£Œ ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'completed'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          ì™„ë£Œ ({completedCount})
        </button>
      </div>

      {/* Todos List */}
      <div className="grid gap-4">
        {todos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">í•  ì¼ì´ ì—†ìŠµë‹ˆë‹¤.</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 ${
                todo.completed ? 'border-green-500 bg-gray-50 dark:bg-gray-900 opacity-70' : 'border-primary-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  disabled={todo.title && todo.title.startsWith('[ê³¼ì œ]')}
                  className={`mt-1 w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 ${
                    todo.title && todo.title.startsWith('[ê³¼ì œ]') 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'cursor-pointer'
                  }`}
                  title={todo.title && todo.title.startsWith('[ê³¼ì œ]') ? 'ê³¼ì œëŠ” ì œì¶œ ì‹œìŠ¤í…œì„ í†µí•´ì„œë§Œ ì™„ë£Œí•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.' : ''}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xl font-bold ${
                        todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.title && todo.title.startsWith('[ê³¼ì œ]') && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                        ì œì¶œ í•„ìš”
                      </span>
                    )}
                  </div>
                  {todo.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{todo.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm">
                    {(todo.relatedCourse || todo.courseName) && (
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
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
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {todo.priority === 'HIGH' ? 'ë†’ìŒ' : todo.priority === 'MEDIUM' ? 'ë³´í†µ' : 'ë‚®ìŒ'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                ìƒˆ í•  ì¼ ì¶”ê°€
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ì œëª© *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="í•  ì¼ ì œëª©"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ì„¤ëª…</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ìƒì„¸ ì„¤ëª… (ì„ íƒ)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ë§ˆê°ì¼</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ìš°ì„ ìˆœìœ„</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LOW">ë‚®ìŒ</option>
                    <option value="MEDIUM">ë³´í†µ</option>
                    <option value="HIGH">ë†’ìŒ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ê°•ì˜</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">ì„ íƒ ì•ˆ í•¨</option>
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
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                >
                  ì·¨ì†Œ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg"
                >
                  ì¶”ê°€
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

