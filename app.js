// =====================================================
// Todo 앱 - Vanilla JS
// 기능: CRUD, 상태 필터, 일간 뷰, 주간 뷰, localStorage 연동
// =====================================================

// ====== 상수 ======
const STORAGE_KEY = "todos"; // localStorage에 저장할 키 이름
const THEME_STORAGE_KEY = "theme"; // localStorage에 저장할 테마 키 이름
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const MESSAGE_DURATION_MS = 2000; // 안내 메시지 표시 시간

// ====== 상태 ======
// todos: 모든 할 일 데이터 (배열)
//   각 항목 형태: { id, text, done, date }  (date: "YYYY-MM-DD" 문자열)
let todos = [];
let selectedDate = formatDate(new Date()); // 현재 선택된 날짜 (문자열)
let weekStartDate = getWeekStart(new Date()); // 주간 뷰에서 보고 있는 주의 시작일 (월요일)
let currentFilter = "all"; // 현재 선택된 필터: "all" | "active" | "done"
let editingId = null; // 현재 수정 중인 todo의 id (없으면 null)
let currentTheme = "light"; // 현재 테마: "light" | "dark"

// ====== DOM 요소 캐싱 ======
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const formMessage = document.getElementById("formMessage");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const filterTabs = document.querySelectorAll(".filter-tab");
const dayLabel = document.getElementById("dayLabel");
const prevDayBtn = document.getElementById("prevDayBtn");
const nextDayBtn = document.getElementById("nextDayBtn");
const todayBtn = document.getElementById("todayBtn");
const weekDays = document.getElementById("weekDays");
const weekLabel = document.getElementById("weekLabel");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const progressSection = document.getElementById("progressSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

// =====================================================
// 날짜 유틸 함수
// =====================================================

/**
 * Date 객체를 "YYYY-MM-DD" 문자열로 변환
 * 로컬 타임존 기준 (toISOString은 UTC 기준이라 시차 문제 발생 가능)
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * "YYYY-MM-DD" 문자열을 Date 객체로 변환
 */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 해당 날짜가 속한 주의 월요일을 반환
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0(일) ~ 6(토)
  // 월요일이 시작일이 되도록 보정 (일요일이면 -6, 그 외엔 1-day)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

/**
 * 날짜를 며칠 더하거나 빼서 반환
 */
function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * 사용자에게 보여줄 날짜 형식: "2026년 6월 2일 (화)"
 */
function formatDateForDisplay(dateStr) {
  const d = parseDate(dateStr);
  const dayName = DAY_NAMES[d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayName})`;
}

/**
 * 주간 라벨: "6월 1일 ~ 6월 7일"
 */
function formatWeekLabel(startDateStr) {
  const start = parseDate(startDateStr);
  const end = parseDate(addDays(startDateStr, 6));
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;
}

// =====================================================
// 데이터 관리 (localStorage)
// =====================================================

/**
 * localStorage에서 todos 불러오기
 * 데이터가 없거나 파싱 실패 시 빈 배열 반환
 */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    // JSON 파싱 실패 시 안전하게 빈 배열로 초기화
    todos = [];
  }
}

/**
 * todos를 localStorage에 저장
 */
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// =====================================================
// 테마 관리 (다크 모드)
// =====================================================

/**
 * localStorage에서 테마 불러오기
 * 저장된 값이 없으면 "light"로 기본 설정
 */
function loadTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  currentTheme = saved === "dark" ? "dark" : "light";
}

/**
 * 현재 테마를 body 클래스에 반영하고 토글 버튼 아이콘/라벨 갱신
 * + localStorage에 저장
 */
function applyTheme() {
  if (currentTheme === "dark") {
    document.body.classList.add("dark");
    themeToggleBtn.textContent = "☀";
    themeToggleBtn.setAttribute("aria-label", "라이트 모드 전환");
  } else {
    document.body.classList.remove("dark");
    themeToggleBtn.textContent = "☾";
    themeToggleBtn.setAttribute("aria-label", "다크 모드 전환");
  }
  localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
}

/**
 * 라이트 ↔ 다크 모드 전환
 */
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme();
}

// =====================================================
// 안내 메시지
// =====================================================

let messageTimer = null;
function showMessage(text) {
  formMessage.textContent = text;
  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    formMessage.textContent = "";
  }, MESSAGE_DURATION_MS);
}

// =====================================================
// Todo CRUD
// =====================================================

/**
 * 새 Todo 추가
 * 빈 값이면 안내 메시지를 띄우고 추가하지 않음
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showMessage("할 일을 입력해주세요.");
    return false;
  }
  todos.push({
    id: Date.now() + Math.random(), // 간단한 고유 id 생성
    text: trimmed,
    done: false,
    date: selectedDate, // 현재 선택된 날짜에 저장
  });
  saveTodos();
  return true;
}

/**
 * Todo 완료 상태 토글
 */
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    saveTodos();
  }
}

/**
 * Todo 텍스트 수정
 */
function updateTodo(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    showMessage("내용은 비울 수 없어요.");
    return false;
  }
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = trimmed;
    saveTodos();
    return true;
  }
  return false;
}

/**
 * Todo 삭제
 */
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
}

// =====================================================
// 렌더링
// =====================================================

/**
 * 현재 필터와 선택된 날짜에 맞는 todos만 반환
 */
function getVisibleTodos() {
  return todos
    .filter((t) => t.date === selectedDate) // 선택된 날짜만
    .filter((t) => {
      if (currentFilter === "active") return !t.done;
      if (currentFilter === "done") return t.done;
      return true; // "all"
    });
}

/**
 * Todo 목록 렌더링
 */
function renderTodos() {
  const visible = getVisibleTodos();
  todoList.innerHTML = "";

  // 빈 상태 처리
  if (visible.length === 0) {
    emptyState.classList.add("visible");
    emptyState.textContent =
      currentFilter === "all"
        ? "아직 등록된 할 일이 없어요."
        : currentFilter === "active"
        ? "진행 중인 할 일이 없어요."
        : "완료된 할 일이 없어요.";
    return;
  }
  emptyState.classList.remove("visible");

  // 각 todo를 li 요소로 만들어 추가
  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;

    // 체크박스 (완료 토글)
    const checkbox = document.createElement("button");
    checkbox.className = "todo-checkbox";
    checkbox.setAttribute("aria-label", todo.done ? "완료 취소" : "완료 처리");
    checkbox.textContent = todo.done ? "✓" : "";
    checkbox.addEventListener("click", () => {
      toggleTodo(todo.id);
      render();
    });

    // 텍스트 (수정 모드일 때는 input 표시)
    let textEl;
    if (editingId === todo.id) {
      textEl = document.createElement("input");
      textEl.type = "text";
      textEl.className = "todo-edit-input";
      textEl.value = todo.text;
      // 자동 포커스 + 텍스트 선택
      setTimeout(() => {
        textEl.focus();
        textEl.select();
      }, 0);

      const finishEdit = (save) => {
        if (save) {
          const ok = updateTodo(todo.id, textEl.value);
          if (!ok) return; // 빈 값이면 수정 모드 유지
        }
        editingId = null;
        render();
      };

      textEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finishEdit(true);
        if (e.key === "Escape") finishEdit(false);
      });
      textEl.addEventListener("blur", () => finishEdit(true));
    } else {
      textEl = document.createElement("span");
      textEl.className = "todo-text";
      textEl.textContent = todo.text;
      // 더블클릭으로도 수정 진입
      textEl.addEventListener("dblclick", () => {
        editingId = todo.id;
        render();
      });
    }

    // 액션 버튼들 (수정, 삭제)
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "todo-action-btn";
    editBtn.textContent = "✎";
    editBtn.setAttribute("aria-label", "수정");
    editBtn.addEventListener("click", () => {
      editingId = editingId === todo.id ? null : todo.id;
      render();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-action-btn delete";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "삭제");
    deleteBtn.addEventListener("click", () => {
      deleteTodo(todo.id);
      render();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(textEl);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

/**
 * 일간 뷰 라벨 갱신
 */
function renderDayLabel() {
  dayLabel.textContent = formatDateForDisplay(selectedDate);
}

/**
 * 진행률 렌더링
 * 선택된 날짜 기준 전체/완료 개수를 계산해 텍스트와 진행 바에 반영
 * 할 일이 0개면 영역 자체를 숨김
 */
function renderProgress() {
  const dayTodos = todos.filter((t) => t.date === selectedDate);
  const total = dayTodos.length;

  if (total === 0) {
    progressSection.classList.add("hidden");
    return;
  }
  progressSection.classList.remove("hidden");

  const done = dayTodos.filter((t) => t.done).length;
  const percent = (done / total) * 100;

  progressText.textContent = `전체 ${total}개 중 ${done}개 완료`;
  progressFill.style.width = `${percent}%`;
}

/**
 * 주간 뷰 렌더링 (월~일 7개 날짜)
 */
function renderWeekView() {
  weekLabel.textContent = formatWeekLabel(weekStartDate);
  weekDays.innerHTML = "";

  const today = formatDate(new Date());

  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(weekStartDate, i);
    const dateObj = parseDate(dateStr);
    // 해당 날짜의 할 일 개수
    const count = todos.filter((t) => t.date === dateStr).length;

    const li = document.createElement("li");
    li.className = "week-day";
    if (dateStr === selectedDate) li.classList.add("selected");
    if (dateStr === today) li.classList.add("today");

    const nameEl = document.createElement("span");
    nameEl.className = "week-day-name";
    nameEl.textContent = DAY_NAMES[dateObj.getDay()];

    const dateEl = document.createElement("span");
    dateEl.className = "week-day-date";
    dateEl.textContent = dateObj.getDate();

    const countEl = document.createElement("span");
    countEl.className = "week-day-count" + (count === 0 ? " empty" : "");
    countEl.textContent = count;

    li.appendChild(nameEl);
    li.appendChild(dateEl);
    li.appendChild(countEl);

    li.addEventListener("click", () => {
      selectedDate = dateStr;
      editingId = null;
      render();
    });

    weekDays.appendChild(li);
  }
}

/**
 * 전체 렌더링 (모든 UI 부분을 한 번에 갱신)
 */
function render() {
  renderDayLabel();
  renderWeekView();
  renderProgress();
  renderTodos();
}

// =====================================================
// 이벤트 핸들러 연결
// =====================================================

// Todo 추가 폼 제출
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = addTodo(todoInput.value);
  if (ok) {
    todoInput.value = "";
    render();
  }
});

// 필터 탭 클릭
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderTodos();
  });
});

// 날짜 이동 (이전/다음/오늘)
prevDayBtn.addEventListener("click", () => {
  selectedDate = addDays(selectedDate, -1);
  // 주간 뷰 범위 밖으로 나가면 주간 뷰도 같이 이동
  if (selectedDate < weekStartDate) {
    weekStartDate = getWeekStart(parseDate(selectedDate));
  }
  editingId = null;
  render();
});

nextDayBtn.addEventListener("click", () => {
  selectedDate = addDays(selectedDate, 1);
  if (selectedDate > addDays(weekStartDate, 6)) {
    weekStartDate = getWeekStart(parseDate(selectedDate));
  }
  editingId = null;
  render();
});

todayBtn.addEventListener("click", () => {
  const today = formatDate(new Date());
  selectedDate = today;
  weekStartDate = getWeekStart(new Date());
  editingId = null;
  render();
});

// 주간 이동
prevWeekBtn.addEventListener("click", () => {
  weekStartDate = addDays(weekStartDate, -7);
  renderWeekView();
});

nextWeekBtn.addEventListener("click", () => {
  weekStartDate = addDays(weekStartDate, 7);
  renderWeekView();
});

// 다크 모드 토글
themeToggleBtn.addEventListener("click", toggleTheme);

// 키보드 단축키
document.addEventListener("keydown", (e) => {
  // Ctrl+K / Cmd+K: 입력창에 포커스
  // (Cmd+N은 OS/브라우저 시스템 단축키라 preventDefault로 막을 수 없어 K로 대체)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    todoInput.focus();
    return;
  }
  // Esc: 수정 중인 todo가 있으면 수정 취소
  // (input 내부의 ESC 핸들러가 먼저 처리하지만, 포커스가 빠진 경우 등 안전망 역할)
  if (e.key === "Escape" && editingId !== null) {
    editingId = null;
    render();
  }
});

// =====================================================
// 초기화
// =====================================================
loadTheme(); // 저장된 테마 불러오기
applyTheme(); // 화면에 테마 적용
loadTodos(); // 저장된 데이터 불러오기
render(); // 첫 렌더링
