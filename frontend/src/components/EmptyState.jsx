/**
 * EmptyState - 공통 빈 상태 컴포넌트
 * ecampus UX 분석 기반 개선: 단순 텍스트 → 아이콘 + 메시지 + 액션
 */

const PRESETS = {
  course:       { emoji: '📚', title: '수강 중인 강의가 없어요', desc: '강의를 수강 신청하면 여기에 표시돼요' },
  assignment:   { emoji: '📝', title: '과제가 없어요', desc: '새로운 과제가 등록되면 여기에 나타나요' },
  notice:       { emoji: '📢', title: '공지사항이 없어요', desc: '새로운 공지가 등록되면 알려드릴게요' },
  notification: { emoji: '🔔', title: '알림이 없어요', desc: '새로운 알림이 오면 여기에 표시돼요' },
  todo:         { emoji: '✅', title: '할 일이 없어요', desc: '새로운 할 일을 추가해보세요' },
  chat:         { emoji: '💬', title: '메시지가 없어요', desc: '첫 번째 메시지를 보내보세요!' },
  attendance:   { emoji: '📋', title: '출석 기록이 없어요', desc: '강의 출석 현황이 여기에 표시돼요' },
  search:       { emoji: '🔍', title: '검색 결과가 없어요', desc: '다른 키워드로 검색해보세요' },
  grade:        { emoji: '🎓', title: '성적이 없어요', desc: '성적이 등록되면 여기에 표시돼요' },
  generic:      { emoji: '📭', title: '데이터가 없어요', desc: '아직 등록된 내용이 없습니다' },
};

function EmptyState({
  type = 'generic',
  title,
  desc,
  emoji,
  action,
  actionLabel,
  size = 'md',
}) {
  const preset = PRESETS[type] || PRESETS.generic;
  const displayEmoji = emoji || preset.emoji;
  const displayTitle = title || preset.title;
  const displayDesc = desc || preset.desc;

  const sizeMap = {
    sm: { wrap: 'py-6', emojiBox: 'w-12 h-12 text-2xl', title: 'text-sm', desc: 'text-xs' },
    md: { wrap: 'py-10', emojiBox: 'w-16 h-16 text-3xl', title: 'text-base', desc: 'text-sm' },
    lg: { wrap: 'py-16', emojiBox: 'w-20 h-20 text-4xl', title: 'text-lg', desc: 'text-base' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center ${s.wrap} text-center px-4`}>
      <div className={`${s.emojiBox} bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3 select-none`}>
        {displayEmoji}
      </div>
      <p className={`${s.title} font-semibold text-gray-700 dark:text-gray-300 mb-1`}>{displayTitle}</p>
      <p className={`${s.desc} text-gray-400 dark:text-gray-500 mb-4`}>{displayDesc}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
