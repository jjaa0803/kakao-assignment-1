// app/todos/new/page.tsx
//
// ⭐ 이 파일은 'use client'가 없으므로 "Server Component"입니다.
//    덕분에 폼 처리 로직(Server Action)을 같은 파일 안에 서버 코드로 둘 수 있어요.
//
// 💡 왜 'use client'가 아니라 Server Action을 썼나?
//    - 폼 제출 → 생성 → 목록 이동까지 "서버에서" 한 번에 처리됩니다.
//    - 백엔드 주소(localhost:8000)나 생성 로직이 브라우저에 노출되지 않습니다.
//    - 자바스크립트가 아직 안 켜졌어도 일반 HTML 폼처럼 제출됩니다(progressive enhancement).

import Link from "next/link";
import { redirect } from "next/navigation"; // 서버에서 다른 페이지로 보내는 함수
import { revalidatePath } from "next/cache"; // 특정 경로의 캐시를 새로고침(최신화)하는 함수

// 🔧 Server Action: 폼이 제출되면 "서버에서" 실행되는 함수입니다.
//    함수 본문 맨 위의 'use server'가 "이건 서버 액션이다"라는 표시예요.
async function createTodo(formData: FormData) {
  "use server";

  // 폼의 <input name="title">에서 입력값을 꺼냄. 양쪽 공백 제거.
  const title = String(formData.get("title") ?? "").trim();

  // 빈 값이면 생성하지 않고 다시 작성 페이지로 돌려보냄
  if (!title) {
    redirect("/todos/new");
  }

  // 백엔드 주소를 환경변수(.env.local의 BACKEND_URL)에서 읽음. 없으면 localhost로 대체.
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

  // 백엔드(FastAPI)에 새 todo 생성 요청 (POST)
  const res = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // 본문이 JSON임을 알림
    body: JSON.stringify({ title }), // 백엔드 스키마(TodoCreate)에 맞춰 title만 전송
  });

  // 생성 실패(서버 꺼짐/검증 실패 등)면 에러를 던짐
  //  → 필요하면 이 폴더에도 error.tsx를 둬서 에러 화면을 보여줄 수 있습니다.
  if (!res.ok) {
    throw new Error(`할 일 생성에 실패했습니다 (상태 코드: ${res.status})`);
  }

  // 목록 페이지(/todos)의 캐시를 새로고침 → 방금 만든 항목이 목록에 바로 보이도록
  revalidatePath("/todos");

  // 목록 페이지로 이동.
  // ⚠️ redirect는 "예외를 던지는" 방식으로 동작하므로, 절대 try/catch 안에 넣지 마세요.
  //    (위 fetch 에러 처리와 분리해서 마지막에 호출하는 이유)
  redirect("/todos");
}

// 📄 작성 폼을 보여주는 페이지 컴포넌트
export default function NewTodoPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            새 할 일
          </h1>
          {/* 목록으로 돌아가는 링크 */}
          <Link
            href="/todos"
            className="text-sm text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← 목록으로
          </Link>
        </header>

        {/* action에 Server Action 함수를 그대로 연결.
            제출 시 createTodo가 FormData를 자동으로 받아 서버에서 실행됩니다. */}
        <form action={createTodo} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              할 일 내용
            </span>
            <input
              type="text"
              name="title" // ← Server Action에서 formData.get("title")로 꺼내 쓰는 이름
              required // 비어 있으면 브라우저가 제출을 막아 줌 (1차 검증)
              autoFocus
              placeholder="예: 장보기"
              className="rounded-lg border border-black/[.12] bg-white px-4 py-2.5 text-black outline-none transition-colors focus:border-zinc-500 dark:border-white/[.18] dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            추가
          </button>
        </form>
      </main>
    </div>
  );
}
