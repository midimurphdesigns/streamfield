'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reveal `text` character-by-character at a configurable speed.
 *
 * Critically, this hook is *append-only* by default: when the `text`
 * prop grows (the common case when wrapping an AI-streamed string
 * that arrives in chunks), the reveal position is preserved and the
 * typewriter continues from where it was. Without this, every stream
 * chunk would restart the typewriter from char 0 and the UI would
 * "flutter" — characters appearing, jumping back, reappearing.
 *
 * The reveal only restarts from 0 when:
 *   - The text shrinks (rare; would mean the producer rewound)
 *   - The text changes to a value that's NOT a prefix-extension of
 *     the previous text (genuinely new content)
 *
 * Uses requestAnimationFrame for smooth pacing across slow frames.
 *
 * @param text   Full target text (may grow over time).
 * @param speed  Milliseconds per character. Default 22ms (~45 chars/sec).
 */
export function useTextReveal(text: string, speed = 22): string {
  const [count, setCount] = useState(0);
  const prevTextRef = useRef('');
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevTextRef.current;
    // Decide whether to keep the reveal position or reset:
    // - If new text starts with the old text, treat as append (keep count).
    // - Otherwise (different content), reset count to 0.
    const isAppend = text.startsWith(prev) && text.length >= prev.length;
    prevTextRef.current = text;

    if (!isAppend) {
      setCount(0);
      lastTickRef.current = null;
    }
    // If we're already past the new text length (shouldn't happen
    // unless text shrank but stayed a prefix-match), clamp.
    setCount((c) => Math.min(c, text.length));
  }, [text]);

  useEffect(() => {
    if (!text) return;

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const elapsed = now - lastTickRef.current;
      const chars = Math.floor(elapsed / speed);

      if (chars > 0) {
        lastTickRef.current = now - (elapsed % speed);
        setCount((c) => {
          if (c >= text.length) return c;
          return Math.min(text.length, c + chars);
        });
      }

      // Keep ticking as long as there's text we haven't revealed.
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [text, speed]);

  return text.slice(0, count);
}
