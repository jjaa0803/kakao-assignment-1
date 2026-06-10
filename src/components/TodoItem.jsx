import { useState } from "react";

/**
 * Todo 한 줄 (완료 체크 / 인라인 수정 / 삭제)
 * - isEditing: 지금 이 항목이 수정 모드인지 (true면 글자 대신 입력창 표시)
 * - editText: 수정 입력창에 적고 있는 글자
 * - 1차 과제에서 prompt() 팝업으로 하던 수정을, isEditing 상태 하나로 전환해요
 */
function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const startEdit = () => {
    setEditText(todo.text); // 항상 최신 텍스트로 시작
    setIsEditing(true);
  };

  const finishEdit = (save) => {
    if (save) {
      const trimmed = editText.trim();
      if (!trimmed) return; // 빈 값이면 저장하지 않고 수정 모드 유지
      onUpdate(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") finishEdit(true); // Enter: 저장
    if (e.key === "Escape") finishEdit(false); // Esc: 취소
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      {/* 완료 토글 체크박스 */}
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? "완료 취소" : "완료 처리"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
          todo.done
            ? "border-blue-500 bg-blue-500 text-white"
            : "border-gray-300 text-transparent hover:border-blue-400"
        }`}
      >
        ✓
      </button>

      {/* 수정 모드면 입력창, 아니면 텍스트 */}
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => finishEdit(true)}
          autoFocus
          onFocus={(e) => e.target.select()}
          className="flex-1 rounded border border-blue-400 px-2 py-1 text-sm focus:outline-none"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={`flex-1 text-sm ${
            todo.done ? "text-gray-400 line-through" : "text-gray-800"
          }`}
        >
          {todo.text}
        </span>
      )}

      {/* 수정 / 삭제 버튼 */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => (isEditing ? finishEdit(false) : startEdit())}
          aria-label="수정"
          className="rounded px-1.5 py-0.5 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          aria-label="삭제"
          className="rounded px-1.5 py-0.5 text-sm text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
