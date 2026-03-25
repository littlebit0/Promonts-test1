import { Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, CheckSquare, FileText, Bell, MessageCircle, LogOut } from 'lucide-react';

function Navbar({ user, onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
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
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              대시보드
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <BookOpen className="w-4 h-4" />
              강의
            </Link>
            <Link
              to="/todos"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              할 일
            </Link>
            <Link
              to="/assignments"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <FileText className="w-4 h-4" />
              과제
            </Link>
            <Link
              to="/notices"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <Bell className="w-4 h-4" />
              공지사항
            </Link>
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              채팅
            </Link>
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">
                {user.role === 'PROFESSOR' ? '교수' : '학생'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
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
