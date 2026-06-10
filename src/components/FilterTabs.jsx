// 탭 목록 정의 (value는 내부 상태값, label은 화면에 보이는 글자)
const FILTERS = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "done", label: "완료" },
];

/**
 * 전체 / 진행 중 / 완료 필터 탭
 * - filter: 현재 선택된 필터 값 (props로 받아서 읽기만 함)
 * - onChange: 탭 클릭 시 부모(App)의 필터 상태를 바꾸는 함수
 */
function FilterTabs({ filter, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
            filter === value
              ? "bg-white text-blue-600 shadow-sm" // 선택된 탭은 흰 배경으로 구분
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
