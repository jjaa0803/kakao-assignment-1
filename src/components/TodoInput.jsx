import { useState } from "react";

/**
 * 입력창 + 추가 버튼
 * - text: 입력창에 적고 있는 글자 (이 컴포넌트만 알면 되는 상태라 여기서 관리)
 * - message: 빈 값 제출 시 보여줄 안내 메시지
 * - onAdd: 부모(App)가 내려준 "todo 추가" 함수 (props)
 */
function TodoInput({ onAdd }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // form 제출 시 페이지 새로고침 방지

    const trimmed = text.trim();
    if (!trimmed) {
      setMessage("할 일을 입력해주세요.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    onAdd(trimmed);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          추가
        </button>
      </div>
      {/* 메시지가 있을 때만 보여주는 조건부 렌더링 */}
      {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </form>
  );
}

export default TodoInput;
