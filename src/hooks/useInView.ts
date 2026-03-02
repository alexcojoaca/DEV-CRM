"use client";

import { useEffect, useRef, useState } from "react";

export function useInView(options?: { once?: boolean; margin?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const { once = true, margin = "0px 0px -80px 0px" } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
        else if (!once) setInView(false);
      },
      { threshold: 0.1, rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin]);

  return { ref, inView };
}
