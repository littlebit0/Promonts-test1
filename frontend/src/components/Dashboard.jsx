import { useEffect, useState } from 'react';
import { courseAPI, todoAPI, dashboardAPI } from '../services/api';

function Dashboard({ user, onLogout }) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Promonts</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role === 'PROFESSOR' ? '교수' : '학생'})
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {dashboard?.userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">총 강의</div>
              <div className="text-3xl font-bold text-blue-600">{dashboard.userStats.totalCourses}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">총 할 일</div>
              <div className="text-3xl font-bold text-purple-600">{dashboard.userStats.totalTodos}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">완료한 할 일</div>
              <div className="text-3xl font-bold text-green-600">{dashboard.userStats.completedTodos}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">대기 중인 과제</div>
              <div className="text-3xl font-bold text-orange-600">{dashboard.userStats.pendingAssignments}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">내 강의</h2>
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">등록된 강의가 없습니다.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.code}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.professorName} · {course.semester} ({course.year})
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Todos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">할 일</h2>
            <div className="space-y-3">
              {todos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">할 일이 없습니다.</p>
              ) : (
                todos.slice(0, 10).map((todo) => (
                  <div
                    key={todo.id}
                    className={`border border-gray-200 rounded-lg p-4 flex items-start gap-3 ${
                      todo.completed ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      {todo.courseName && (
                        <p className="text-xs text-gray-500 mt-1">{todo.courseName}</p>
                      )}
                      {todo.dueDate && (
                        <p className="text-xs text-orange-600 mt-1">
                          마감: {new Date(todo.dueDate).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                    {todo.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          todo.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : todo.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {todo.priority === 'HIGH' ? '높음' : todo.priority === 'MEDIUM' ? '보통' : '낮음'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Items */}
        {dashboard?.upcomingItems && dashboard.upcomingItems.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">다가오는 일정</h2>
            <div className="space-y-3">
              {dashboard.upcomingItems.map((item, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.courseName}</p>
                    </div>
                    <span className="text-sm text-orange-600 font-medium">
                      {new Date(item.dueDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
