'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Rate-limit the visible length of a growing list to a minimum cadence.
 *
 * AI streams can land 4-10 items in a single network frame — fine for
 * machines, terrible for humans who wanted to watch the agent "think."
 * `usePacedList` holds back the visible portion so items reveal one at
 * a time at `intervalMs` cadence, even when the source array grows
 * faster.
 *
 * Items already-revealed stay revealed if the source array shrinks
 * (defensive against streaming hiccups). New items always extend, never
 * skip the cadence.
 *
 * ```tsx
 * const visible = usePacedList(steps, 480);
 * return visible.map((step) => <li key={step.id}>{step.note}</li>);
 * ```
 *
 * @param items       Full source list, growing over time.
 * @param intervalMs  Minimum milliseconds between reveals. Default 400ms.
 * @returns           The prefix of `items` that is currently visible.
 */
export function usePacedList<T>(items: readonly T[], intervalMs = 400): T[] {
  const [revealedCount, setRevealedCount] = useState(0);
  const lastRevealAt = useRef<number | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setRevealedCount(0);
      lastRevealAt.current = null;
      return;
    }
    if (revealedCount >= items.length) return;

    const now = Date.now();
    const elapsed = lastRevealAt.current === null ? Infinity : now - lastRevealAt.current;
    const wait = Math.max(0, intervalMs - elapsed);

    const t = window.setTimeout(() => {
      lastRevealAt.current = Date.now();
      setRevealedCount((c) => Math.min(items.length, c + 1));
    }, wait);

    return () => window.clearTimeout(t);
  }, [items.length, revealedCount, intervalMs]);

  return items.slice(0, revealedCount);
}
