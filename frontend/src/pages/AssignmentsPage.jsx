import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useEffect, useState } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { courseAPI, assignmentAPI, submissionAPI } from '../services/api';
import { FileText, Plus, Trash2, Calendar, BookOpen, AlertCircle, Upload, CheckCircle, Users, X, Download, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function AssignmentsPage({ user }) {
  const [courses, setCourses] = useState([]);
  const toast = useToast();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // 제출 관련 상태
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState({});

  // 교수용: 제출 목록 모달
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeInput, setGradeInput] = useState({ score: '', feedback: '' });

  const isProfessor = user.role === 'PROFESSOR';
  // ESC 키로 모달 닫기
  useEscapeKey(() => {
    if (showSubmissionsModal) { setShowSubmissionsModal(false); return; }
    if (showSubmitModal) { setShowSubmitModal(false); return; }
    if (showModal) setShowModal(false);
  }, showModal || showSubmitModal || showSubmissionsModal);
  const isStudent = user.role === 'STUDENT';

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (courseId) => {
    try {
      const response = await assignmentAPI.getAllByCourse(courseId);
      setAssignments(response.data);
      // 학생: 각 과제별 내 제출 여부 확인
      if (isStudent) {
        response.data.forEach((assignment) => {
          loadMySubmission(assignment.id);
        });
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadMySubmission = async (assignmentId) => {
    try {
      const response = await submissionAPI.getMy(assignmentId);
      if (response.data) {
        setMySubmissions((prev) => ({ ...prev, [assignmentId]: response.data }));
      }
    } catch (error) {
      // 제출 없음 (404) — 정상
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.create(selectedCourse, formData);
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '' });
      loadAssignments(selectedCourse);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.success('과제 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await assignmentAPI.delete(id);
      loadAssignments(selectedCourse);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 학생: 과제 제출
  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitContent('');
    setSubmitFile(null);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitContent && !submitFile) {
      toast.info('내용 또는 파일을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submitContent) formData.append('content', submitContent);
      if (submitFile) formData.append('file', submitFile);
      await submissionAPI.submit(selectedAssignment.id, formData);
      setShowSubmitModal(false);
      loadMySubmission(selectedAssignment.id);
      toast.success('제출 완료!');
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (submissionId, assignmentId) => {
    if (!confirm('제출을 취소하시겠습니까?')) return;
    try {
      await submissionAPI.delete(submissionId);
      setMySubmissions((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
    } catch (error) {
      toast.error('제출 취소에 실패했습니다.');
    }
  };

  // 교수: 제출 목록 보기
  const openSubmissionsModal = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    setGradingId(null);
    try {
      const response = await submissionAPI.getByAssignment(assignment.id);
      setSubmissionsList(response.data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 교수: 채점
  const handleGrade = async (submissionId) => {
    if (!gradeInput.score && gradeInput.score !== 0) { toast.info('점수를 입력하세요.'); return; }
    try {
      await submissionAPI.grade(submissionId, gradeInput.score, gradeInput.feedback);
      setSubmissionsList(prev => prev.map(s =>
        s.id === submissionId ? { ...s, score: parseInt(gradeInput.score), feedback: gradeInput.feedback } : s
      ));
      setGradingId(null);
      setGradeInput({ score: '', feedback: '' });
    } catch (e) {
      toast.error('채점에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 강의가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8" />
              과제 관리
            </h1>
            <p className="text-accent-100">{assignments.length}개의 과제</p>
          </div>
          {isProfessor && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-accent-700 rounded-lg hover:bg-accent-50 transition-all font-bold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              새 과제
            </button>
          )}
        </div>
      </div>

      {/* Course Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          강의 선택
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-accent-500 font-medium"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <EmptyState
            type="assignment"
            desc={isProfessor ? '첫 번째 과제를 만들어보세요!' : '등록된 과제가 없어요'}
          />
        ) : (
          assignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now;
            const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            const mySubmission = mySubmissions[assignment.id];
            const isSubmitted = !!mySubmission;

            return (
              <div
                key={assignment.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border-l-4 ${
                  isSubmitted
                    ? 'border-green-500'
                    : isOverdue
                    ? 'border-red-500'
                    : 'border-accent-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-6 h-6 text-accent-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                          {isSubmitted && (
                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                              <CheckCircle className="w-3 h-3" />
                              제출 완료
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{assignment.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        {assignment.courseName}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          isOverdue ? 'text-red-600' : 'text-accent-600'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        마감: {dueDate.toLocaleDateString('ko-KR')} {dueDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isOverdue && daysLeft <= 3 && (
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <AlertCircle className="w-4 h-4" />
                          {daysLeft}일 남음
                        </span>
                      )}
                    </div>

                    {/* 제출 내용 미리보기 (학생) */}
                    {isStudent && isSubmitted && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-700 dark:text-green-400 font-bold mb-1">제출 내용</p>
                        {mySubmission.content && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{mySubmission.content}</p>
                        )}
                        {mySubmission.fileName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Download className="w-3 h-3" />
                            {mySubmission.fileName}
                          </p>
                        )}
                        {mySubmission.score !== null && mySubmission.score !== undefined && (
                          <p className="text-sm font-bold text-green-700 mt-1">점수: {mySubmission.score}점</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {/* 학생: 제출/취소 버튼 */}
                    {isStudent && (
                      <>
                        {!isSubmitted ? (
                          <button
                            onClick={() => openSubmitModal(assignment)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                              isOverdue
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow'
                                : 'bg-accent-600 text-white hover:bg-accent-700 shadow'
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            {isOverdue ? '지각 제출' : '제출하기'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteSubmission(mySubmission.id, assignment.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800"
                          >
                            <X className="w-4 h-4" />
                            제출 취소
                          </button>
                        )}
                      </>
                    )}

                    {/* 교수: 제출 목록 + 삭제 */}
                    {isProfessor && (
                      <>
                        <button
                          onClick={() => openSubmissionsModal(assignment)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-sm transition-all border border-blue-200"
                        >
                          <Users className="w-4 h-4" />
                          제출 목록
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 과제 등록 모달 (교수) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-accent-500 to-accent-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                새 과제 등록
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">과제 제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="예: 3장 연습문제"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">과제 설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="과제 상세 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">마감일 *</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all font-bold shadow-lg"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 과제 제출 모달 (학생) */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Upload className="w-6 h-6" />
                과제 제출
              </h2>
              <button onClick={() => setShowSubmitModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-bold text-gray-800 dark:text-white mb-1">{selectedAssignment.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                마감: {new Date(selectedAssignment.dueDate).toLocaleString('ko-KR')}
              </p>
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">제출 내용</label>
                  <textarea
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    placeholder="과제 내용을 입력하세요..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    파일 첨부 <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSubmitFile(e.target.files[0])}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                  />
                  {submitFile && (
                    <p className="text-xs text-gray-500 mt-1">선택된 파일: {submitFile.name}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '제출 중...' : '제출하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 제출 목록 모달 (교수) */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                제출 목록
              </h2>
              <button onClick={() => setShowSubmissionsModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="font-bold text-gray-800 dark:text-white mb-4">{selectedAssignment.title}</p>
              {loadingSubmissions ? (
                <div className="text-center py-8 text-gray-400">로딩 중...</div>
              ) : submissionsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  아직 제출한 학생이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionsList.map((sub) => (
                    <div key={sub.id} className={`p-4 rounded-xl border ${
                      sub.isLate
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 dark:text-white">{sub.studentName || sub.userName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(sub.submittedAt).toLocaleString('ko-KR')}
                            {sub.isLate && (
                              <span className="ml-2 inline-flex items-center gap-0.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                ⚠️ 지각 제출
                              </span>
                            )}
                          </p>
                          {sub.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{sub.content}</p>
                          )}
                          {sub.fileName && (
                            <a
                              href={`${API_BASE}/submissions/${sub.id}/download`}
                              target="_blank" rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1 w-fit"
                            >
                              <Download className="w-3 h-3" />{sub.fileName}
                            </a>
                          )}
                        </div>

                        {/* 채점 영역 */}
                        <div className="shrink-0 text-right">
                          {gradingId === sub.id ? (
                            <div className="flex flex-col gap-2 items-end">
                              <input
                                type="number" min="0" max="100"
                                value={gradeInput.score}
                                onChange={e => setGradeInput(p => ({ ...p, score: e.target.value }))}
                                placeholder="점수"
                                className="w-20 px-2 py-1 text-sm border-2 border-blue-300 rounded-lg dark:bg-gray-600 dark:text-white text-center"
                              />
                              <input
                                type="text"
                                value={gradeInput.feedback}
                                onChange={e => setGradeInput(p => ({ ...p, feedback: e.target.value }))}
                                placeholder="피드백 (선택)"
                                className="w-40 px-2 py-1 text-sm border border-gray-300 rounded-lg dark:bg-gray-600 dark:text-white"
                              />
                              <div className="flex gap-1">
                                <button onClick={() => handleGrade(sub.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">
                                  저장
                                </button>
                                <button onClick={() => setGradingId(null)}
                                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 transition">
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              {sub.score !== null && sub.score !== undefined ? (
                                <>
                                  <span className="text-lg font-bold text-green-600">{sub.score}점</span>
                                  {sub.feedback && <p className="text-xs text-gray-500 max-w-[120px] text-right">{sub.feedback}</p>}
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">미채점</span>
                              )}
                              <button
                                onClick={() => { setGradingId(sub.id); setGradeInput({ score: sub.score ?? '', feedback: sub.feedback ?? '' }); }}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-100 transition mt-1"
                              >
                                <Star className="w-3 h-3" />채점
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsPage;
