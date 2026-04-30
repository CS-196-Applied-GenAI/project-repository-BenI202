"use client";

import { useEffect, useRef } from "react";

export default function InfiniteScrollTrigger({ isLoading, onVisible }) {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (entry?.isIntersecting && !isLoading) {
        onVisible();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [isLoading, onVisible]);

  return (
    <div className="flex justify-center">
      <div
        className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--muted)]"
        ref={targetRef}
      >
        {isLoading ? "Loading more..." : "Keep scrolling for more"}
      </div>
    </div>
  );
}
