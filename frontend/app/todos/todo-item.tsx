"use client";
// ⭐ 이 컴포넌트는 "Client Component"입니다.
//    버튼 클릭(onClick) 같은 "상호작용"은 브라우저에서 동작해야 하므로 'use client'가 필요해요.
//    (Server Component인 page.tsx 안에서는 onClick을 직접 쓸 수 없어서 이 부분만 따로 분리했습니다.)

import Link from "next/link";
import { useTransition } from "react"; // 서버 작업이 진행되는 동안 "처리 중" 상태를 관리해 줌
import { updateTodo, deleteTodo } from "@/app/actions"; // 이미 만든 Server Action 가져오기

// page.tsx에서 todo 한 개를 prop으로 받음
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TodoItem({ todo }: { todo: Todo }) {
  // isPending: 서버 작업(수정/삭제)이 진행 중인지 여부 → 진행 중엔 버튼을 비활성화
  const [isPending, startTransition] = useTransition();

  // ✅ 완료 토글: 현재 completed 값을 반대로 뒤집어 updateTodo(PUT) 호출
  function handleToggle() {
    startTransition(async () => {
      try {
        await updateTodo(todo.id, { completed: !todo.completed });
        // 성공하면 actions.ts 안의 revalidatePath("/todos")가 목록을 자동 새로고침해 줍니다.
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "완료 상태 변경에 실패했어요");
      }
    });
  }

  // 🗑️ 삭제: 확인창을 띄운 뒤 deleteTodo(DELETE) 호출
  function handleDelete() {
    // 실수로 지우는 걸 막기 위해 한 번 더 확인
    if (!window.confirm(`"${todo.title}"을(를) 삭제할까요?`)) return;

    startTransition(async () => {
      try {
        await deleteTodo(todo.id);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "삭제에 실패했어요");
      }
    });
  }

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg border border-black/[.08] bg-white px-4 py-3 dark:border-white/[.145] dark:bg-zinc-900 ${
        isPending ? "opacity-50" : "" // 처리 중엔 살짝 흐리게 표시
      }`}
    >
      {/* 제목: 완료된 항목은 회색 + 취소선으로 시각적으로 구분 */}
      <span
        className={
          todo.completed
            ? "truncate text-zinc-400 line-through"
            : "truncate text-black dark:text-zinc-50"
        }
      >
        {todo.title}
      </span>

      {/* 오른쪽: 완료 토글 / 수정 / 삭제 버튼 묶음 */}
      <div className="flex shrink-0 items-center gap-2 text-xs font-medium">
        {/* 완료 토글 버튼 — 상태에 따라 라벨과 색이 달라짐 */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={
            todo.completed
              ? "rounded-md border border-zinc-300 px-2.5 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              : "rounded-md border border-green-300 px-2.5 py-1 text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
          }
        >
          {todo.completed ? "완료 취소" : "완료"}
        </button>

        {/* 수정 버튼 — 클릭하면 /todos/{id} 수정 페이지로 이동 (아직 안 만든 다음 단계) */}
        <Link
          href={`/todos/${todo.id}`}
          className="rounded-md border border-zinc-300 px-2.5 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          수정
        </Link>

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md border border-red-300 px-2.5 py-1 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
