import { useEffect } from 'react';

/**
 * ESC 키를 누르면 callback 실행
 * @param {Function} callback - ESC 눌렸을 때 실행할 함수
 * @param {boolean} enabled - 활성화 여부 (모달 열려있을 때만 true)
 */
export function useEscapeKey(callback, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      if (e.key === 'Escape') callback();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [callback, enabled]);
}
