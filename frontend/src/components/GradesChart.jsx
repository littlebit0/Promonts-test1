import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 성적 추이 그래프
export const GradesTrendChart = ({ grades }) => {
  const data = {
    labels: grades.map((g) => g.courseName || `강의 ${g.courseId}`),
    datasets: [
      {
        label: '총점',
        data: grades.map((g) => g.totalScore || 0),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

// 성적 분포 그래프
export const GradesDistributionChart = ({ grades }) => {
  const scoreCategories = {
    '중간고사': grades.map((g) => g.midtermScore || 0),
    '기말고사': grades.map((g) => g.finalScore || 0),
    '과제': grades.map((g) => g.assignmentScore || 0),
    '출석': grades.map((g) => g.attendanceScore || 0),
  };

  const data = {
    labels: grades.map((g) => g.courseName || `강의 ${g.courseId}`),
    datasets: Object.keys(scoreCategories).map((key, idx) => ({
      label: key,
      data: scoreCategories[key],
      backgroundColor: [
        '#2563EB',
        '#F97316',
        '#10B981',
        '#F59E0B',
      ][idx],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

// 학점 분포 도넛 차트
export const LetterGradeChart = ({ grades }) => {
  const gradeCount = grades.reduce((acc, g) => {
    const grade = g.letterGrade || 'F';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(gradeCount),
    datasets: [
      {
        data: Object.values(gradeCount),
        backgroundColor: [
          '#10B981', // A+
          '#34D399', // A
          '#60A5FA', // B+
          '#93C5FD', // B
          '#FBBF24', // C+
          '#FCD34D', // C
          '#FB923C', // D+
          '#FDBA74', // D
          '#EF4444', // F
        ],
        borderWidth: 2,
        borderColor: '#1e293b',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
};

// 평균 성적 요약
export const GradesSummary = ({ grades }) => {
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length || 0;

  const summary = {
    avgTotal: avg(grades.map((g) => g.totalScore || 0)),
    avgMidterm: avg(grades.map((g) => g.midtermScore || 0)),
    avgFinal: avg(grades.map((g) => g.finalScore || 0)),
    avgAssignment: avg(grades.map((g) => g.assignmentScore || 0)),
    avgAttendance: avg(grades.map((g) => g.attendanceScore || 0)),
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">총점 평균</p>
        <p className="text-2xl font-bold text-primary-600">{summary.avgTotal.toFixed(1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">중간고사</p>
        <p className="text-2xl font-bold text-blue-600">{summary.avgMidterm.toFixed(1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">기말고사</p>
        <p className="text-2xl font-bold text-orange-600">{summary.avgFinal.toFixed(1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">과제</p>
        <p className="text-2xl font-bold text-green-600">{summary.avgAssignment.toFixed(1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">출석</p>
        <p className="text-2xl font-bold text-yellow-600">{summary.avgAttendance.toFixed(1)}</p>
      </div>
    </div>
  );
};
