import { useState, useEffect } from 'react';
import { CheckCircle, QrCode, Clock, X, AlertCircle, Users } from 'lucide-react';
import { attendanceAPI, courseAPI } from '../services/api';

const STATUS_MAP = {
  PRESENT: { label: '출석', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  LATE: { label: '지각', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  ABSENT: { label: '결석', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export default function AttendancePage({ user }) {
  const [attendances, setAttendances] = useState([]);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkResult, setCheckResult] = useState(null); // null | 'success' | 'fail'
  const [checkMsg, setCheckMsg] = useState('');

  // Professor states
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState(10);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const isProfessor = user?.role === 'PROFESSOR';

  useEffect(() => {
    fetchAttendances();
    if (isProfessor) fetchCourses();
  }, []);

  const fetchAttendances = async () => {
    try {
      const res = await attendanceAPI.getMyAttendances();
      setAttendances(res.data);
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getMy();
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedCourse) { alert('강의를 선택하세요'); return; }
    setSessionLoading(true);
    try {
      const res = await attendanceAPI.createSession(selectedCourse, duration);
      setActiveSession(res.data);
    } catch (error) {
      alert('세션 생성 실패: ' + (error.response?.data?.error || error.message));
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCheckAttendance = async () => {
    if (!qrCode.trim()) { alert('QR 코드를 입력하세요'); return; }
    try {
      await attendanceAPI.checkAttendance(qrCode);
      setCheckResult('success');
      setCheckMsg('출석이 완료되었습니다! ✅');
      setQrCode('');
      fetchAttendances();
    } catch (error) {
      setCheckResult('fail');
      setCheckMsg('출석 체크 실패: ' + (error.response?.data?.error || error.message));
    }
  };

  // Stats
  const stats = attendances.reduce((acc, a) => {
    const status = a.status || 'ABSENT';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const total = attendances.length;
  const presentPct = total ? Math.round(((stats.PRESENT || 0) / total) * 100) : 0;

  if (loading) return <div className="text-center py-12 dark:text-gray-300">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
        <CheckCircle className="w-8 h-8 text-blue-600" />
        출석
      </h1>

      {/* Stats Cards */}
      {total > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'PRESENT', label: '출석', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { key: 'LATE', label: '지각', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { key: 'ABSENT', label: '결석', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${presentPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Professor: QR Session Creation */}
      {isProfessor && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="font-bold text-xl flex items-center gap-2 dark:text-white">
            <QrCode className="w-6 h-6 text-blue-600" />
            QR 출석 세션 생성
          </h2>
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">강의 선택</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-20 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">분</span>
            </div>
            <button
              onClick={handleCreateSession}
              disabled={sessionLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              {sessionLoading ? '생성 중...' : 'QR 생성'}
            </button>
          </div>

          {activeSession && (
            <div className="mt-4 text-center space-y-3">
              <div className="inline-block p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg border-4 border-blue-500">
                <div className="text-5xl mb-2">📱</div>
                <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                  {activeSession.qrCode}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                학생들이 이 코드를 입력하여 출석 체크를 합니다
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <Clock className="w-4 h-4" />
                유효 시간: {duration}분
              </div>
              <button
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 mx-auto"
              >
                <X className="w-4 h-4" />닫기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student: QR Check */}
      {!isProfessor && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="font-bold text-xl flex items-center gap-2 dark:text-white">
            <QrCode className="w-6 h-6 text-blue-600" />
            QR 출석 체크
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => { setQrCode(e.target.value); setCheckResult(null); }}
              onKeyDown={e => e.key === 'Enter' && handleCheckAttendance()}
              placeholder="QR 코드 입력 후 Enter 또는 출석 버튼"
              className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleCheckAttendance}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              출석
            </button>
          </div>
          {checkResult && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              checkResult === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {checkResult === 'success'
                ? <CheckCircle className="w-6 h-6 flex-shrink-0" />
                : <AlertCircle className="w-6 h-6 flex-shrink-0" />
              }
              <span className="font-medium">{checkMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Attendance Records Table */}
      <div>
        <h2 className="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />출석 기록
        </h2>
        {attendances.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">출석 기록이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">날짜</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">강의명</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {attendances.map((attendance) => {
                  const statusInfo = STATUS_MAP[attendance.status] || STATUS_MAP.ABSENT;
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(attendance.attendedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 font-medium dark:text-white">
                        {attendance.course?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
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
