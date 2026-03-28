import { useState, useEffect } from 'react';
import { Award, TrendingUp, BarChart3 } from 'lucide-react';
import { gradeAPI } from '../services/api';
import { GradesTrendChart, GradesDistributionChart, LetterGradeChart, GradesSummary } from '../components/GradesChart';

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await gradeAPI.getMy();
      setGrades(res.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-200';
    if (grade.startsWith('A')) return 'bg-green-600 text-white';
    if (grade.startsWith('B')) return 'bg-blue-600 text-white';
    if (grade.startsWith('C')) return 'bg-yellow-600 text-white';
    if (grade.startsWith('D')) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  if (loading) return <div className="text-center py-12">로딩 중...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="w-8 h-8 text-blue-600" />
          성적
        </h1>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <BarChart3 className="w-5 h-5" />
          {showCharts ? '그래프 숨기기' : '그래프 보기'}
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">성적 정보가 없습니다</div>
      ) : (
        <>
          {/* 평균 성적 요약 */}
          {showCharts && (
            <div className="space-y-6">
              <GradesSummary grades={grades} />

              {/* 그래프 영역 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">성적 추이</h3>
                  <GradesTrendChart grades={grades} />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-4">학점 분포</h3>
                  <LetterGradeChart grades={grades} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">성적 분포 (카테고리별)</h3>
                <GradesDistributionChart grades={grades} />
              </div>
            </div>
          )}

          {/* 상세 성적 리스트 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">상세 성적</h2>
            {grades.map((grade) => (
              <div key={grade.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{grade.course.name}</h3>
                  <div className={`px-4 py-2 rounded-full font-bold text-lg ${getGradeColor(grade.letterGrade)}`}>
                    {grade.letterGrade || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">중간고사</span>
                    <p className="text-2xl font-bold">{grade.midtermScore ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">기말고사</span>
                    <p className="text-2xl font-bold">{grade.finalScore ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">과제</span>
                    <p className="text-2xl font-bold">{grade.assignmentScore ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">출석</span>
                    <p className="text-2xl font-bold">{grade.attendanceScore ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      총점
                    </span>
                    <p className="text-2xl font-bold text-blue-600">{grade.totalScore?.toFixed(2) ?? '-'}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  마지막 업데이트: {grade.updatedAt ? new Date(grade.updatedAt).toLocaleString() : '-'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
