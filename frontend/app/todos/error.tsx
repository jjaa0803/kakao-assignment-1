"use client";
// ⭐ 에러 화면(error.tsx)은 반드시 "Client Component"여야 합니다.
//    이유: 에러를 잡는 "에러 경계(error boundary)"와 '다시 시도' 버튼 클릭 같은
//          상호작용(useEffect, onClick)은 브라우저에서 동작해야 하기 때문입니다.
//    그래서 맨 위에 'use client'를 꼭 적습니다.

import { useEffect } from "react";

// page.tsx(또는 그 자식)에서 에러가 "던져지면" Next.js가 이 컴포넌트를 대신 보여줍니다.
// 전달받는 값:
//   - error: 무슨 에러가 났는지 정보
//   - unstable_retry: 호출하면 해당 구간을 "다시 시도(재요청·재렌더링)"하는 함수
//
// ⚠️ 버전 주의: 이 Next.js 16에서는 예전의 'reset'이 아니라 'unstable_retry'라는 이름을 씁니다.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }; // digest: 서버 에러를 식별하는 코드(선택)
  unstable_retry: () => void;
}) {
  // 에러가 바뀔 때마다 콘솔(개발자 도구)에 기록 → 디버깅용
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
          문제가 발생했어요
        </h2>
        {/* 사용자에게 보여줄 에러 메시지 (우리가 page.tsx에서 던진 한국어 메시지) */}
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>

        <button
          // 클릭하면 다시 시도 → 백엔드가 다시 켜졌다면 정상 화면으로 복구됩니다.
          onClick={() => unstable_retry()}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          다시 시도
        </button>
      </main>
    </div>
  );
}
