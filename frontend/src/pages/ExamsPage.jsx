import { useToast } from '../components/Toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useState, useEffect } from 'react';
import { FileText, Calendar as CalendarIcon, MapPin, Clock, Award, Plus, Trash2, X } from 'lucide-react';
import { examAPI, courseAPI } from '../services/api';
import { useEscapeKey } from '../hooks/useEscapeKey';

const EXAM_TYPE = {
  MIDTERM:  { label: '중간고사', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  FINAL:    { label: '기말고사', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  QUIZ:     { label: '퀴즈',     color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  PRACTICE: { label: '실습시험', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
};

export default function ExamsPage({ user }) {
  const [exams, setExams] = useState([]);
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', examType: 'MIDTERM', examDate: '', durationMinutes: 90, location: '', description: '', totalScore: 100 });

  const isProfessor = user?.role === 'PROFESSOR';

  useEscapeKey(() => setShowModal(false), showModal);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const coursesRes = await courseAPI.getAll();
      setCourses(coursesRes.data);
      const allExams = [];
      for (const course of coursesRes.data) {
        try {
          const examsRes = await examAPI.getByCourse(course.id);
          allExams.push(...examsRes.data.map(e => ({ ...e, courseName: course.name })));
        } catch {}
      }
      setExams(allExams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await examAPI.create(form.courseId, {
        title: form.title,
        examType: form.examType,
        examDate: new Date(form.examDate).toISOString(),
        durationMinutes: parseInt(form.durationMinutes),
        location: form.location,
        description: form.description,
        totalScore: parseInt(form.totalScore),
      });
      setShowModal(false);
      fetchData();
    } catch (e) {
      toast.error('시험 등록 실패: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await examAPI.delete(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
    } catch (e) {
      toast.error('삭제 실패');
    }
  };

  const getDDay = (examDate) => {
    const diff = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: '종료', color: 'text-gray-400' };
    if (diff === 0) return { text: 'D-Day', color: 'text-red-600 font-bold' };
    if (diff <= 7) return { text: `D-${diff}`, color: 'text-red-500 font-bold' };
    return { text: `D-${diff}`, color: 'text-gray-600 dark:text-gray-400' };
  };

  if (loading) return <div className="max-w-6xl mx-auto p-6"><PageSkeleton /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
          <FileText className="w-8 h-8 text-blue-600" />
          시험
        </h1>
        {isProfessor && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold">
            <Plus className="w-4 h-4" />시험 등록
          </button>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">등록된 시험이 없습니다</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const type = EXAM_TYPE[exam.examType] || { label: exam.examType, color: 'bg-gray-100 text-gray-700' };
            const dday = getDDay(exam.examDate);
            const isPast = new Date(exam.examDate) < new Date();
            return (
              <div key={exam.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 ${isPast ? 'border-gray-300 dark:border-gray-600 opacity-70' : 'border-blue-500'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xl font-bold dark:text-white">{exam.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${type.color}`}>{type.label}</span>
                      <span className={`text-sm font-bold ${dday.color}`}>{dday.text}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exam.courseName || exam.course?.name}</p>
                  </div>
                  {isProfessor && (
                    <button onClick={() => handleDelete(exam.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {exam.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{exam.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(exam.examDate).toLocaleString('ko-KR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />{exam.durationMinutes}분
                  </span>
                  {exam.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />{exam.location}
                    </span>
                  )}
                  {exam.totalScore && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />{exam.totalScore}점
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 시험 등록 모달 (교수) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">시험 등록</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">강의</label>
                <select required value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="">강의 선택</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">제목</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">시험 종류</label>
                  <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    {Object.entries(EXAM_TYPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">시험 시간 (분)</label>
                  <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">시험 일시</label>
                <input required type="datetime-local" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">장소</label>
                  <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="예: 공학관 301"
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">총점</label>
                  <input type="number" value={form.totalScore} onChange={e => setForm({ ...form, totalScore: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">설명</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition">
                  취소
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
