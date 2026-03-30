import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, weekAPI, materialAPI, assignmentAPI } from '../services/api';
import { BookOpen, Calendar, ChevronLeft, Plus, FileText, Clock, Download, Trash2, Upload, X, Image, File } from 'lucide-react';

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
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekDetail, setWeekDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: '', description: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });

  const isProfessor = user.role === 'PROFESSOR';
  const [previewMaterial, setPreviewMaterial] = useState(null); // { url, type: 'image'|'pdf', title }

  useEffect(() => {
    loadData();
  }, [courseId]);

  useEffect(() => {
    if (selectedWeek) {
      loadWeekDetail();
    }
  }, [selectedWeek]);

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
      alert('íŒŒì¼ì„ ì„ íƒí•˜ì„¸ìš”.');
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
      alert('ê°•ì˜ ìžë£Œê°€ ì—…ë¡œë“œë˜ì—ˆìŠµë‹ˆë‹¤.');
      setShowMaterialModal(false);
      setMaterialForm({ title: '', description: '' });
      setUploadFile(null);
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to upload material:', error);
      alert('ì—…ë¡œë“œì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (!window.confirm('ì •ë§ ì‚­ì œí•˜ì‹œê² ìŠµë‹ˆê¹Œ?')) return;
    try {
      await materialAPI.delete(courseId, materialId);
      alert('ì‚­ì œë˜ì—ˆìŠµë‹ˆë‹¤.');
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('ì‚­ì œì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
    }
  };

  const handleAssignmentCreate = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.create(courseId, {
        ...assignmentForm,
        weekId: weekDetail.week.id,
      });
      alert('ê³¼ì œê°€ ë“±ë¡ë˜ì—ˆìŠµë‹ˆë‹¤.');
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '' });
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('ê³¼ì œ ë“±ë¡ì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
    }
  };

  const handleAssignmentDelete = async (assignmentId) => {
    if (!window.confirm('ì •ë§ ì‚­ì œí•˜ì‹œê² ìŠµë‹ˆê¹Œ?')) return;
    try {
      await assignmentAPI.delete(assignmentId);
      alert('ì‚­ì œë˜ì—ˆìŠµë‹ˆë‹¤.');
      loadWeekDetail();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('ì‚­ì œì— ì‹¤íŒ¨í–ˆìŠµë‹ˆë‹¤.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">ë¡œë”© ì¤‘...</div>;
  }

  if (!course) {
    return <div className="text-center py-8 text-red-600">ê°•ì˜ë¥¼ ì°¾ì„ ìˆ˜ ì—†ìŠµë‹ˆë‹¤.</div>;
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
          ëŒ€ì‹œë³´ë“œë¡œ ëŒì•„ê°€ê¸°
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              {course.name}
            </h1>
            <p className="text-primary-100">{course.code} Â· {course.professorName}</p>
            <p className="text-primary-200 text-sm mt-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {course.semester} ({course.year})
            </p>
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ì£¼ì°¨ ì„ íƒ</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              className={`p-3 rounded-lg font-bold transition-all ${
                selectedWeek === week.weekNumber
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {week.weekNumber}ì£¼
            </button>
          ))}
        </div>
      </div>

      {/* Week Content */}
      {weekDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ê°•ì˜ ìžë£Œ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                {weekDetail.week.weekNumber}ì£¼ì°¨ ê°•ì˜ ìžë£Œ
              </h3>
              {isProfessor && (
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  ìžë£Œ ì¶”ê°€
                </button>
              )}
            </div>

            {weekDetail.materials.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ë“±ë¡ëœ ê°•ì˜ ìžë£Œê°€ ì—†ìŠµë‹ˆë‹¤.</p>
                {isProfessor && <p className="text-sm mt-2">ìžë£Œ ì¶”ê°€ ë²„íŠ¼ì„ ëˆŒëŸ¬ ì—…ë¡œë“œí•˜ì„¸ìš”.</p>}
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
                              title="ë¯¸ë¦¬ë³´ê¸°"
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

          {/* ê³¼ì œ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-600" />
                {weekDetail.week.weekNumber}ì£¼ì°¨ ê³¼ì œ
              </h3>
              {isProfessor && (
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  ê³¼ì œ ë“±ë¡
                </button>
              )}
            </div>

            {weekDetail.assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ë“±ë¡ëœ ê³¼ì œê°€ ì—†ìŠµë‹ˆë‹¤.</p>
                {isProfessor && <p className="text-sm mt-2">ê³¼ì œ ë“±ë¡ ë²„íŠ¼ì„ ëˆŒëŸ¬ ì¶”ê°€í•˜ì„¸ìš”.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {weekDetail.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => {
                      setSelectedAssignmentDetail(assignment);
                      setShowAssignmentDetailModal(true);
                    }}
                    className="border-l-4 border-accent-500 bg-accent-50 rounded-r-lg p-4 hover:bg-accent-100 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{assignment.description}</p>
                        <p className="text-sm text-accent-700 font-bold mt-3 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          ë§ˆê°: {new Date(assignment.dueDate).toLocaleDateString('ko-KR')}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">ê°•ì˜ ìžë£Œ ì—…ë¡œë“œ</h2>
            </div>
            <form onSubmit={handleMaterialUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ì œëª© *</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ê°•ì˜ ìžë£Œ ì œëª©"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ì„¤ëª…</label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="ìžë£Œ ì„¤ëª… (ì„ íƒ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">íŒŒì¼ *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center dark:bg-gray-900">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      ì„ íƒëœ íŒŒì¼: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
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
                  className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  ì·¨ì†Œ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  ì—…ë¡œë“œ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Create Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">ê³¼ì œ ë“±ë¡</h2>
            </div>
            <form onSubmit={handleAssignmentCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ì œëª© *</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ê³¼ì œ ì œëª©"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ì„¤ëª… *</label>
                <textarea
                  required
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  rows="5"
                  placeholder="ê³¼ì œ ì„¤ëª…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ë§ˆê°ì¼ *</label>
                <input
                  type="datetime-local"
                  required
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setAssignmentForm({ title: '', description: '', dueDate: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                >
                  ì·¨ì†Œ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
                >
                  ë“±ë¡
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssignmentDetail.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {course?.name} ({course?.code})
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Due Date */}
              <div className="bg-accent-50 border-l-4 border-accent-500 rounded-r-lg p-4">
                <div className="flex items-center gap-2 text-accent-700 font-bold">
                  <Calendar className="w-5 h-5" />
                  ë§ˆê°ì¼: {new Date(selectedAssignmentDetail.dueDate).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {new Date(selectedAssignmentDetail.dueDate) < new Date() && (
                  <p className="text-sm text-red-600 font-medium mt-2">âš ï¸ ë§ˆê°ì¼ì´ ì§€ë‚¬ìŠµë‹ˆë‹¤!</p>
                )}
                {new Date(selectedAssignmentDetail.dueDate) > new Date() && (
                  <p className="text-sm text-gray-600 mt-2">
                    ë‚¨ì€ ì‹œê°„: {Math.ceil((new Date(selectedAssignmentDetail.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}ì¼
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">ê³¼ì œ ë‚´ìš©</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignmentDetail.description}</p>
                </div>
              </div>

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
                    ì‚­ì œ
                  </button>
                )}
                <button
                  onClick={() => setShowAssignmentDetailModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                >
                  ë‹«ê¸°
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

