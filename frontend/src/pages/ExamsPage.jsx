import { useState, useEffect } from 'react';
import { FileText, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { examAPI, courseAPI } from '../services/api';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesRes = await courseAPI.getMy();
      setCourses(coursesRes.data);
      
      const allExams = [];
      for (const course of coursesRes.data) {
        const examsRes = await examAPI.getByCourse(course.id);
        allExams.push(...examsRes.data);
      }
      setExams(allExams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeLabel = (type) => {
    const labels = {
      MIDTERM: '중간고사',
      FINAL: '기말고사',
      QUIZ: '퀴즈',
      PRACTICE: '모의고사',
    };
    return labels[type] || type;
  };

  const getExamTypeColor = (type) => {
    const colors = {
      MIDTERM: 'bg-blue-100 text-blue-700',
      FINAL: 'bg-red-100 text-red-700',
      QUIZ: 'bg-green-100 text-green-700',
      PRACTICE: 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="text-center py-12">로딩 중...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-600" />
        시험
      </h1>

      {exams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">시험 일정이 없습니다</div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{exam.title}</h3>
                  <p className="text-gray-600">{exam.course.name}</p>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${getExamTypeColor(exam.examType)}`}>
                  {getExamTypeLabel(exam.examType)}
                </div>
              </div>

              {exam.description && (
                <p className="text-gray-700 mb-4">{exam.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <span>{new Date(exam.examDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">시험 시간:</span>
                  <span className="font-medium">{exam.durationMinutes}분</span>
                </div>
                {exam.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{exam.location}</span>
                  </div>
                )}
              </div>

              {exam.totalScore && (
                <div className="mt-4 text-sm">
                  <span className="text-gray-500">배점:</span> <span className="font-medium">{exam.totalScore}점</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
