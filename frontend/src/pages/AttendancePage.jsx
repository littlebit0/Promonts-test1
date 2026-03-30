import { useState, useEffect } from 'react';
import { CheckCircle, Users } from 'lucide-react';
import { attendanceAPI } from '../services/api';

const STATUS_MAP = {
  PRESENT: { label: '출석', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  LATE: { label: '지각', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  ABSENT: { label: '결석', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendances();
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

  // 통계
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

      {/* 통계 카드 */}
      {total > 0 && (
        <div className="space-y-4">
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
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${presentPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 출석 기록 */}
      <div>
        <h2 className="font-bold text-xl mb-4 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          출석 기록
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
