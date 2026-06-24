// app/todos/loading.tsx
//
// ⭐ 이것도 "Server Component"입니다('use client' 없음).
//    Next.js가 page.tsx를 자동으로 <Suspense>로 감싸 주기 때문에,
//    page.tsx의 fetch가 끝나기 "전까지" 이 화면을 먼저 보여줍니다.
//    데이터가 다 오면 Next.js가 알아서 진짜 목록 화면으로 바꿔 줍니다. (우리가 따로 코딩할 필요 X)

export default function Loading() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            할 일 목록
          </h1>
        </header>

        {/* 실제 목록과 비슷한 모양의 "뼈대(skeleton)"를 회색 박스로 보여줘
            사용자가 '로딩 중'임을 자연스럽게 느끼게 함 */}
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-lg border border-black/[.08] bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900"
            />
          ))}
        </ul>
      </main>
    </div>
  );
}
