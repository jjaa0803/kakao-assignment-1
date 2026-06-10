import { formatDateForDisplay } from "../utils/date";

/**
 * 일간 뷰 날짜 네비게이션 (◀ 2026년 6월 10일 (수) ▶ / 오늘)
 * - selectedDate: 현재 선택된 날짜 "YYYY-MM-DD" (props)
 * - onPrevDay / onNextDay / onToday: 날짜 이동 함수 (부모 App에서 내려줌)
 */
function DateNav({ selectedDate, onPrevDay, onNextDay, onToday }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevDay}
        aria-label="이전 날짜"
        className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-100"
      >
        ◀
      </button>

      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-gray-800">
          {formatDateForDisplay(selectedDate)}
        </span>
        <button
          type="button"
          onClick={onToday}
          className="rounded-md border border-gray-300 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
        >
          오늘
        </button>
      </div>

      <button
        type="button"
        onClick={onNextDay}
        aria-label="다음 날짜"
        className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-100"
      >
        ▶
      </button>
    </div>
  );
}

export default DateNav;
