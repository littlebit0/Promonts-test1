import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CheckSquare, Award, Calendar, UserCircle, Search, Shield, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

function Navbar({ user, onLogout }) {
  const isAdmin = user.role === 'ADMIN';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600 flex items-center gap-2">
            <div className="bg-primary-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
              P
            </div>
            Promonts
          </Link>

          {/* Navigation Links */}
          <nav className="flex gap-1">
            {isAdmin ? (
              // 관리자 전용 메뉴
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium transition-all"
              >
                <Shield className="w-4 h-4" />
                관리자
              </Link>
            ) : (
              // 일반 사용자 메뉴
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  대시보드
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  강의
                </Link>
                <Link
                  to="/todos"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  할 일
                </Link>
                <Link
                  to="/grades"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <Award className="w-4 h-4" />
                  성적
                </Link>
                <Link
                  to="/calendar"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  일정
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <UserCircle className="w-4 h-4" />
                  프로필
                </Link>
                <Link
                  to="/search"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg font-medium transition-all"
                >
                  <Search className="w-4 h-4" />
                  검색
                </Link>
              </>
            )}
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
              <div className={`text-xs ${isAdmin ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                {user.role === 'ADMIN' ? '관리자' : user.role === 'PROFESSOR' ? '교수' : '학생'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
