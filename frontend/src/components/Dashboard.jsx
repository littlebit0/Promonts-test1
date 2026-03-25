import { useEffect, useState } from 'react';
import { courseAPI, todoAPI, dashboardAPI } from '../services/api';
import { BookOpen, CheckCircle2, FileText, AlertCircle, Calendar, ChevronRight } from 'lucide-react';

function Dashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 강의</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.userStats.totalCourses}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>

          {/* 총 할 일 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 할 일</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.userStats.totalTodos}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-gray-700" />
              </div>
            </div>
          </div>

          {/* 완료한 할 일 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">완료한 할 일</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.userStats.completedTodos}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* 대기 중인 과제 */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">대기 중인 과제</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.userStats.pendingAssignments}</p>
              </div>
              <div className="bg-accent-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-accent-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              내 강의
            </h2>
            <span className="text-sm text-gray-500">{courses.length}개</span>
          </div>
          <div className="space-y-3">
            {courses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">등록된 강의가 없습니다.</p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="group border-2 border-gray-100 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{course.code}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <span>{course.professorName}</span>
                        <span>•</span>
                        <span>{course.semester} ({course.year})</span>
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Todos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              할 일
            </h2>
            <span className="text-sm text-gray-500">{todos.filter(t => !t.completed).length}개 남음</span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {todos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">할 일이 없습니다.</p>
            ) : (
              todos.slice(0, 10).map((todo) => (
                <div
                  key={todo.id}
                  className={`group border-2 rounded-lg p-4 transition-all ${
                    todo.completed
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-100 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${
                          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.courseName && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
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
      </div>

      {/* Upcoming Items */}
      {dashboard?.upcomingItems && dashboard.upcomingItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-accent-600" />
            다가오는 일정
          </h2>
          <div className="space-y-3">
            {dashboard.upcomingItems.map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-accent-500 bg-accent-50 rounded-r-lg pl-4 pr-6 py-4 hover:bg-accent-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
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
    </div>
  );
}

export default Dashboard;
