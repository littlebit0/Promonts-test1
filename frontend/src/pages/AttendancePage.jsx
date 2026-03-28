import { useState, useEffect } from 'react';
import { CheckCircle, QrCode } from 'lucide-react';
import { attendanceAPI } from '../services/api';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [qrCode, setQrCode] = useState('');
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

  const handleCheckAttendance = async () => {
    if (!qrCode.trim()) {
      alert('QR 코드를 입력하세요');
      return;
    }
    try {
      await attendanceAPI.checkAttendance(qrCode);
      alert('출석 체크 완료!');
      setQrCode('');
      fetchAttendances();
    } catch (error) {
      alert('출석 체크 실패: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="text-center py-12">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CheckCircle className="w-8 h-8 text-blue-600" />
        출석
      </h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          QR 출석 체크
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="QR 코드 입력"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleCheckAttendance}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            출석
          </button>
        </div>
      </div>

      <h2 className="font-bold text-xl mb-4">출석 기록</h2>
      {attendances.length === 0 ? (
        <div className="text-center py-12 text-gray-500">출석 기록이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {attendances.map((attendance) => (
            <div key={attendance.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div>
                <h3 className="font-bold">{attendance.course.name}</h3>
                <p className="text-sm text-gray-500">{new Date(attendance.attendedAt).toLocaleString()}</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                attendance.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                attendance.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {attendance.status === 'PRESENT' ? '출석' :
                 attendance.status === 'LATE' ? '지각' : '결석'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
