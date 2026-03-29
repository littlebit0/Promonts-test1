import { useEffect, useState, useRef } from 'react';
import { GraduationCap, Calendar, FileText, Bell, User, Award, Clock, BookOpen, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Calculator, Plus, Trash2 } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { gradeAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AcademicPage({ user }) {
  const [selectedTab, setSelectedTab] = useState('grades');
  const [selectedSemester, setSelectedSemester] = useState('all'); // 학기 필터
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState(null);
  const semesterScrollRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorCourses, setCalculatorCourses] = useState([
    { id: 1, name: '', credit: 3, grade: 'A+' }
  ]);

  // 학생 정보 (기본값)
  const studentInfo = {
    studentId: user.username || 'S202401234',
    name: user.name,
    major: '컴퓨터공학과',
    year: '3학년',
    semester: '1학기',
    totalCredits: 0,
    gpa: 0,
    majorGpa: 0,
    maxGpa: 4.5,
  };

  // 성적 데이터 가져오기
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await gradeAPI.getMy();
        setGrades(response.data || []);
      } catch (err) {
        console.error('Failed to fetch grades:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // 평점 계산
  const calculateGPA = () => {
    if (grades.length === 0) return { gpa: 0, majorGpa: 0, totalCredits: 0 };

    let totalScore = 0;
    let totalCredits = 0;

    grades.forEach(grade => {
      // 학점 기본값 3 (Course 엔티티에 credit 필드 없음)
      const credit = 3;
      const score = grade.totalScore || 0;

      totalScore += score * credit;
      totalCredits += credit;
    });

    return {
      gpa: totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : 0,
      majorGpa: totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : 0, // 전공 구분 없음
      totalCredits,
    };
  };

  const { gpa, majorGpa, totalCredits } = calculateGPA();
  studentInfo.gpa = parseFloat(gpa);
  studentInfo.majorGpa = parseFloat(majorGpa);
  studentInfo.totalCredits = totalCredits;

  // 학기 목록 추출 (중복 제거)
  const semesters = ['all', ...new Set(grades.map(g => g.course?.semester).filter(Boolean))];

  // 선택된 학기의 성적 필터링
  const filteredGrades = selectedSemester === 'all' 
    ? grades 
    : grades.filter(g => g.course?.semester === selectedSemester);

  // 학기 탭 스크롤 함수
  const scrollSemesterTabs = (direction) => {
    if (semesterScrollRef.current) {
      const scrollAmount = 200;
      semesterScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 성적 정렬 함수
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 성적 데이터
  const getSortedGrades = (gradesToSort) => {
    if (!sortConfig.key) return gradesToSort;

    return [...gradesToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.course?.name || '';
          bValue = b.course?.name || '';
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        
        case 'credit':
          // 학점은 모두 3으로 동일하므로 변화 없음
          return 0;
        
        case 'letter':
          aValue = a.letterGrade || 'Z';
          bValue = b.letterGrade || 'Z';
          const gradeOrder = { 'A+': 1, 'A0': 2, 'B+': 3, 'B0': 4, 'C+': 5, 'C0': 6, 'D+': 7, 'D0': 8, 'F': 9, 'P': 10 };
          const aOrder = gradeOrder[aValue] || 99;
          const bOrder = gradeOrder[bValue] || 99;
          return sortConfig.direction === 'asc' ? aOrder - bOrder : bOrder - aOrder;
        
        case 'score':
          aValue = a.totalScore || 0;
          bValue = b.totalScore || 0;
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        
        default:
          return 0;
      }
    });
  };

  const sortedFilteredGrades = getSortedGrades(filteredGrades);

  // GPA 계산기 함수
  const gradeToScore = (grade) => {
    const scoreMap = {
      'A+': 4.5, 'A0': 4.0,
      'B+': 3.5, 'B0': 3.0,
      'C+': 2.5, 'C0': 2.0,
      'D+': 1.5, 'D0': 1.0,
      'F': 0, 'P': 0
    };
    return scoreMap[grade] || 0;
  };

  const calculateExpectedGPA = () => {
    let totalScore = 0;
    let totalCredits = 0;

    calculatorCourses.forEach(course => {
      const credit = parseInt(course.credit) || 0;
      const score = gradeToScore(course.grade);
      totalScore += score * credit;
      totalCredits += credit;
    });

    return totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : '0.00';
  };

  const addCalculatorCourse = () => {
    const newId = Math.max(...calculatorCourses.map(c => c.id), 0) + 1;
    setCalculatorCourses([...calculatorCourses, { id: newId, name: '', credit: 3, grade: 'A+' }]);
  };

  const removeCalculatorCourse = (id) => {
    if (calculatorCourses.length > 1) {
      setCalculatorCourses(calculatorCourses.filter(c => c.id !== id));
    }
  };

  const updateCalculatorCourse = (id, field, value) => {
    setCalculatorCourses(calculatorCourses.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // 학기별 평점 추이 데이터 (실제 데이터 기반)
  const semesterTrendData = {
    labels: grades.length > 0 
      ? [...new Set(grades.map(g => `${g.course?.semester || '?'}`))].slice(-6)
      : ['1학년\n1학기', '1학년\n2학기'],
    datasets: [
      {
        label: '전체',
        data: grades.length > 0
          ? [...new Set(grades.map(g => g.course?.semester))].slice(-6).map(sem => {
              const semGrades = grades.filter(g => g.course?.semester === sem);
              const avg = semGrades.reduce((sum, g) => sum + (g.totalScore || 0), 0) / semGrades.length;
              return avg.toFixed(2);
            })
          : [3.69, 3.29],
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: '전공',
        data: grades.length > 0
          ? [...new Set(grades.map(g => g.course?.semester))].slice(-6).map(sem => {
              const semGrades = grades.filter(g => g.course?.semester === sem);
              const avg = semGrades.length > 0 
                ? semGrades.reduce((sum, g) => sum + (g.totalScore || 0), 0) / semGrades.length 
                : 0;
              return avg.toFixed(2);
            })
          : [3.85, 3.42],
        borderColor: '#9ca3af',
        backgroundColor: '#9ca3af',
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // 학점 분포 데이터 (Grade → 백분율)
  const gradeDistributionData = (() => {
    const gradeMap = { 'A+': 0, 'A0': 0, 'B+': 0, 'B0': 0, 'C+': 0, 'C0': 0, 'P': 0, 'F': 0 };
    grades.forEach(g => {
      const letter = g.letterGrade || 'F';
      if (gradeMap[letter] !== undefined) gradeMap[letter]++;
    });

    const total = grades.length || 1;
    const labels = Object.keys(gradeMap).filter(k => gradeMap[k] > 0);
    const data = labels.map(k => ((gradeMap[k] / total) * 100).toFixed(0));

    return {
      labels: labels.length > 0 ? labels : ['A+', 'A0', 'B+', 'B0', 'P'],
      datasets: [
        {
          data: data.length > 0 ? data : [25, 19, 31, 13, 6],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'],
          borderWidth: 0,
          barThickness: 24,
        },
      ],
    };
  })();

  const renderGrades = () => {
    // 로딩 중
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    // 에러 발생
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">성적 데이터를 불러올 수 없습니다.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        </div>
      );
    }

    // 성적 없음
    if (grades.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">등록된 성적이 없습니다.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">수강 중인 과목의 성적이 입력되면 여기에 표시됩니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 학기 선택 탭 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="relative flex items-center gap-2">
            {/* 왼쪽 스크롤 버튼 */}
            <button
              onClick={() => scrollSemesterTabs('left')}
              className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="이전 학기"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* 학기 탭 */}
            <div ref={semesterScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedSemester === 'all'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                전체
              </button>
              {semesters.filter(s => s !== 'all').map((semester) => (
                <button
                  key={semester}
                  onClick={() => setSelectedSemester(semester)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedSemester === semester
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {semester}
                </button>
              ))}
            </div>

            {/* 오른쪽 스크롤 버튼 */}
            <button
              onClick={() => scrollSemesterTabs('right')}
              className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="다음 학기"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* 전체 성적 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">전체 평점</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{studentInfo.gpa.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">/ {studentInfo.maxGpa.toFixed(1)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">전공 평점</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{studentInfo.majorGpa.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">/ {studentInfo.maxGpa.toFixed(1)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">취득 학점</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{studentInfo.totalCredits}</p>
            <p className="text-xs text-gray-400 mt-1">/ 130 ⭐</p>
          </div>
        </div>

        {/* 학기별 평점 추이 그래프 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="mb-4">
            <Line
              data={semesterTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 15,
                      font: { size: 12 },
                      color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                  },
                },
                scales: {
                  y: {
                    min: 2.0,
                    max: 4.0,
                    ticks: {
                      stepSize: 1.0,
                      color: '#9ca3af',
                      font: { size: 11 },
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.2)',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#9ca3af',
                      font: { size: 11 },
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 학점 분포 그래프 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="mb-4">
            <Bar
              data={gradeDistributionData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 3,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                      label: (context) => `${context.parsed.x}%`,
                    },
                  },
                },
                scales: {
                  x: {
                    min: 0,
                    max: 35,
                    ticks: {
                      callback: (value) => `${value}%`,
                      color: '#9ca3af',
                      font: { size: 11 },
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.2)',
                    },
                  },
                  y: {
                    ticks: {
                      color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
                      font: { size: 12, weight: 'bold' },
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* GPA 계산기 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary-600" />
              GPA 계산기
            </h3>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
            >
              {showCalculator ? '닫기' : '열기'}
            </button>
          </div>

          {showCalculator && (
            <div className="space-y-4">
              {/* 과목 입력 */}
              {calculatorCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-6">{index + 1}</span>
                  
                  <input
                    type="text"
                    placeholder="과목명"
                    value={course.name}
                    onChange={(e) => updateCalculatorCourse(course.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  
                  <select
                    value={course.credit}
                    onChange={(e) => updateCalculatorCourse(course.id, 'credit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="1">1학점</option>
                    <option value="2">2학점</option>
                    <option value="3">3학점</option>
                    <option value="4">4학점</option>
                  </select>
                  
                  <select
                    value={course.grade}
                    onChange={(e) => updateCalculatorCourse(course.id, 'grade', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="A+">A+</option>
                    <option value="A0">A0</option>
                    <option value="B+">B+</option>
                    <option value="B0">B0</option>
                    <option value="C+">C+</option>
                    <option value="C0">C0</option>
                    <option value="D+">D+</option>
                    <option value="D0">D0</option>
                    <option value="F">F</option>
                    <option value="P">P</option>
                  </select>
                  
                  <button
                    onClick={() => removeCalculatorCourse(course.id)}
                    disabled={calculatorCourses.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* 과목 추가 버튼 */}
              <button
                onClick={addCalculatorCourse}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                과목 추가
              </button>

              {/* 예상 GPA */}
              <div className="mt-6 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">예상 평점</p>
                <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                  {calculateExpectedGPA()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">/ 4.50</p>
              </div>
            </div>
          )}
        </div>

        {/* 성적 상세 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedSemester === 'all' ? '전체 성적' : selectedSemester}
            </h3>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
              사진저장
            </button>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">등록된 성적이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    평점 <span className="text-red-600 dark:text-red-400 font-bold">
                      {(filteredGrades.reduce((sum, g) => sum + (g.totalScore || 0), 0) / filteredGrades.length).toFixed(2)}
                    </span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    취득 <span className="font-bold">{filteredGrades.length * 3}</span>
                  </span>
                </div>
              </div>

              {/* 성적 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th 
                        className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          과목명
                          {sortConfig.key === 'name' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('credit')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          학점
                          {sortConfig.key === 'credit' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('letter')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          성적
                          {sortConfig.key === 'letter' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('score')}
                      >
                        <div className="flex items-center justify-center gap-2">
                          평점
                          {sortConfig.key === 'score' ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredGrades.map((grade, index) => (
                      <tr
                        key={grade.id}
                        className={`border-b border-gray-100 dark:border-gray-700 ${
                          index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {grade.course?.name || '과목명 없음'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">3</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-gray-100">
                          {grade.letterGrade || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {(grade.totalScore || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

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

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          시간표
        </h3>
        <div className="space-y-3">
          {['월', '화', '수', '목', '금'].map((day) => (
            <div key={day} className="border-l-4 border-primary-500 bg-gray-50 dark:bg-gray-900 rounded-r-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{day}요일</h4>
              <div className="space-y-2">
                {schedule.filter(s => s.day === day).length === 0 ? (
                  <p className="text-sm text-gray-400">강의 없음</p>
                ) : (
                  schedule.filter(s => s.day === day).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-primary-600 font-mono font-bold">{item.time}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.course}</span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-right">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          학적 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">학번</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{studentInfo.studentId}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">이름</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{studentInfo.name}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">학과</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{studentInfo.major}</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">학년/학기</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{studentInfo.year} {studentInfo.semester}</p>
          </div>
          <div className="border-l-4 border-accent-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">취득 학점</p>
            <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{studentInfo.totalCredits}학점</p>
          </div>
          <div className="border-l-4 border-accent-500 pl-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">평점 평균</p>
            <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{studentInfo.gpa.toFixed(2)} / {studentInfo.maxGpa}</p>
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
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-all ${
            notice.important ? 'border-l-4 border-accent-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {notice.important && (
                  <span className="bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs px-2 py-1 rounded-full font-bold">
                    중요
                  </span>
                )}
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                  {notice.category}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{notice.title}</h4>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">{notice.date}</span>
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
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 ${
            item.type === 'exam' ? 'border-red-500' :
            item.type === 'registration' ? 'border-blue-500' :
            'border-green-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{item.event}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.date}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              item.type === 'exam' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
              item.type === 'registration' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
              'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('grades')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTab === 'grades'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
