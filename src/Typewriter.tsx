'use client';

import { useTextReveal } from './use-text-reveal';
import type { TypewriterProps } from './types';

/**
 * Character-by-character text reveal. The natural sibling to
 * <StreamingReveal>: when a stream lands a string field, wrap the
 * value in <Typewriter> to type it out at deliberate speed instead of
 * snapping it in.
 *
 * ```tsx
 * <StreamingReveal stream={partial}>
 *   {(f) => f.summary?.state === 'complete'
 *     ? <Typewriter text={f.summary.value!} />
 *     : f.summary?.value}
 * </StreamingReveal>
 * ```
 */
export function Typewriter({
  text,
  speed = 22,
  cursor = false,
  as: Component = 'span',
  className,
}: TypewriterProps) {
  const revealed = useTextReveal(text, speed);
  const done = revealed.length >= text.length;
  return (
    <Component className={className} data-streamfield-typewriter={done ? 'done' : 'typing'}>
      {revealed}
      {cursor && !done && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: '0.5ch',
            marginInlineStart: '1px',
            backgroundColor: 'currentColor',
            opacity: 0.7,
            animation: 'streamfield-cursor-blink 900ms steps(2, start) infinite',
          }}
        />
      )}
    </Component>
  );
}
