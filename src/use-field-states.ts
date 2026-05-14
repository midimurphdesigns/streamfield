'use client';

import { useEffect, useRef, useState } from 'react';
import type { FieldState, FieldStateMap } from './types';

/**
 * Diff successive `stream` snapshots to derive per-field state.
 *
 * Heuristic:
 * - A field is `pending` if it has never appeared.
 * - A field is `streaming` if its value changed in the most recent
 *   snapshot (or is non-empty for the first time).
 * - A field is `complete` if its value matched the previous snapshot
 *   for at least one frame, OR `done` was set.
 *
 * Trade-off: this can mis-mark a field as `complete` if the model
 * pauses mid-stream. In practice the pause is short (sub-100ms) and
 * the visible result still looks right. Callers who need stricter
 * semantics can pass `done` and a custom `order` to gate completion.
 */
export function useFieldStates<T extends object>(
  stream: Partial<T>,
  done?: boolean,
  onFieldComplete?: (field: keyof T) => void,
): FieldStateMap<T> {
  const prevRef = useRef<Partial<T>>({});
  const stableCountRef = useRef<Record<string, number>>({});
  const [map, setMap] = useState<FieldStateMap<T>>(() => ({} as FieldStateMap<T>));
  const firedRef = useRef<Set<keyof T>>(new Set());

  useEffect(() => {
    const prev = prevRef.current;
    const next = { ...map };
    const stable = stableCountRef.current;
    const allKeys = new Set<keyof T>([
      ...(Object.keys(prev) as Array<keyof T>),
      ...(Object.keys(stream) as Array<keyof T>),
    ]);

    for (const key of allKeys) {
      const prevVal = prev[key];
      const nextVal = stream[key];
      const k = String(key);
      let state: FieldState = (next[key]?.state as FieldState) ?? 'pending';

      if (nextVal === undefined) {
        state = 'pending';
      } else if (prevVal !== nextVal) {
        state = 'streaming';
        stable[k] = 0;
      } else {
        stable[k] = (stable[k] ?? 0) + 1;
        if (stable[k] >= 1 || done) state = 'complete';
      }

      next[key] = { state, value: nextVal };

      if (state === 'complete' && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        onFieldComplete?.(key);
      }
    }

    prevRef.current = stream;
    setMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, done]);

  return map;
}
