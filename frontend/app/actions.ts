"use server";
// ⭐ 파일 맨 위의 'use server' = 이 파일이 export하는 모든 함수는 "Server Action"이라는 표시.
//    - 항상 "서버에서" 실행됩니다 (브라우저에 코드/주소가 노출되지 않음).
//    - Server Component에서는 그냥 함수처럼 await로 호출하고,
//      Client Component에서는 import해서 호출하면 Next.js가 자동으로 서버에 네트워크 요청을 보냅니다.
//
// ⚠️ 'use server' 파일은 "async 함수"만 export할 수 있습니다.
//    (그래서 Todo 타입은 export하지 않고 파일 안에서만 사용합니다.)

import { revalidatePath } from "next/cache"; // 특정 경로의 캐시를 새로고침해 최신 데이터를 보이게 함

// FastAPI 백엔드 주소를 환경변수(.env.local의 BACKEND_URL)에서 읽음
// 값이 없으면 안전하게 localhost로 대체(fallback)
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// 백엔드가 돌려주는 todo 한 개의 모양 (이 파일 내부 주석/타입용)
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

// ───────────────────────────────────────────────────────────────
// 📋 목록 조회 (READ)
//   어디서 호출? → 주로 Server Component(예: app/todos/page.tsx)에서
//                  const todos = await getTodos() 형태로 직접 호출.
// ───────────────────────────────────────────────────────────────
export async function getTodos(): Promise<Todo[]> {
  // cache: "no-store" → 매번 백엔드에서 최신 목록을 가져옴 (캐시 안 함)
  const res = await fetch(`${BACKEND_URL}/todos`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Todo 목록 조회 실패 (상태 코드: ${res.status})`);
  }
  return res.json();
}

// ───────────────────────────────────────────────────────────────
// ➕ 생성 (CREATE)
//   어디서 호출? → <form action={createTodo}> 의 폼 제출 시 자동 호출.
//                  폼이 제출되면 입력값이 FormData로 자동 전달됩니다.
// ───────────────────────────────────────────────────────────────
export async function createTodo(formData: FormData) {
  // 폼의 <input name="title"> 값을 꺼내고 양쪽 공백 제거
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return; // 빈 값이면 아무것도 하지 않음

  const res = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // 본문이 JSON임을 알림
    body: JSON.stringify({ title }), // 백엔드 스키마(TodoCreate)에 맞게 title만 전송
  });
  if (!res.ok) {
    throw new Error(`Todo 생성 실패 (상태 코드: ${res.status})`);
  }

  // 목록 페이지 캐시를 새로고침 → 새 항목이 목록에 바로 반영됨
  revalidatePath("/todos");
}

// ───────────────────────────────────────────────────────────────
// ✏️ 수정 (UPDATE)
//   어디서 호출? → 보통 Client Component의 버튼 클릭(onClick)에서
//                  await updateTodo(id, { completed: true }) 처럼 직접 호출.
//   (title/completed 중 보낸 값만 수정됨 — 백엔드의 TodoUpdate가 선택 필드라서)
// ───────────────────────────────────────────────────────────────
export async function updateTodo(
  id: number,
  data: { title?: string; completed?: boolean },
) {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Todo 수정 실패 (상태 코드: ${res.status})`);
  }

  revalidatePath("/todos");
}

// ───────────────────────────────────────────────────────────────
// 🗑️ 삭제 (DELETE)
//   어디서 호출? → 보통 Client Component의 버튼 클릭에서
//                  await deleteTodo(id) 처럼 직접 호출.
// ───────────────────────────────────────────────────────────────
export async function deleteTodo(id: number) {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, { method: "DELETE" });
  // 삭제 성공 시 백엔드는 204(No Content)를 반환 → res.ok는 true
  if (!res.ok) {
    throw new Error(`Todo 삭제 실패 (상태 코드: ${res.status})`);
  }

  revalidatePath("/todos");
}
