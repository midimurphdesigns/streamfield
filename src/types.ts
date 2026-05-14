import type { ElementType, ReactNode } from 'react';

export type FieldState = 'pending' | 'streaming' | 'complete';

export type FieldStateMap<T extends object> = {
  [K in keyof T]: {
    state: FieldState;
    value: T[K] | undefined;
  };
};

export type RevealVariant = 'cascade' | 'shimmer' | 'underline-fill';

export type TypewriterProps = {
  /** Full target text. Component reveals it character by character. */
  text: string;
  /** Milliseconds between each character. Default 22ms (~45 chars/sec). */
  speed?: number;
  /** Show a blinking caret while typing. Default false. */
  cursor?: boolean;
  /** Element to render as. Default `'span'`. */
  as?: ElementType;
  className?: string;
};

export type StreamingRevealProps<T extends object> = {
  /**
   * The current partial-object snapshot from your stream. The component
   * diffs successive snapshots to derive per-field state transitions.
   * Compatible with Vercel AI SDK's `streamObject` partialObjectStream
   * and any source that emits progressively-completing JSON objects.
   */
  stream: Partial<T>;
  /**
   * Field order. The reveal sequence respects this order — fields not
   * listed are rendered immediately on first appearance. If omitted,
   * fields appear in the order they first show up in the stream.
   */
  order?: ReadonlyArray<keyof T>;
  /**
   * Reveal physics. `cascade` (default) animates with a per-character
   * fade + tiny y-translate. `shimmer` paints a cyan-tinted gradient
   * across the field until complete. `underline-fill` draws an
   * underline width-wise as the field streams.
   */
  variant?: RevealVariant;
  /**
   * Whether the stream has finished. When true, any field still in
   * `pending` is forced to `complete` to avoid stuck UI on abrupt
   * stream termination.
   */
  done?: boolean;
  /** Fires when a field transitions to `complete`. */
  onFieldComplete?: (field: keyof T) => void;
  /** Render-prop. Receives the per-field state map. */
  children: (fields: FieldStateMap<T>) => ReactNode;
};
