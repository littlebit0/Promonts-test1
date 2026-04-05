import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare, Award, Calendar,
  UserCircle, Search, Shield, LogOut, Menu, X, Bell, BarChart2,
  MessageSquare, FileText, ClipboardList, QrCode, User, Lock, ChevronRight
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ThemeToggle from './ThemeToggle';
import { profileAPI } from '../services/api';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/todos', icon: CheckSquare, label: 'Todo' },
  { to: '/courses', icon: BookOpen, label: '강의' },
  { to: '/assignments', icon: FileText, label: '과제' },
  { to: '/academic', icon: Award, label: '학사행정' },
  { to: '/calendar', icon: Calendar, label: '일정' },
  { to: '/attendance', icon: QrCode, label: '출석' },
  { to: '/notices', icon: ClipboardList, label: '공지' },
  { to: '/chat', icon: MessageSquare, label: '채팅' },
  { to: '/notifications', icon: Bell, label: '알림' },
  { to: '/stats', icon: BarChart2, label: '통계' },
];

// 상단 Nav에 표시할 주요 항목 (PC) — 검색/프로필은 아이콘으로 별도 처리
const MAIN_NAV = ['/', '/todos', '/assignments', '/academic', '/chat', '/calendar'];

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 모바일 드로어 + 검색 ESC 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (menuOpen) { setMenuOpen(false); return; }
        if (searchOpen) setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [menuOpen, searchOpen]);

  const isAdmin = user.role === 'ADMIN';
  const location = useLocation();
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const stompRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const SERVER_BASE = API_BASE.replace('/api', '');

  // 알림 카운트 (초기 로드)
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(typeof data === 'number' ? data : data?.count || 0);
      }
    } catch (e) {}
  };

  // WebSocket 알림 구독
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id) return;

    // userId 파싱
    let userId = user.id;
    try {
      if (!userId) {
        const saved = localStorage.getItem('user');
        if (saved) userId = JSON.parse(saved).id;
      }
    } catch {}
    if (!userId) return;

    const socket = new SockJS(`${SERVER_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, () => {
          // 새 알림 → 카운트 +1
          setUnreadCount(prev => prev + 1);
        });
      },
    });
    client.activate();
    stompRef.current = client;

    return () => { client.deactivate(); };
  }, [user?.id]);

  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0);
  }, [location.pathname]);

  // 검색창 열릴 때 포커스
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchQuery('');
  }, [searchOpen]);

  // 프로필 모달 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [profileOpen]);

  // 프로필 데이터 로드
  const loadProfile = async () => {
    if (profileData) return;
    setProfileLoading(true);
    try {
      const res = await profileAPI.get();
      setProfileData(res.data);
      setFormData({ name: res.data.name, email: res.data.email });
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileOpen = () => {
    setProfileOpen(!profileOpen);
    if (!profileOpen) loadProfile();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const roleLabel = user.role === 'ADMIN' ? '관리자' : user.role === 'PROFESSOR' ? '교수' : '학생';

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-primary-600 flex items-center gap-2 shrink-0">
              <div className="bg-primary-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">P</div>
              <span className="hidden sm:block">Promonts</span>
            </Link>

            {/* PC 네비게이션 */}
            <nav className="hidden lg:flex gap-1">
              {isAdmin ? (
                <Link to="/admin" className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${isActive('/admin') ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                  <Shield className="w-4 h-4" />관리자
                </Link>
              ) : (
                MAIN_NAV.map((path) => {
                  const item = NAV_ITEMS.find((n) => n.to === path);
                  if (!item) return null;
                  const { icon: Icon, label } = item;
                  return (
                    <Link key={path} to={path} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${isActive(path) ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700'}`}>
                      <Icon className="w-4 h-4" />{label}
                    </Link>
                  );
                })
              )}
            </nav>

            {/* 우측 영역 */}
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />

              {/* 검색 토글 버튼 */}
              {!isAdmin && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2 rounded-lg transition-all ${searchOpen ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  title="검색"
                >
                  {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </button>
              )}

              {/* 프로필 버튼 (이름 클릭) */}
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={handleProfileOpen}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${profileOpen ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user.name}</div>
                    <div className={`text-xs leading-tight ${isAdmin ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{roleLabel}</div>
                  </div>
                </button>

                {/* 프로필 드롭다운 모달 */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-lg leading-tight">{profileData?.name || user.name}</p>
                          <p className="text-primary-100 text-sm">{profileData?.email || user.email}</p>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">{roleLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                        >
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <User className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">프로필 수정</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        </button>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/security'); }}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                        >
                          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <Lock className="w-5 h-5 text-primary-600" />
                            <span className="font-medium">보안 설정</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        </button>
                        <hr className="border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={() => { setProfileOpen(false); onLogout(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">로그아웃</span>
                        </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 로그아웃 (SM 이하) - 프로필 드롭다운에 이미 있어서 모바일 드로어로만 처리 */}

              {/* 햄버거 (모바일) */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 인라인 검색 박스 */}
        {searchOpen && !isAdmin && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="공지사항, 과제, 강의 검색..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <button type="submit" disabled={!searchQuery.trim()}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-40">
                검색
              </button>
              <button type="button" onClick={() => setSearchOpen(false)}
                className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-sm">
                닫기
              </button>
            </form>
          </div>
        )}
      </header>

      {/* 모바일 드로어 오버레이 */}
      {menuOpen && <div className="fixed inset-0 bg-black/75 z-50 lg:hidden" onClick={() => setMenuOpen(false)} />}

      {/* 모바일 드로어 */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
            <div className={`text-xs ${isAdmin ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{roleLabel}</div>
          </div>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {isAdmin ? (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/30 font-bold">
              <Shield className="w-5 h-5" />관리자 패널
            </Link>
          ) : (
            <div className="space-y-1">
              {[...NAV_ITEMS, { to: '/search', icon: Search, label: '검색' }, { to: '/profile', icon: UserCircle, label: '프로필' }].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(to) ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <Icon className="w-5 h-5" />{label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button onClick={() => { setMenuOpen(false); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition font-bold">
            <LogOut className="w-5 h-5" />로그아웃
          </button>
        </div>
      </div>

      {/* 모바일 하단 탭 바 */}
      {!isAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-30 safe-area-pb">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { to: '/', icon: LayoutDashboard, label: '홈' },
              { to: '/assignments', icon: FileText, label: '과제' },
              { to: '/chat', icon: MessageSquare, label: '채팅' },
              { to: '/notifications', icon: Bell, label: '알림', badge: unreadCount },
              { to: '/todos', icon: CheckSquare, label: 'Todo' },
            ].map(({ to, icon: Icon, label, badge }) => (
              <Link key={to} to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive(to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive(to) ? 'scale-110' : ''} transition-transform`} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
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
