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
      alert('과제 정보를 불러올 수 없습니다.');
    }
  };

  const handleTodoClick = (todo) => {
    // 과제 Todo면 과제 상세로
    if (todo.assignmentId) {
      handleAssignmentClick(todo.assignmentId);
    } else {
      // 일반 Todo면 Todo 상세 모달
      setSelectedTodo(todo);
      setShowTodoDetailModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">안녕하세요, {user.name}님! 👋</h1>
        <p className="text-primary-100">오늘도 좋은 하루 보내세요!</p>
      </div>

      {/* Stats Grid */}
      {dashboard?.userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 총 강의 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">총 강의</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.totalCourses}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          {/* 총 할 일 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">총 할 일</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.totalTodos}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>

          {/* 완료한 할 일 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">완료한 할 일</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboard.userStats.completedTodos}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* 대기 중인 과제 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">대기 중인 과제</p>
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
            내 강의
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{courses.length}개</span>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-400 text-center py-8">등록된 강의가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all bg-white dark:bg-gray-850"
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
                  강의 상세
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
            할 일
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{todos.filter(t => !t.completed).length}개 남음</span>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">할 일이 없습니다.</p>
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
                    disabled={todo.title && todo.title.startsWith('[과제]')}
                    className={`mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 ${
                      todo.title && todo.title.startsWith('[과제]') 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer'
                    }`}
                    title={todo.title && todo.title.startsWith('[과제]') ? '과제는 제출 시스템을 통해서만 완료할 수 있습니다.' : ''}
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
                        마감: {new Date(todo.dueDate).toLocaleDateString('ko-KR')}
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
                      {todo.priority === 'HIGH' ? '높음' : todo.priority === 'MEDIUM' ? '보통' : '낮음'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 다가오는 일정 섹션 제거됨 - 학사행정 페이지에서 확인 */}

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
                  마감일: {new Date(selectedAssignment.dueDate).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {new Date(selectedAssignment.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 font-medium mt-2">⚠️ 마감일이 지났습니다!</p>
                )}
                {new Date(selectedAssignment.dueDate) > new Date() && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    남은 시간: {Math.ceil((new Date(selectedAssignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}일
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">과제 내용</h3>
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
                  강의 페이지로 이동
                </button>
                <button
                  onClick={() => setShowAssignmentDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-all"
                >
                  닫기
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
                    마감일: {new Date(selectedTodo.dueDate).toLocaleString('ko-KR')}
                  </div>
                </div>
              )}

              {/* Priority */}
              {selectedTodo.priority && (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-gray-100">우선순위:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      selectedTodo.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : selectedTodo.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {selectedTodo.priority === 'HIGH' ? '높음' : selectedTodo.priority === 'MEDIUM' ? '보통' : '낮음'}
                  </span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 dark:text-gray-100">상태:</span>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    selectedTodo.completed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {selectedTodo.completed ? '완료' : '진행 중'}
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
                  {selectedTodo.completed ? '미완료로 변경' : '완료로 변경'}
                </button>
                <button
                  onClick={() => setShowTodoDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-all"
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

export default Dashboard;
