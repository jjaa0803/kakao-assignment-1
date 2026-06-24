// app/todos/[id]/page.tsx
//
// ⭐ 이 파일은 "Server Component"입니다('use client' 없음).
//    - 폴더 이름 [id]는 "동적 경로(dynamic route)" → /todos/3 으로 들어오면 id="3"이 됩니다.
//    - 서버에서 해당 todo를 불러와 입력창에 미리 채운 뒤, 폼 제출은 Server Action으로 처리합니다.

import Link from "next/link";
import { notFound, redirect } from "next/navigation"; // 404 표시 / 다른 페이지로 이동
import { getTodos, updateTodo } from "@/app/actions"; // 이미 만든 Server Action 재사용

// 📄 수정 페이지 컴포넌트
//    Next.js 16에서 params는 "Promise"라서 await로 풀어서 써야 합니다.
export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 주소의 [id] 부분을 꺼냄 (문자열)
  const todoId = Number(id); // 숫자로 변환 (백엔드 id가 정수라서)

  // ⚠️ 백엔드에 단건 조회(GET /todos/{id})가 없어, 전체 목록을 가져와 id로 찾습니다.
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === todoId);

  // 해당 id의 todo가 없으면 404 화면을 보여줌
  if (!todo) {
    notFound();
  }

  // 🔧 저장 처리 Server Action (폼 제출 시 서버에서 실행)
  //    이 함수는 위의 todoId 값을 그대로 사용(closure)합니다.
  async function saveTodo(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    // 체크박스는 체크되면 "on", 안 되면 값이 없음 → 불린으로 변환
    const completed = formData.get("completed") === "on";

    // 제목이 비면 저장하지 않고 다시 수정 페이지로 돌려보냄
    if (!title) {
      redirect(`/todos/${todoId}`);
    }

    // 기존 updateTodo(PUT /todos/{id}) 호출 → 내부에서 revalidatePath("/todos")로 목록 갱신
    await updateTodo(todoId, { title, completed });

    // 저장 후 목록으로 이동 (redirect는 예외를 던지므로 try/catch 밖, 맨 마지막에)
    redirect("/todos");
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            할 일 수정
          </h1>
          <Link
            href="/todos"
            className="text-sm text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← 목록으로
          </Link>
        </header>

        {/* action에 Server Action 연결. 제출 시 saveTodo가 FormData를 받아 서버에서 실행됨 */}
        <form action={saveTodo} className="flex flex-col gap-5">
          {/* 제목 입력창 — defaultValue로 "현재 제목"을 미리 채워 둠
              (Server Component 폼은 value가 아니라 defaultValue를 씀) */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              할 일 내용
            </span>
            <input
              type="text"
              name="title"
              required
              defaultValue={todo.title}
              className="rounded-lg border border-black/[.12] bg-white px-4 py-2.5 text-black outline-none transition-colors focus:border-zinc-500 dark:border-white/[.18] dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          {/* 완료 여부 체크박스 — defaultChecked로 현재 상태를 반영 */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="completed"
              defaultChecked={todo.completed}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              완료됨
            </span>
          </label>

          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            저장
          </button>
        </form>
      </main>
    </div>
  );
}
