import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, Award, Calendar,
  UserCircle, Search, Shield, LogOut, Menu, X, Bell, BarChart2,
  MessageSquare, FileText, ClipboardList, QrCode
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/todos', icon: CheckSquare, label: 'Todo' },
  { to: '/courses', icon: BookOpen, label: '강의' },
  { to: '/assignments', icon: FileText, label: '과제' },
  { to: '/grades', icon: Award, label: '성적' },
  { to: '/calendar', icon: Calendar, label: '일정' },
  { to: '/attendance', icon: QrCode, label: '출석' },
  { to: '/notices', icon: ClipboardList, label: '공지' },
  { to: '/chat', icon: MessageSquare, label: '채팅' },
  { to: '/notifications', icon: Bell, label: '알림' },
  { to: '/stats', icon: BarChart2, label: '통계' },
  { to: '/search', icon: Search, label: '검색' },
  { to: '/profile', icon: UserCircle, label: '프로필' },
];

// 상단 Nav에 표시할 주요 항목 (PC)
const MAIN_NAV = ['/', '/todos', '/grades', '/calendar', '/search', '/profile'];

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user.role === 'ADMIN';
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-primary-600 flex items-center gap-2 shrink-0">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                P
              </div>
              <span className="hidden sm:block">Promonts</span>
            </Link>

            {/* PC 네비게이션 */}
            <nav className="hidden lg:flex gap-1">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/admin')
                      ? 'text-red-600 bg-red-50 dark:bg-red-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  관리자
                </Link>
              ) : (
                MAIN_NAV.map((path) => {
                  const item = NAV_ITEMS.find((n) => n.to === path);
                  if (!item) return null;
                  const { icon: Icon, label } = item;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                        isActive(path)
                          ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })
              )}
            </nav>

            {/* 우측: 테마 토글 + 유저 + 로그아웃 + 햄버거 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              {/* 유저 정보 (SM 이상) */}
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</div>
                <div className={`text-xs ${isAdmin ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {user.role === 'ADMIN' ? '관리자' : user.role === 'PROFESSOR' ? '교수' : '학생'}
                </div>
              </div>

              {/* 로그아웃 버튼 (PC) */}
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">로그아웃</span>
              </button>

              {/* 햄버거 버튼 (모바일/태블릿) */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 드로어 오버레이 */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 모바일 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 드로어 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
            <div className={`text-xs ${isAdmin ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
              {user.role === 'ADMIN' ? '관리자' : user.role === 'PROFESSOR' ? '교수' : '학생'}
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 드로어 메뉴 */}
        <nav className="p-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {isAdmin ? (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/30 font-bold"
            >
              <Shield className="w-5 h-5" />
              관리자 패널
            </Link>
          ) : (
            <div className="space-y-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(to)
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* 드로어 푸터 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => { setMenuOpen(false); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </div>

      {/* 모바일 하단 탭 바 (핵심 5개) */}
      {!isAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-30 safe-area-pb">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { to: '/', icon: LayoutDashboard, label: '홈' },
              { to: '/courses', icon: BookOpen, label: '강의' },
              { to: '/todos', icon: CheckSquare, label: 'Todo' },
              { to: '/notifications', icon: Bell, label: '알림' },
              { to: '/profile', icon: UserCircle, label: '프로필' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                  isActive(to)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive(to) ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
