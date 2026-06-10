import TodoItem from "./TodoItem";

// 필터별 빈 상태 안내 문구
const EMPTY_MESSAGES = {
  all: "아직 등록된 할 일이 없어요.",
  active: "진행 중인 할 일이 없어요.",
  done: "완료된 할 일이 없어요.",
};

/**
 * Todo 목록
 * - todos: 화면에 보여줄 (이미 필터링된) todo 배열 (props)
 * - 목록이 비어 있으면 안내 문구를 대신 보여줘요
 */
function TodoList({ todos, filter, onToggle, onUpdate, onDelete }) {
  if (todos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        {EMPTY_MESSAGES[filter]}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        // key: React가 목록에서 어떤 항목이 바뀌었는지 추적하기 위한 고유값
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TodoList;
