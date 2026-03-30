import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, todoAPI, dashboardAPI, assignmentAPI } from '../services/api';
import { BookOpen, CheckCircle2, FileText, AlertCircle, Calendar, ChevronRight, Users, X } from 'lucide-react';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  const [showTodoDetailModal, setShowTodoDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, coursesRes, todosRes] = await Promise.all([
        dashboardAPI.get(),
        courseAPI.getAll(),
        todoAPI.getAll(),
      ]);
      setDashboard(dashRes.data);
      setCourses(coursesRes.data);
      setTodos(todosRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      await todoAPI.toggle(id);
      loadData();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleAssignmentClick = async (assignmentId) => {
    try {
      const response = await assignmentAPI.getById(assignmentId);
      setSelectedAssignment(response.data);
      setShowAssignmentDetailModal(true);
    } catch (error) {
      console.error('Failed to load assignment:', error);
      alert('ê³¼ì œ ì •ë³´ë¥¼ ë¶ˆëŸ¬ì˜¬ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.');
    }
  };

  const handleTodoClick = (todo) => {
    // ê³¼ì œ Todoë©´ ê³¼ì œ ìƒì„¸ë¡œ
    if (todo.assignmentId) {
      handleAssignmentClick(todo.assignmentId);
    } else {
      // ì¼ë°˜ Todoë©´ Todo ìƒì„¸ ëª¨ë‹¬
      setSelectedTodo(todo);
      setShowTodoDetailModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">ë¡œë”© ì¤‘...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">ì•ˆë…•í•˜ì„¸ìš”, {user.name}ë‹˜! ðŸ‘‹</h1>
        <p className="text-primary-100">ì˜¤ëŠ˜ë„ ì¢‹ì€ í•˜ë£¨ ë³´ë‚´ì„¸ìš”!</p>
      </div>

      {/* Stats Grid */}
      {dashboard?.userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ì´ ê°•ì˜ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ì´ ê°•ì˜</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.totalCourses}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          {/* ì´ í•  ì¼ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ì´ í•  ì¼</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.totalTodos}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>

          {/* ì™„ë£Œí•œ í•  ì¼ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ì™„ë£Œí•œ í•  ì¼</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.completedTodos}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* ëŒ€ê¸° ì¤‘ì¸ ê³¼ì œ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ëŒ€ê¸° ì¤‘ì¸ ê³¼ì œ</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.pendingAssignments}</p>
              </div>
              <div className="bg-accent-100 dark:bg-accent-900 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            ë‚´ ê°•ì˜
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{courses.length}ê°œ</span>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-400 text-center py-8">ë“±ë¡ëœ ê°•ì˜ê°€ ì—†ìŠµë‹ˆë‹¤.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{course.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-mono font-bold mt-1">{course.code}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{course.professorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{course.semester} ({course.year})</span>
                  </div>
                </div>

                {course.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                )}

                <button
                  onClick={() => handleCourseClick(course.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                >
                  ê°•ì˜ ìƒì„¸
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Todos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            í•  ì¼
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{todos.filter(t => !t.completed).length}ê°œ ë‚¨ìŒ</span>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">í•  ì¼ì´ ì—†ìŠµë‹ˆë‹¤.</p>
          ) : (
            todos.slice(0, 10).map((todo) => (
              <div
                key={todo.id}
                onClick={() => handleTodoClick(todo)}
                className={`group border-2 rounded-lg p-4 transition-all cursor-pointer ${
                  todo.completed
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60'
                    : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleTodo(todo.id);
                    }}
                    disabled={todo.title && todo.title.startsWith('[ê³¼ì œ]')}
                    className={`mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 ${
                      todo.title && todo.title.startsWith('[ê³¼ì œ]') 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer'
                    }`}
                    title={todo.title && todo.title.startsWith('[ê³¼ì œ]') ? 'ê³¼ì œëŠ” ì œì¶œ ì‹œìŠ¤í…œì„ í†µí•´ì„œë§Œ ì™„ë£Œí•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.' : ''}
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        todo.completed ? 'line-through text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.courseName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {todo.courseName}
                      </p>
                    )}
                    {todo.dueDate && (
                      <p className="text-xs text-accent-600 mt-1 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        ë§ˆê°: {new Date(todo.dueDate).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                  {todo.priority && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        todo.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : todo.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {todo.priority === 'HIGH' ? 'ë†’ìŒ' : todo.priority === 'MEDIUM' ? 'ë³´í†µ' : 'ë‚®ìŒ'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Items */}
      {dashboard?.upcomingItems && dashboard.upcomingItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-accent-600" />
            ë‹¤ê°€ì˜¤ëŠ” ì¼ì •
          </h2>
          <div className="space-y-3">
            {dashboard.upcomingItems.map((item, index) => (
              <div
                key={index}
                onClick={() => item.assignmentId && handleAssignmentClick(item.assignmentId)}
                className={`border-l-4 border-accent-500 bg-accent-50 rounded-r-lg pl-4 pr-6 py-4 transition-colors ${
                  item.assignmentId ? 'cursor-pointer hover:bg-accent-100 dark:hover:bg-gray-600' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {item.courseName}
                    </p>
                  </div>
                  <span className="text-sm text-accent-700 font-bold flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.dueDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showAssignmentDetailModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedAssignment.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {selectedAssignment.course?.name} ({selectedAssignment.course?.code})
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Due Date */}
              <div className="bg-accent-50 dark:bg-accent-900 border-l-4 border-accent-500 rounded-r-lg p-4">
                <div className="flex items-center gap-2 text-accent-700 dark:text-accent-300 font-bold">
                  <Calendar className="w-5 h-5" />
                  ë§ˆê°ì¼: {new Date(selectedAssignment.dueDate).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {new Date(selectedAssignment.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 font-medium mt-2">âš ï¸ ë§ˆê°ì¼ì´ ì§€ë‚¬ìŠµë‹ˆë‹¤!</p>
                )}
                {new Date(selectedAssignment.dueDate) > new Date() && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    ë‚¨ì€ ì‹œê°„: {Math.ceil((new Date(selectedAssignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}ì¼
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">ê³¼ì œ ë‚´ìš©</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignmentDetailModal(false);
                    navigate(`/course/${selectedAssignment.course?.id}`);
                  }}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all"
                >
                  ê°•ì˜ íŽ˜ì´ì§€ë¡œ ì´ë™
                </button>
                <button
                  onClick={() => setShowAssignmentDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-all"
                >
                  ë‹«ê¸°
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Todo Detail Modal */}
      {showTodoDetailModal && selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedTodo.title}</h2>
                {selectedTodo.courseName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {selectedTodo.courseName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowTodoDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Due Date */}
              {selectedTodo.dueDate && (
                <div className="bg-accent-50 dark:bg-accent-900 border-l-4 border-accent-500 rounded-r-lg p-4">
                  <div className="flex items-center gap-2 text-accent-700 dark:text-accent-300 font-bold">
                    <Calendar className="w-5 h-5" />
                    ë§ˆê°ì¼: {new Date(selectedTodo.dueDate).toLocaleString('ko-KR')}
                  </div>
                </div>
              )}

              {/* Priority */}
              {selectedTodo.priority && (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-gray-100">ìš°ì„ ìˆœìœ„:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      selectedTodo.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : selectedTodo.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {selectedTodo.priority === 'HIGH' ? 'ë†’ìŒ' : selectedTodo.priority === 'MEDIUM' ? 'ë³´í†µ' : 'ë‚®ìŒ'}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 dark:text-gray-100">ìƒíƒœ:</span>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    selectedTodo.completed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {selectedTodo.completed ? 'ì™„ë£Œ' : 'ì§„í–‰ ì¤‘'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleToggleTodo(selectedTodo.id);
                    setShowTodoDetailModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                >
                  {selectedTodo.completed ? 'ë¯¸ì™„ë£Œë¡œ ë³€ê²½' : 'ì™„ë£Œë¡œ ë³€ê²½'}
                </button>
                <button
                  onClick={() => setShowTodoDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-all"
                >
                  ë‹«ê¸°
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

