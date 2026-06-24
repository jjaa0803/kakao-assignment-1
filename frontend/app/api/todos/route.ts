// app/api/todos/route.ts
//
// ⭐ 이 파일은 "Route Handler"입니다. /api/todos 라는 "진짜 HTTP 주소"를 만들어 줍니다.
//    - 브라우저(클라이언트)에서 fetch("/api/todos") 로 요청하면 여기로 들어옵니다.
//    - 우리는 그 요청을 FastAPI(8000)로 "전달(proxy)"하고, 응답을 그대로 돌려줍니다.
//
// 💡 왜 프록시가 필요한가?
//    - 브라우저가 FastAPI 주소(localhost:8000)를 직접 몰라도 됩니다 (주소를 숨김).
//    - 프론트와 "같은 출처(/api/...)"라서 브라우저 CORS 문제가 없습니다.
//    - 함수 이름(GET/POST/PUT/DELETE)이 곧 처리할 HTTP 메서드입니다.

// FastAPI 백엔드 주소를 환경변수(.env.local의 BACKEND_URL)에서 읽음
// 값이 없으면 안전하게 localhost로 대체(fallback)
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// ───────────────────────────────────────────────────────────────
// GET /api/todos
//   언제 호출? → 브라우저의 fetch("/api/todos") (예: 클라이언트에서 목록 조회)
//   하는 일   → FastAPI의 GET /todos 로 전달하고 결과(JSON)를 돌려줌
// ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/todos`, { cache: "no-store" });
    const data = await res.json();
    // FastAPI의 상태 코드를 그대로 유지해서 응답
    return Response.json(data, { status: res.status });
  } catch {
    // FastAPI 서버가 꺼져 있는 등 연결 자체가 실패한 경우
    return Response.json(
      { detail: "백엔드 서버에 연결할 수 없습니다" },
      { status: 502 }, // 502 Bad Gateway: 프록시가 뒤쪽 서버에 못 닿음
    );
  }
}

// ───────────────────────────────────────────────────────────────
// POST /api/todos
//   언제 호출? → 브라우저의 fetch("/api/todos", { method: "POST", body: ... })
//   하는 일   → 받은 본문을 FastAPI의 POST /todos 로 전달하고 결과를 돌려줌
// ───────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 브라우저가 보낸 JSON 본문을 읽음 (예: { title: "장보기" })
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // 받은 내용을 그대로 FastAPI로 전달
    });

    const data = await res.json();
    // FastAPI가 준 상태 코드(생성 성공 시 201)를 그대로 전달
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { detail: "백엔드 서버에 연결할 수 없습니다" },
      { status: 502 },
    );
  }
}
