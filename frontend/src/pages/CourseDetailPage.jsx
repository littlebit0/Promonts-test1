import { useToast } from '../components/Toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useEffect, useState } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { courseAPI, weekAPI, materialAPI, assignmentAPI, submissionAPI } from '../services/api';
import { BookOpen, Calendar, ChevronLeft, Plus, FileText, Clock, Download, Trash2, Upload, X, Image, File, CheckCircle, AlertCircle } from 'lucide-react';

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getFileIcon(filename) {
  if (!filename) return { icon: File, color: 'text-gray-500' };
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { icon: FileText, color: 'text-red-500' };
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return { icon: Image, color: 'text-green-500' };
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return { icon: FileText, color: 'text-blue-500' };
  return { icon: File, color: 'text-gray-500' };
}

function isImage(filename) {
  if (!filename) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

function isPdf(filename) {
  if (!filename) return false;
  return filename.split('.').pop()?.toLowerCase() === 'pdf';
}

function CourseDetailPage({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const toast = useToast();
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekDetail, setWeekDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  useEscapeKey(() => {
    if (showAssignmentDetailModal) { setShowAssignmentDetailModal(false); return; }
    if (showAssignmentModal) { setShowAssignmentModal(false); return; }
    if (showMaterialModal) setShowMaterialModal(false);
  }, showMaterialModal || showAssignmentModal || showAssignmentDetailModal);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState(null);

  // 과제 제출 상태
  const [mySubmission, setMySubmission] = useState(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', description: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });

  const isProfessor = user.role === 'PROFESSOR';
  const [previewMaterial, setPreviewMaterial] = useState(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  useEffect(() => {
    if (selectedWeek) {
      loadWeekDetail();
    }
  }, [selectedWeek]);

  // Dashboard에서 과제 클릭 시 0.5초 후 모달 자동 오픈
  useEffect(() => {
    const { openAssignmentId, assignmentData } = location.state || {};
    if (openAssignmentId && assignmentData && !loading) {
      const timer = setTimeout(() => {
        openAssignmentDetail(assignmentData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, location.state]);

  const loadData = async () => {
    try {
      const [courseRes, weeksRes] = await Promise.all([
        courseAPI.getById(courseId),
        weekAPI.getWeeks(courseId),
      ]);
      setCourse(courseRes.data);
      setWeeks(weeksRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeekDetail = async () => {
    try {
      const response = await weekAPI.getWeekDetail(courseId, selectedWeek);
      setWeekDetail(response.data);
    } catch (error) {
      console.error('Failed to load week detail:', error);
    }
  };

  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.info('파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', materialForm.title);
    if (materialForm.description) {
      formData.append('description', materialForm.description);
    }

    try {
      await materialAPI.upload(courseId, selectedWeek, formData);
      toast.info('강의 자료가 업로드되었습니다.');
      setShowMaterialModal(false);
      setMaterialForm({ title: '', description: '' });
      setUploadFile(null);
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to upload material:', error);
      toast.error('업로드에 실패했습니다.');
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await materialAPI.delete(courseId, materialId);
      toast.info('삭제되었습니다.');
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to delete material:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleAssignmentCreate = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.create(courseId, {
        ...assignmentForm,
        weekId: weekDetail.week.id,
      });
      toast.info('과제가 등록되었습니다.');
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '' });
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error('과제 등록에 실패했습니다.');
    }
  };

  const openAssignmentDetail = async (assignment) => {
    setSelectedAssignmentDetail(assignment);
    setShowAssignmentDetailModal(true);
    setSubmitContent('');
    setSubmitFile(null);
    setMySubmission(null);
    if (!isProfessor) {
      try {
        const res = await submissionAPI.getMy(assignment.id);
        if (res.data) setMySubmission(res.data);
      } catch (e) { /* 제출 없음 */ }
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitContent && !submitFile) { toast.info('내용 또는 파일을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submitContent) formData.append('content', submitContent);
      if (submitFile) formData.append('file', submitFile);
      const res = await submissionAPI.submit(selectedAssignmentDetail.id, formData);
      setMySubmission(res.data);
      setSubmitContent('');
      setSubmitFile(null);
      toast.success('제출 완료!');
    } catch (e) {
      toast.error('제출 실패: ' + (e.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!confirm('제출을 취소하시겠습니까?')) return;
    try {
      await submissionAPI.delete(mySubmission.id);
      setMySubmission(null);
    } catch (e) {
      toast.error('제출 취소 실패');
    }
  };

  const handleAssignmentDelete = async (assignmentId) => {    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await assignmentAPI.delete(assignmentId);
      toast.info('삭제되었습니다.');
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!course) {
    return <div className="text-center py-8 text-red-600">강의를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary-100 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          대시보드로 돌아가기
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              {course.name}
            </h1>
            <p className="text-primary-100">{course.code} · {course.professorName}</p>
            <p className="text-primary-200 text-sm mt-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {course.semester} ({course.year})
            </p>
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">주차 선택</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`p-3 rounded-lg font-bold transition-all ${
                selectedWeek === week.weekNumber
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {week.weekNumber}주
            </button>
          ))}
        </div>
      </div>

      {/* Week Content */}
      {weekDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 강의 자료 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                {weekDetail.week.weekNumber}주차 강의 자료
              </h3>
              {isProfessor && (
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  자료 추가
                </button>
              )}
            </div>

            {weekDetail.materials.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>등록된 강의 자료가 없습니다.</p>
                {isProfessor && <p className="text-sm mt-2">자료 추가 버튼을 눌러 업로드하세요.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {weekDetail.materials.map((material) => {
                  const fileInfo = getFileIcon(material.originalFileName || material.title);
                  const FileIcon = fileInfo.icon;
                  const canPreview = isImage(material.originalFileName) || isPdf(material.originalFileName);
                  const previewUrl = `http://localhost:8080/api/materials/${material.id}/download`;
                  return (
                    <div
                      key={material.id}
                      className="border-2 border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-500 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileIcon className={`w-5 h-5 mt-1 ${fileInfo.color}`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{material.title}</h4>
                            {material.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{material.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(material.uploadedAt).toLocaleDateString('ko-KR')}
                              </span>
                              <span>{material.uploadedByName}</span>
                              {material.fileSize > 0 && <span>{formatFileSize(material.fileSize)}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {canPreview && (
                            <button
                              onClick={() => setPreviewMaterial({
                                url: previewUrl,
                                type: isImage(material.originalFileName) ? 'image' : 'pdf',
                                title: material.title,
                              })}
                              className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition"
                              title="미리보기"
                            >
                              <Image className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={previewUrl}
                            download
                            className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {isProfessor && (
                            <button
                              onClick={() => handleMaterialDelete(material.id)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 과제 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-600" />
                {weekDetail.week.weekNumber}주차 과제
              </h3>
              {isProfessor && (
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  과제 등록
                </button>
              )}
            </div>

            {weekDetail.assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>등록된 과제가 없습니다.</p>
                {isProfessor && <p className="text-sm mt-2">과제 등록 버튼을 눌러 추가하세요.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {weekDetail.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => openAssignmentDetail(assignment)}
                    className="border-l-4 border-accent-500 bg-accent-50 dark:bg-gray-700 rounded-r-lg p-4 hover:bg-accent-100 dark:hover:bg-gray-600 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{assignment.description}</p>
                        <p className="text-sm text-accent-700 dark:text-accent-400 font-bold mt-3 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          마감: {new Date(assignment.dueDate).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {isProfessor && (
                        <button
                          onClick={() => handleAssignmentDelete(assignment.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">강의 자료 업로드</h2>
            </div>
            <form onSubmit={handleMaterialUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="강의 자료 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  rows="3"
                  placeholder="자료 설명 (선택)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">파일 *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      선택된 파일: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialModal(false);
                    setMaterialForm({ title: '', description: '' });
                    setUploadFile(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  업로드
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Create Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">과제 등록</h2>
            </div>
            <form onSubmit={handleAssignmentCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="과제 제목"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                <textarea
                  required
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  rows="5"
                  placeholder="과제 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">마감일 *</label>
                <input
                  type="datetime-local"
                  required
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setAssignmentForm({ title: '', description: '', dueDate: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{previewMaterial.title}</h3>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[60vh]">
              {previewMaterial.type === 'image' ? (
                <img
                  src={previewMaterial.url}
                  alt={previewMaterial.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <iframe
                  src={previewMaterial.url}
                  className="w-full h-full min-h-[60vh] rounded-lg"
                  title={previewMaterial.title}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showAssignmentDetailModal && selectedAssignmentDetail && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAssignmentDetail.title}</h2>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {course?.name} ({course?.code})
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Due Date */}
              <div className="bg-accent-50 border-l-4 border-accent-500 rounded-r-lg p-4">
                <div className="flex items-center gap-2 text-accent-700 font-bold">
                  <Calendar className="w-5 h-5" />
                  마감일: {new Date(selectedAssignmentDetail.dueDate).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {new Date(selectedAssignmentDetail.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 font-medium mt-2">⚠️ 마감일이 지났습니다!</p>
                )}
                {new Date(selectedAssignmentDetail.dueDate) > new Date() && (
                  <p className="text-sm text-gray-600 mt-2">
                    남은 시간: {Math.ceil((new Date(selectedAssignmentDetail.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}일
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">과제 내용</h3>
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignmentDetail.description}</p>
                </div>
              </div>

              {/* 학생: 제출 영역 */}
              {!isProfessor && (
                <div>
                  {mySubmission ? (
                    /* 제출 완료 상태 */
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700 dark:text-green-400">제출 완료</span>
                        {mySubmission.isLate && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">⚠️ 지각</span>
                        )}
                      </div>
                      {mySubmission.content && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{mySubmission.content}</p>
                      )}
                      {mySubmission.fileName && (
                        <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                          <Download className="w-3 h-3" />{mySubmission.fileName}
                        </p>
                      )}
                      {mySubmission.score !== null && mySubmission.score !== undefined && (
                        <p className="text-sm font-bold text-green-700 mt-2">점수: {mySubmission.score}점</p>
                      )}
                      {mySubmission.feedback && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">피드백: {mySubmission.feedback}</p>
                      )}
                      <button
                        onClick={handleCancelSubmission}
                        className="mt-3 px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 transition font-medium"
                      >
                        제출 취소
                      </button>
                    </div>
                  ) : (
                    /* 제출 폼 */
                    <form onSubmit={handleSubmitAssignment} className="space-y-3">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-accent-600" />
                        과제 제출
                        {new Date(selectedAssignmentDetail.dueDate) < new Date() && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-normal">마감됨 — 지각 제출</span>
                        )}
                      </h3>
                      <textarea
                        value={submitContent}
                        onChange={e => setSubmitContent(e.target.value)}
                        rows="4"
                        placeholder="과제 내용을 입력하세요..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-accent-500 focus:outline-none text-sm resize-none"
                      />
                      <div>
                        <input
                          type="file"
                          onChange={e => setSubmitFile(e.target.files[0])}
                          className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100"
                        />
                        {submitFile && <p className="text-xs text-gray-500 mt-1">{submitFile.name}</p>}
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || (!submitContent.trim() && !submitFile)}
                        className="w-full py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {submitting ? '제출 중...' : new Date(selectedAssignmentDetail.dueDate) < new Date() ? '지각 제출하기' : '제출하기'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {isProfessor && (
                  <button
                    onClick={() => {
                      handleAssignmentDelete(selectedAssignmentDetail.id);
                      setShowAssignmentDetailModal(false);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={() => setShowAssignmentDetailModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailPage;
