import { useState } from 'react';
import { Search, Book, FileText, Bell } from 'lucide-react';
import { searchAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await searchAPI.search(query);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert('검색 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Search className="w-8 h-8 text-blue-600" />
        검색
      </h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="강의, 공지, 과제 검색..."
            className="flex-1 px-4 py-3 border rounded-lg text-lg"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={loading}
          >
            <Search className="w-5 h-5" />
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>

      {results && (
        <div className="space-y-6">
          {/* 강의 결과 */}
          {results.courses?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Book className="w-6 h-6 text-blue-600" />
                강의 ({results.courses.length})
              </h2>
              <div className="grid gap-3">
                {results.courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer"
                  >
                    <h3 className="font-bold">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                    {course.description && <p className="text-sm text-gray-500 mt-2">{course.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 공지 결과 */}
          {results.notices?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Bell className="w-6 h-6 text-orange-600" />
                공지 ({results.notices.length})
              </h2>
              <div className="grid gap-3">
                {results.notices.map((notice) => (
                  <div key={notice.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold">{notice.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notice.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 과제 결과 */}
          {results.assignments?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                과제 ({results.assignments.length})
              </h2>
              <div className="grid gap-3">
                {results.assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    <p className="text-xs text-red-600 mt-2">마감: {new Date(assignment.dueDate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.courses?.length === 0 && results.notices?.length === 0 && results.assignments?.length === 0 && (
            <div className="text-center py-12 text-gray-500">검색 결과가 없습니다</div>
          )}
        </div>
      )}
    </div>
  );
}
