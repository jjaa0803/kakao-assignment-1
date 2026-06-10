// 날짜 관련 공용 유틸 함수
// Todo의 date는 "YYYY-MM-DD" 문자열 형태로 저장해요

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Date 객체를 "YYYY-MM-DD" 문자열로 변환
 * 로컬 타임존 기준 (toISOString은 UTC 기준이라 시차 문제 발생 가능)
 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * "YYYY-MM-DD" 문자열을 Date 객체로 변환
 */
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 날짜를 며칠 더하거나 빼서 반환
 */
export function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * 사용자에게 보여줄 날짜 형식: "2026년 6월 10일 (수)"
 */
export function formatDateForDisplay(dateStr) {
  const d = parseDate(dateStr);
  const dayName = DAY_NAMES[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayName})`;
}
