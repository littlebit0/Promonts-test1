import { useEffect, useState } from 'react';
import { GraduationCap, Calendar, FileText, Bell, User, Award, Clock, BookOpen } from 'lucide-react';

function AcademicPage({ user }) {
  const [selectedTab, setSelectedTab] = useState('grades');
  const [loading, setLoading] = useState(false);

  // 임시 데이터 (백엔드 구현 후 API로 교체)
  const studentInfo = {
    studentId: user.username || 'S202401234',
    name: user.name,
    major: '컴퓨터공학과',
    year: '3학년',
    semester: '1학기',
    totalCredits: 95,
    gpa: 3.85,
    maxGpa: 4.5,
  };

  const grades = [
    {
      semester: '2024-1학기',
      courses: [
        { name: '자료구조', credits: 3, grade: 'A+', score: 95 },
        { name: '알고리즘', credits: 3, grade: 'A0', score: 90 },
        { name: '데이터베이스', credits: 3, grade: 'B+', score: 85 },
        { name: '운영체제', credits: 3, grade: 'A+', score: 96 },
      ],
      gpa: 3.92,
    },
    {
      semester: '2023-2학기',
      courses: [
        { name: '웹프로그래밍', credits: 3, grade: 'A+', score: 94 },
        { name: '소프트웨어공학', credits: 3, grade: 'A0', score: 88 },
        { name: '컴퓨터구조', credits: 3, grade: 'B+', score: 83 },
      ],
      gpa: 3.78,
    },
  ];

  const schedule = [
    { day: '월', time: '09:00-10:30', course: '알고리즘', room: '공학관 301', professor: '김교수' },
    { day: '월', time: '13:00-14:30', course: '데이터베이스', room: '공학관 405', professor: '이교수' },
    { day: '수', time: '09:00-10:30', course: '알고리즘', room: '공학관 301', professor: '김교수' },
    { day: '수', time: '15:00-16:30', course: '운영체제', room: '공학관 502', professor: '박교수' },
    { day: '금', time: '10:00-12:00', course: '자료구조', room: '공학관 201', professor: '최교수' },
  ];

  const notices = [
    {
      id: 1,
      title: '2024-1학기 중간고사 일정 안내',
      date: '2024-03-20',
      category: '학사',
      important: true,
    },
    {
      id: 2,
      title: '수강신청 정정 기간 안내',
      date: '2024-03-18',
      category: '수강',
      important: true,
    },
    {
      id: 3,
      title: '장학금 신청 안내',
      date: '2024-03-15',
      category: '장학',
      important: false,
    },
  ];

  const academicCalendar = [
    { date: '2024-03-25 ~ 03-29', event: '중간고사', type: 'exam' },
    { date: '2024-04-01 ~ 04-05', event: '수강신청 정정', type: 'registration' },
    { date: '2024-05-15', event: '개교기념일', type: 'holiday' },
    { date: '2024-06-17 ~ 06-21', event: '기말고사', type: 'exam' },
  ];

  const renderGrades = () => (
    <div className="space-y-6">
      {/* 전체 성적 요약 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6" />
          전체 성적
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-primary-100 text-sm">취득 학점</p>
            <p className="text-3xl font-bold">{studentInfo.totalCredits}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">평점 평균</p>
            <p className="text-3xl font-bold">{studentInfo.gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">만점</p>
            <p className="text-3xl font-bold">{studentInfo.maxGpa.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">백분율</p>
            <p className="text-3xl font-bold">{((studentInfo.gpa / studentInfo.maxGpa) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* 학기별 성적 */}
      {grades.map((semester, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold text-gray-900">{semester.semester}</h4>
            <span className="text-lg font-bold text-primary-600">평점: {semester.gpa.toFixed(2)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">과목명</th>
                  <th className="text-center py-3 px-4 text-gray-600">학점</th>
                  <th className="text-center py-3 px-4 text-gray-600">점수</th>
                  <th className="text-center py-3 px-4 text-gray-600">등급</th>
                </tr>
              </thead>
              <tbody>
                {semester.courses.map((course, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{course.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{course.credits}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{course.score}점</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${
                        course.grade.startsWith('A') ? 'text-green-600' :
                        course.grade.startsWith('B') ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {course.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          시간표
        </h3>
        <div className="space-y-3">
          {['월', '화', '수', '목', '금'].map((day) => (
            <div key={day} className="border-l-4 border-primary-500 bg-gray-50 rounded-r-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">{day}요일</h4>
              <div className="space-y-2">
                {schedule.filter(s => s.day === day).length === 0 ? (
                  <p className="text-sm text-gray-400">강의 없음</p>
                ) : (
                  schedule.filter(s => s.day === day).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-primary-600 font-mono font-bold">{item.time}</span>
                        <span className="font-medium text-gray-900">{item.course}</span>
                      </div>
                      <div className="text-gray-500 text-right">
                        <div>{item.room}</div>
                        <div className="text-xs">{item.professor}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          학적 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">학번</p>
            <p className="text-lg font-bold text-gray-900">{studentInfo.studentId}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">이름</p>
            <p className="text-lg font-bold text-gray-900">{studentInfo.name}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">학과</p>
            <p className="text-lg font-bold text-gray-900">{studentInfo.major}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">학년/학기</p>
            <p className="text-lg font-bold text-gray-900">{studentInfo.year} {studentInfo.semester}</p>
          </div>
          <div className="border-l-4 border-accent-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">취득 학점</p>
            <p className="text-lg font-bold text-accent-600">{studentInfo.totalCredits}학점</p>
          </div>
          <div className="border-l-4 border-accent-500 pl-4">
            <p className="text-sm text-gray-500 mb-1">평점 평균</p>
            <p className="text-lg font-bold text-accent-600">{studentInfo.gpa.toFixed(2)} / {studentInfo.maxGpa}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotices = () => (
    <div className="space-y-4">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${
            notice.important ? 'border-l-4 border-accent-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {notice.important && (
                  <span className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full font-bold">
                    중요
                  </span>
                )}
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {notice.category}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{notice.title}</h4>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{notice.date}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-4">
      {academicCalendar.map((item, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
            item.type === 'exam' ? 'border-red-500' :
            item.type === 'registration' ? 'border-blue-500' :
            'border-green-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{item.event}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.date}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              item.type === 'exam' ? 'bg-red-100 text-red-700' :
              item.type === 'registration' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {item.type === 'exam' ? '시험' :
               item.type === 'registration' ? '수강' : '휴일'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          학사행정
        </h1>
        <p className="text-primary-100">{studentInfo.name} ({studentInfo.studentId})</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('grades')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'grades'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            성적 조회
          </button>
          <button
            onClick={() => setSelectedTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'schedule'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            시간표
          </button>
          <button
            onClick={() => setSelectedTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'info'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            학적 정보
          </button>
          <button
            onClick={() => setSelectedTab('notices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'notices'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            학사 공지
          </button>
          <button
            onClick={() => setSelectedTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'calendar'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            학사 일정
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {selectedTab === 'grades' && renderGrades()}
        {selectedTab === 'schedule' && renderSchedule()}
        {selectedTab === 'info' && renderStudentInfo()}
        {selectedTab === 'notices' && renderNotices()}
        {selectedTab === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
}

export default AcademicPage;
