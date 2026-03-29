import { useState, useCallback, useRef } from 'react';
import { Search, BookOpen, FileText, Bell, X, Clock, ChevronRight } from 'lucide-react';
import { searchAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// 검색어 하이라이팅 컴포넌트
function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-yellow-100 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

const TABS = [
  { key: 'all', label: '전체', icon: Search },
  { key: 'courses', label: '강의', icon: BookOpen },
  { key: 'notices', label: '공지', icon: Bell },
  { key: 'assignments', label: '과제', icon: FileText },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('searchHistory') || '[]'); } catch { return []; }
  });
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await searchAPI.search(q);
      setResults(res.data);
      // 검색 기록 저장
      setSearchHistory((prev) => {
        const next = [q, ...prev.filter((h) => h !== q)].slice(0, 8);
        localStorage.setItem('searchHistory', JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    // debounce 500ms
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const handleHistoryClick = (h) => {
    setQuery(h);
    doSearch(h);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const clearQuery = () => {
    setQuery('');
    setResults(null);
    clearTimeout(debounceRef.current);
  };

  // 탭별 결과 집계
  const totalCount = results
    ? (results.courses?.length || 0) + (results.notices?.length || 0) + (results.assignments?.length || 0)
    : 0;

  const tabCounts = results
    ? {
        all: totalCount,
        courses: results.courses?.length || 0,
        notices: results.notices?.length || 0,
        assignments: results.assignments?.length || 0,
      }
    : {};

  const showCourses = activeTab === 'all' || activeTab === 'courses';
  const showNotices = activeTab === 'all' || activeTab === 'notices';
  const showAssignments = activeTab === 'all' || activeTab === 'assignments';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Search className="w-8 h-8" />
          통합 검색
        </h1>
        <p className="text-gray-300">강의, 공지사항, 과제를 한 번에 검색하세요</p>
      </div>

      {/* 검색 입력 */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="검색어를 입력하세요... (강의명, 공지, 과제)"
              autoFocus
              className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>

      {/* 검색 기록 (결과 없을 때) */}
      {!results && !loading && searchHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              최근 검색어
            </p>
            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(h)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Search className="w-3 h-3" />
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">검색 중...</p>
        </div>
      )}

      {/* 결과 */}
      {results && !loading && (
        <div className="space-y-4">
          {/* 탭 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 flex gap-1 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-gray-800 dark:bg-gray-600 text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {results && tabCounts[key] !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tabCounts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 결과 없음 */}
          {totalCount === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-bold">검색 결과가 없습니다</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                <span className="font-semibold">"{query}"</span>에 대한 결과를 찾을 수 없습니다.
              </p>
            </div>
          )}

          {/* 강의 결과 */}
          {showCourses && results.courses?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-gray-800 dark:text-white">강의</span>
                <span className="ml-auto text-sm text-gray-400">{results.courses.length}개</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {results.courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        <Highlight text={course.name} query={query} />
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <Highlight text={course.code} query={query} />
                        {course.professorName && ` · ${course.professorName}`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 공지 결과 */}
          {showNotices && results.notices?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-800 dark:text-white">공지사항</span>
                <span className="ml-auto text-sm text-gray-400">{results.notices.length}개</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {results.notices.map((notice) => (
                  <div key={notice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white">
                          <Highlight text={notice.title} query={query} />
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          <Highlight text={notice.content} query={query} />
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                          {notice.courseName && ` · ${notice.courseName}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 과제 결과 */}
          {showAssignments && results.assignments?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-bold text-gray-800 dark:text-white">과제</span>
                <span className="ml-auto text-sm text-gray-400">{results.assignments.length}개</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {results.assignments.map((assignment) => {
                  const due = new Date(assignment.dueDate);
                  const isOverdue = due < new Date();
                  return (
                    <div key={assignment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white">
                            <Highlight text={assignment.title} query={query} />
                          </p>
                          {assignment.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              <Highlight text={assignment.description} query={query} />
                            </p>
                          )}
                          <p className={`text-xs mt-1.5 font-bold ${isOverdue ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                            마감: {due.toLocaleDateString('ko-KR')} {due.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            {isOverdue && ' (마감)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
