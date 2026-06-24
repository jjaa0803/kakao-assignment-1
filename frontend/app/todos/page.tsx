// app/todos/page.tsx
//
// ⭐ 이 파일은 "Server Component"(서버에서 실행되는 컴포넌트)입니다.
//    - 맨 위에 'use client' 표시가 "없으면" App Router에서는 기본이 Server Component예요.
//    - 서버에서 실행되므로 컴포넌트 함수에 async/await를 바로 쓸 수 있고,
//      DB나 API 호출을 서버에서 처리한 뒤 "완성된 HTML"만 브라우저로 보냅니다.
//    - 그래서 fetch 주소(http://localhost:8000)나 데이터 처리 로직이 브라우저에 노출되지 않습니다.

import Link from "next/link"; // 페이지 간 이동 링크 (Next.js 전용, 빠른 화면 전환)
import TodoItem from "./todo-item"; // 각 항목의 버튼(완료/수정/삭제)을 담은 Client Component

// 백엔드(FastAPI)가 돌려주는 todo 한 개의 모양(타입)
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

// todo 목록을 백엔드에서 가져오는 함수
async function getTodos(): Promise<Todo[]> {
  // 백엔드 주소를 환경변수(.env.local의 BACKEND_URL)에서 읽음. 없으면 localhost로 대체.
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
  // 💡 Next.js 16에서 fetch는 "기본적으로 캐시하지 않음" → 요청할 때마다 최신 목록을 가져옵니다.
  const res = await fetch(`${BACKEND_URL}/todos`);

  // 응답이 실패(서버 꺼짐/500 등)면 에러를 던짐
  //  → 같은 폴더의 error.tsx가 이 에러를 자동으로 "잡아서" 에러 화면을 보여줍니다.
  if (!res.ok) {
    throw new Error(`Todo 목록을 불러오지 못했습니다 (상태 코드: ${res.status})`);
  }

  return res.json();
}

// 📄 페이지 컴포넌트.
//    함수 앞에 async를 붙일 수 있는 이유 = 이 컴포넌트가 Server Component이기 때문!
//    (Client Component는 async 컴포넌트로 만들 수 없습니다.)
export default async function TodosPage() {
  const todos = await getTodos(); // 서버에서 데이터를 다 받은 뒤에 화면을 그림

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-2xl">
        {/* 상단: 제목 + 생성 페이지로 가는 링크 */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            할 일 목록
          </h1>
          {/* 생성 페이지로 이동하는 링크 (아직 안 만든 /todos/new 경로) */}
          <Link
            href="/todos/new"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            + 새 할 일
          </Link>
        </header>

        {/* 목록이 비어 있을 때 vs 있을 때 */}
        {todos.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            아직 할 일이 없어요. 오른쪽 위 버튼으로 추가해 보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              // key={todo.id}: 리스트의 각 항목을 React가 구분하기 위한 고유값 (필수)
              // 항목의 화면/버튼은 Client Component인 TodoItem이 담당
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
