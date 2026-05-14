'use client';

import { useEffect, useState } from 'react';

/**
 * Reveal `text` character-by-character at a configurable speed.
 * Returns the substring revealed so far. Resets when `text` changes.
 *
 * Useful for AI-generated text fields where the value arrives in a
 * single chunk but you want a "typing" effect for visual pacing — the
 * model is fast, the UI shouldn't be.
 *
 * @param text   Full target text.
 * @param speed  Milliseconds between each character. Default 22ms ≈ 45 chars/sec.
 */
export function useTextReveal(text: string, speed = 22): string {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(t);
    }, speed);
    return () => window.clearInterval(t);
  }, [text, speed]);

  return text.slice(0, count);
}
