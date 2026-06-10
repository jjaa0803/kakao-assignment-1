import { useState, useEffect } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import FilterTabs from "./components/FilterTabs";
import DateNav from "./components/DateNav";
import { formatDate, addDays } from "./utils/date";

/**
 * 전체 조립 + 상태 관리
 * - todos: 모든 할 일 데이터. 각 항목: { id, text, done, date }
 * - selectedDate: 일간 뷰에서 선택된 날짜 ("YYYY-MM-DD")
 * - filter: 현재 필터 ("all" | "active" | "done")
 * 여러 컴포넌트가 함께 쓰는 상태라서 가장 위인 App에서 관리해요
 */
const STORAGE_KEY = "todos"; // localStorage에 저장할 키 이름

function App() {
  // 함수형 초기화: 최초 마운트(컴포넌트가 처음 생성될 때) 딱 한 번만 실행돼요
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return []; // 저장된 데이터가 깨져 있으면 안전하게 빈 배열로 시작
    }
  });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [filter, setFilter] = useState("all");

  // todos가 바뀔 때마다 localStorage에 자동 저장
  // 1차 과제에서 함수마다 saveTodos()를 직접 불렀던 걸 이 한 곳으로 모았어요
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]); // 의존성 배열: todos가 바뀔 때만 실행

  // ====== Todo CRUD ======
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(), // 간단한 고유 id
      text,
      done: false,
      date: selectedDate, // 현재 선택된 날짜에 저장
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateTodo = (id, newText) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  // ====== 날짜 이동 ======
  const goPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToday = () => setSelectedDate(formatDate(new Date()));

  // 선택된 날짜 + 필터에 맞는 todo만 골라내기
  // 상태(todos, selectedDate, filter)가 바뀌면 자동으로 다시 계산돼요
  const visibleTodos = todos
    .filter((t) => t.date === selectedDate)
    .filter((t) => {
      if (filter === "active") return !t.done;
      if (filter === "done") return t.done;
      return true; // "all"
    });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-bold text-gray-800">
          Todo 앱
        </h1>

        <DateNav
          selectedDate={selectedDate}
          onPrevDay={goPrevDay}
          onNextDay={goNextDay}
          onToday={goToday}
        />

        <TodoInput onAdd={addTodo} />

        <FilterTabs filter={filter} onChange={setFilter} />

        <TodoList
          todos={visibleTodos}
          filter={filter}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>
    </div>
  );
}

export default App;
