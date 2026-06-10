# React Todo 앱 (2차 과제)

1차 과제에서 Vanilla JS로 만든 Todo 앱을 React 함수 컴포넌트 구조로 마이그레이션한 프로젝트입니다.

## 사용 기술

- React 19 + Vite
- Tailwind CSS v4
- localStorage (데이터 저장)

## 실행 방법

```bash
npm install
npm run dev
# 브라우저에서 http://localhost:5173 접속
```

## 구현한 기능

### 기본 미션

- **Todo CRUD** — 추가 / 수정 / 완료 토글 / 삭제
  - 빈 입력값 제출 시 안내 메시지 표시
  - `prompt()` 대신 `isEditing` 상태를 활용한 인라인 수정 (Enter 저장, Esc 취소, 더블클릭으로도 수정 진입)
  - 완료된 Todo는 취소선으로 구분
- **상태별 필터링** — 전체 / 진행 중 / 완료 탭, 선택된 탭 시각적 구분, 탭 전환 후에도 필터 유지
- **일간 뷰** — 오늘 날짜 표시, 이전/다음 날짜 이동, 오늘로 돌아가기. Todo는 선택된 날짜에 저장되고 날짜별로 따로 관리
- **로컬스토리지 연동** — `useEffect`로 todos 변경 시 자동 저장, 함수형 초기화로 새로고침 후에도 데이터 유지

## 프로젝트 구조

```
src/
├── components/
│   ├── TodoInput.jsx   # 입력창 + 추가 버튼 (빈 값 검증)
│   ├── TodoList.jsx    # Todo 목록 + 빈 상태 안내
│   ├── TodoItem.jsx    # Todo 한 줄 (완료/인라인 수정/삭제)
│   ├── FilterTabs.jsx  # 전체/진행 중/완료 필터 탭
│   └── DateNav.jsx     # 일간 뷰 날짜 네비게이션
├── utils/
│   └── date.js         # 날짜 변환 유틸 함수
├── App.jsx             # 전체 조립 + 상태 관리 (todos, selectedDate, filter)
├── main.jsx            # 엔트리 포인트
└── index.css           # Tailwind 불러오기
```

## 상태 관리 구조

- 여러 컴포넌트가 함께 쓰는 상태(`todos`, `selectedDate`, `filter`)는 최상위 `App.jsx`에서 `useState`로 관리하고 props로 내려줍니다.
- 한 컴포넌트만 알면 되는 상태(입력창 글자, 수정 모드 여부)는 해당 컴포넌트 안에서 관리합니다.

## Vanilla JS와 달라진 점

| | 1차 과제 (Vanilla JS) | 2차 과제 (React) |
| --- | --- | --- |
| 화면 갱신 | 상태 변경 후 `render()` 직접 호출 | 상태가 바뀌면 자동으로 리렌더링 |
| 수정 UI | `prompt()` 팝업 | `isEditing` 상태로 인라인 입력창 전환 |
| 필터링 | DOM을 직접 숨기고 보여줌 | 필터 상태로 배열을 걸러서 렌더링 |
| 저장 | 함수마다 `saveTodos()` 직접 호출 | `useEffect` 한 곳에서 자동 저장 |
