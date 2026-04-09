import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react';

const SimpleCalendar = ({ schedules, academicSchedules = [], onDateClick, onScheduleClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ─── 헬퍼 ───────────────────────────────────────────────────────────────
  const getSchedulesForDate = (y, m, d) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const personal = schedules.filter((s) => {
      if (!s.startTime) return false;
      return new Date(s.startTime).toLocaleDateString('sv-SE') === dateStr;
    });
    const academic = academicSchedules.filter((s) => {
      if (!s.date) return false;
      // 범위 일정: date가 "YYYY-MM-DD ~ YYYY-MM-DD" 형태
      if (s.date.includes('~')) {
        const [start, end] = s.date.split('~').map(d => d.trim());
        return dateStr >= start && dateStr <= end;
      }
      return s.date === dateStr;
    });
    return { personal, academic };
  };

  const isToday = (y, m, d) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const goToToday = () => setCurrentDate(new Date());

  // ─── 월 뷰 ──────────────────────────────────────────────────────────────
  const renderMonthView = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      cells.push(
        <DayCell
          key={`prev-${d}`}
          day={d} year={prevYear} month={prevMonth} dimmed
          {...getSchedulesForDate(prevYear, prevMonth, d)}
          onDateClick={onDateClick} onScheduleClick={onScheduleClick}
        />
      );
    }

    for (let d = 1; d <= lastDay; d++) {
      cells.push(
        <DayCell
          key={`cur-${d}`}
          day={d} year={year} month={month}
          today={isToday(year, month, d)}
          {...getSchedulesForDate(year, month, d)}
          onDateClick={onDateClick} onScheduleClick={onScheduleClick}
        />
      );
    }

    const totalCells = cells.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      cells.push(
        <DayCell
          key={`next-${d}`}
          day={d} year={nextYear} month={nextMonth} dimmed
          {...getSchedulesForDate(nextYear, nextMonth, d)}
          onDateClick={onDateClick} onScheduleClick={onScheduleClick}
        />
      );
    }

    return <div className="grid grid-cols-7">{cells}</div>;
  };

  // ─── 주 뷰 ──────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="grid grid-cols-7">
        {days.map((d) => (
          <DayCell
            key={d.toISOString()}
            day={d.getDate()} year={d.getFullYear()} month={d.getMonth()}
            today={isToday(d.getFullYear(), d.getMonth(), d.getDate())}
            {...getSchedulesForDate(d.getFullYear(), d.getMonth(), d.getDate())}
            onDateClick={onDateClick} onScheduleClick={onScheduleClick}
            tall
          />
        ))}
      </div>
    );
  };

  // ─── 네비게이션 ─────────────────────────────────────────────────────────
  const goPrev = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }
  };

  const goNext = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }
  };

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayNames = ['일','월','화','수','목','금','토'];

  const getWeekTitle = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.getMonth() + 1}월 ${startOfWeek.getDate()}일 ~ ${endOfWeek.getMonth() + 1}월 ${endOfWeek.getDate()}일`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <ChevronLeft className="w-5 h-5 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-bold dark:text-white min-w-[160px] text-center">
            {viewMode === 'month' ? `${year}년 ${monthNames[month]}` : `${year}년 ${getWeekTitle()}`}
          </h2>
          <button onClick={goNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <ChevronRight className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition font-medium"
          >
            오늘
          </button>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1 transition ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarRange className="w-4 h-4" /> 월
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1 transition ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> 주
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map((d, idx) => (
          <div
            key={d}
            className={`text-center py-3 font-medium text-sm ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  );
};

// ─── DayCell 컴포넌트 ────────────────────────────────────────────────────────
const ACADEMIC_COLORS = {
  exam: '#ef4444',
  registration: '#3b82f6',
  holiday: '#10b981',
  default: '#8b5cf6',
};

const DayCell = ({ day, year, month, today, dimmed, personal = [], academic = [], onDateClick, onScheduleClick, tall }) => {
  const dayOfWeek = new Date(year, month, day).getDay();
  const allSchedules = [
    ...personal,
    ...academic.map(a => ({
      ...a,
      _isAcademic: true,
      color: ACADEMIC_COLORS[a.type] || ACADEMIC_COLORS.default,
      title: a.event,
      startTime: null,
    }))
  ];
  const maxVisible = tall ? 6 : 3;

  return (
    <div
      onClick={() => onDateClick && onDateClick(new Date(year, month, day))}
      className={`${tall ? 'min-h-40' : 'min-h-24'} border border-gray-100 dark:border-gray-700 p-1.5 cursor-pointer transition group
        ${today ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'}
        ${dimmed ? 'opacity-40' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition
            ${today ? 'bg-blue-600 text-white' : ''}
            ${!today && dayOfWeek === 0 ? 'text-red-500 dark:text-red-400' : ''}
            ${!today && dayOfWeek === 6 ? 'text-blue-500 dark:text-blue-400' : ''}
            ${!today && dayOfWeek !== 0 && dayOfWeek !== 6 ? 'text-gray-700 dark:text-gray-300' : ''}
          `}
        >
          {day}
        </span>
        {allSchedules.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 pr-0.5">{allSchedules.length}</span>
        )}
      </div>

      <div className="space-y-0.5 overflow-hidden">
        {allSchedules.slice(0, maxVisible).map((s, idx) => (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              if (!s._isAcademic) onScheduleClick && onScheduleClick(s);
            }}
            className={`text-xs px-1.5 py-0.5 rounded truncate transition ${!s._isAcademic ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-90'}`}
            style={{ backgroundColor: s.color || '#3b82f6', color: 'white' }}
            title={s.title}
          >
            {s.startTime && (
              <span className="opacity-80 mr-1">
                {new Date(s.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}
            {s._isAcademic && <span className="opacity-70 mr-1">[학사]</span>}
            {s.title}
          </div>
        ))}
        {allSchedules.length > maxVisible && (
          <div className="text-xs text-gray-400 dark:text-gray-500 px-1">
            +{allSchedules.length - maxVisible}개 더
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCalendar;
