import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SimpleCalendar = ({ schedules, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const getSchedulesForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.filter((s) => {
      const scheduleDate = new Date(s.startTime).toISOString().split('T')[0];
      return scheduleDate === dateStr;
    });
  };

  const renderDays = () => {
    const days = [];

    // 이전 달 빈 칸
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-900"></div>);
    }

    // 이번 달 날짜
    for (let day = 1; day <= totalDays; day++) {
      const daySchedules = getSchedulesForDate(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <div
          key={day}
          onClick={() => onDateClick && onDateClick(new Date(year, month, day))}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
            isToday ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-850'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {daySchedules.slice(0, 2).map((schedule, idx) => (
              <div
                key={idx}
                className="text-xs px-2 py-1 rounded truncate"
                style={{
                  backgroundColor: schedule.color || '#3b82f6',
                  color: 'white',
                }}
                title={schedule.title}
              >
                {schedule.title}
              </div>
            ))}
            {daySchedules.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                +{daySchedules.length - 2} 더보기
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map((day, idx) => (
          <div
            key={day}
            className={`text-center py-3 font-medium text-sm ${
              idx === 0 ? 'text-red-600' : idx === 6 ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">{renderDays()}</div>
    </div>
  );
};

export default SimpleCalendar;
