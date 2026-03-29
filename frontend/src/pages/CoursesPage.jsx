import { useEffect, useState } from 'react';
import { courseAPI, enrollmentAPI } from '../services/api';
import { BookOpen, Plus, Edit2, Trash2, X, Calendar, User, UserPlus, UserMinus, CheckCircle, Search, Users } from 'lucide-react';

function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1학기',
    year: new Date().getFullYear(),
    description: '',
  });

  // 학생 수강신청 관련 상태
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollLoading, setEnrollLoading] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my'
  const [searchQuery, setSearchQuery] = useState('');

  // 교수: 수강생 목록 모달
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const isProfessor = user.role === 'PROFESSOR';
  const isStudent = user.role === 'STUDENT';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);

      // 학생: 각 강의 수강 여부 확인
      if (isStudent) {
        const enrolled = new Set();
        await Promise.allSettled(
          response.data.map(async (course) => {
            try {
              const res = await enrollmentAPI.checkEnrollment(course.id);
              if (res.data.enrolled) enrolled.add(course.id);
            } catch {}
          })
        );
        setEnrolledIds(enrolled);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // 수강 신청
  const handleEnroll = async (courseId) => {
    setEnrollLoading((prev) => ({ ...prev, [courseId]: true }));
    try {
      await enrollmentAPI.enroll(courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
    } catch (error) {
      alert(error.response?.data?.error || '수강 신청에 실패했습니다.');
    } finally {
      setEnrollLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  // 수강 취소
  const handleUnenroll = async (courseId) => {
    if (!confirm('수강을 취소하시겠습니까?')) return;
    setEnrollLoading((prev) => ({ ...prev, [courseId]: true }));
    try {
      await enrollmentAPI.unenroll(courseId);
      setEnrolledIds((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    } catch (error) {
      alert(error.response?.data?.error || '수강 취소에 실패했습니다.');
    } finally {
      setEnrollLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  // 교수: 수강생 목록
  const openStudentsModal = async (course) => {
    setSelectedCourseForStudents(course);
    setShowStudentsModal(true);
    setLoadingStudents(true);
    try {
      const res = await enrollmentAPI.getEnrollments(course.id);
      setStudentsList(res.data);
    } catch {
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, formData);
      } else {
        await courseAPI.create(formData);
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ name: '', code: '', semester: '1학기', year: new Date().getFullYear(), description: '' });
      loadCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('강의 저장에 실패했습니다.');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester,
      year: course.year,
      description: course.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await courseAPI.delete(id);
      loadCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 필터링
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.professorName && course.professorName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesView = viewMode === 'all' || (viewMode === 'my' && enrolledIds.has(course.id));
    return matchesSearch && matchesView;
  });

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              강의 {isProfessor ? '관리' : '목록'}
            </h1>
            <p className="text-primary-100">
              {isProfessor
                ? `${courses.length}개의 강의 개설`
                : `전체 ${courses.length}개 · 수강 중 ${enrolledIds.size}개`}
            </p>
          </div>
          {isProfessor && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition-all font-bold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              새 강의
            </button>
          )}
        </div>
      </div>

      {/* 학생: 검색 + 탭 필터 */}
      {isStudent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-4 items-center">
          {/* 검색 */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="강의명, 코드, 교수명 검색..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          {/* 탭 */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'all'
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              전체 강의
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1.5 ${
                viewMode === 'my'
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              내 강의 ({enrolledIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {viewMode === 'my' ? '수강 중인 강의가 없습니다.' : '등록된 강의가 없습니다.'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            const isLoadingThis = enrollLoading[course.id];

            return (
              <div
                key={course.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all p-6 border-t-4 group ${
                  isStudent && isEnrolled ? 'border-green-500' : 'border-primary-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {course.name}
                      </h3>
                      {isStudent && isEnrolled && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          수강 중
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 font-mono font-bold mt-1">{course.code}</p>
                  </div>
                  {isProfessor && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{course.professorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{course.semester} ({course.year})</span>
                  </div>
                </div>

                {course.description && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
                )}

                {/* 학생: 수강 신청/취소 버튼 */}
                {isStudent && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {isEnrolled ? (
                      <button
                        onClick={() => handleUnenroll(course.id)}
                        disabled={isLoadingThis}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm border border-red-200 dark:border-red-800 disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4" />
                        {isLoadingThis ? '처리 중...' : '수강 취소'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={isLoadingThis}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-bold text-sm shadow disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        {isLoadingThis ? '처리 중...' : '수강 신청'}
                      </button>
                    )}
                  </div>
                )}

                {/* 교수: 수강생 목록 버튼 */}
                {isProfessor && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openStudentsModal(course)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-bold text-sm border border-blue-200 dark:border-blue-800"
                    >
                      <Users className="w-4 h-4" />
                      수강생 목록
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 강의 생성/수정 모달 (교수) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editingCourse ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editingCourse ? '강의 수정' : '새 강의 추가'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingCourse(null); }}
                className="hover:bg-white/20 p-1 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">강의명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: 데이터베이스"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">강의 코드 *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: CS301"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">학기 *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1학기">1학기</option>
                    <option value="2학기">2학기</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">년도 *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="강의 설명 (선택)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCourse(null);
                    setFormData({ name: '', code: '', semester: '1학기', year: new Date().getFullYear(), description: '' });
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-bold shadow-lg"
                >
                  {editingCourse ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수강생 목록 모달 (교수) */}
      {showStudentsModal && selectedCourseForStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                수강생 목록
              </h2>
              <button onClick={() => setShowStudentsModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="font-bold text-gray-800 dark:text-white mb-1">{selectedCourseForStudents.name}</p>
              <p className="text-sm text-gray-400 mb-4">{selectedCourseForStudents.code}</p>
              {loadingStudents ? (
                <div className="text-center py-8 text-gray-400">로딩 중...</div>
              ) : studentsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  수강 중인 학생이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">총 {studentsList.length}명</p>
                  {studentsList.map((enrollment, idx) => (
                    <div key={enrollment.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-sm">
                        {(enrollment.studentName || enrollment.studentEmail || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white text-sm">
                          {enrollment.studentName || '이름 없음'}
                        </p>
                        <p className="text-xs text-gray-400">{enrollment.studentEmail}</p>
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

export default CoursesPage;
