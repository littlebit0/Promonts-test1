import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Users, QrCode, RefreshCw, Clock, BookOpen, Scan } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { attendanceAPI, courseAPI } from '../services/api';

const STATUS_MAP = {
  PRESENT: { label: '출석', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  LATE:    { label: '지각', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  ABSENT:  { label: '결석', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export default function AttendancePage({ user }) {
  const isProfessor = user?.role === 'PROFESSOR';

  // 공통
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 교수용
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [courseAttendances, setCourseAttendances] = useState([]);

  // 학생용
  const [myAttendances, setMyAttendances] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    loadCourses();
    if (!isProfessor) fetchMyAttendances();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      if (isProfessor) {
        checkActiveSession(selectedCourse);
        fetchCourseAttendances(selectedCourse);
      }
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data);
      if (res.data.length > 0) setSelectedCourse(res.data[0].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMyAttendances = async () => {
    try {
      const res = await attendanceAPI.getMyAttendances();
      setMyAttendances(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCourseAttendances = async (courseId) => {
    try {
      const res = await attendanceAPI.getCourseAttendances(courseId);
      setCourseAttendances(res.data);
    } catch (e) { console.error(e); }
  };

  const checkActiveSession = async (courseId) => {
    try {
      const res = await attendanceAPI.getActiveSession(courseId);
      if (res.data.active) {
        setActiveSession(res.data);
        startTimer(res.data.expiresAt);
      } else {
        setActiveSession(null);
      }
    } catch (e) { console.error(e); }
  };

  const startTimer = (expiresAt) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        setActiveSession(null);
      }
    }, 1000);
  };

  const handleCreateSession = async (duration = 10) => {
    if (!selectedCourse) return;
    setSessionLoading(true);
    try {
      const res = await attendanceAPI.createSession(selectedCourse, duration);
      setActiveSession(res.data);
      startTimer(res.data.expiresAt);
    } catch (e) {
      alert('출석 세션 생성 실패: ' + (e.response?.data?.error || e.message));
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCheckAttendance = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await attendanceAPI.checkAttendance(qrInput.trim());
      setCheckResult({ success: true, status: res.data.status });
      setQrInput('');
      fetchMyAttendances();
    } catch (e) {
      setCheckResult({ success: false, message: e.response?.data?.error || '출석 처리 실패' });
    } finally {
      setCheckLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="text-center py-12 dark:text-gray-300">로딩 중...</div>;

  // ─── 교수 뷰 ───────────────────────────────────────────────────────────────
  if (isProfessor) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
          <QrCode className="w-8 h-8 text-blue-600" />
          출석 관리
        </h1>

        {/* 강의 선택 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />강의 선택
          </label>
          <select
            value={selectedCourse || ''}
            onChange={e => { setSelectedCourse(Number(e.target.value)); setActiveSession(null); }}
            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>

        {/* QR 세션 관리 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />출석 QR 생성
          </h2>

          {activeSession ? (
            <div className="flex flex-col items-center gap-6">
              {/* QR 코드 */}
              <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-blue-100">
                <QRCodeSVG value={activeSession.qrCode} size={220} level="H" />
              </div>

              {/* 코드 텍스트 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-6 py-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">출석 코드</p>
                <p className="text-2xl font-mono font-bold text-blue-600 tracking-widest">{activeSession.qrCode}</p>
              </div>

              {/* 타이머 */}
              <div className={`flex items-center gap-2 text-xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-green-600'}`}>
                <Clock className="w-5 h-5" />
                남은 시간: {formatTime(timeLeft)}
              </div>

              <button
                onClick={() => handleCreateSession(10)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
              >
                <RefreshCw className="w-4 h-4" />새 QR 생성
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <QrCode className="w-16 h-16 mx-auto text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">출석 QR을 생성해 학생들이 출석할 수 있도록 하세요</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {[5, 10, 15, 30].map(min => (
                  <button
                    key={min}
                    onClick={() => handleCreateSession(min)}
                    disabled={sessionLoading}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-50"
                  >
                    {min}분
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 강의별 출석 목록 */}
        {courseAttendances.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold dark:text-white">출석 현황</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-4 py-3">학생</th>
                  <th className="text-left px-4 py-3">일시</th>
                  <th className="text-left px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {courseAttendances.map(a => {
                  const s = STATUS_MAP[a.status] || STATUS_MAP.ABSENT;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium dark:text-white">{a.user?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(a.attendedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─── 학생 뷰 ───────────────────────────────────────────────────────────────
  const stats = myAttendances.reduce((acc, a) => {
    const status = a.status || 'ABSENT';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const total = myAttendances.length;
  const presentPct = total ? Math.round(((stats.PRESENT || 0) / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
        <CheckCircle className="w-8 h-8 text-blue-600" />
        출석
      </h1>

      {/* QR 코드 입력 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <Scan className="w-5 h-5 text-blue-600" />출석 체크
        </h2>
        <form onSubmit={handleCheckAttendance} className="flex gap-3">
          <input
            type="text"
            value={qrInput}
            onChange={e => setQrInput(e.target.value)}
            placeholder="교수님이 보여주신 출석 코드를 입력하세요"
            className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={checkLoading || !qrInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-50"
          >
            {checkLoading ? '처리 중...' : '출석'}
          </button>
        </form>

        {checkResult && (
          <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${checkResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            {checkResult.success
              ? `✅ 출석 완료! 상태: ${STATUS_MAP[checkResult.status]?.label || checkResult.status}`
              : `❌ ${checkResult.message}`}
          </div>
        )}
      </div>

      {/* 통계 */}
      {total > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'PRESENT', label: '출석', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { key: 'LATE',    label: '지각', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { key: 'ABSENT',  label: '결석', color: 'text-red-600',   bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map(({ key, label, color, bg }) => (
              <div key={key} className={`${bg} rounded-xl p-4 text-center`}>
                <div className={`text-3xl font-bold ${color}`}>{stats[key] || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
              <span>출석률</span>
              <span className="font-bold">{presentPct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${presentPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* 출석 이력 */}
      <div>
        <h2 className="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />출석 이력
        </h2>
        {myAttendances.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">출석 이력이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">일시</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">강의명</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {myAttendances.map(a => {
                  const s = STATUS_MAP[a.status] || STATUS_MAP.ABSENT;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(a.attendedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 font-medium dark:text-white">{a.course?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
