'use client';

import { useFieldStates } from './use-field-states';
import type { StreamingRevealProps } from './types';

/**
 * <StreamingReveal> — a render-prop component that diffs a partial-
 * object stream and exposes per-field state to its children. The
 * component itself ships no DOM beyond what children render — the
 * variant prop only controls the CSS classes applied to the wrapper,
 * so consumers can style field state on their own elements via the
 * `data-streamfield-state` attribute their elements receive when they
 * use the shipped helpers.
 *
 * For most consumers, the most ergonomic pattern is:
 *
 *   <StreamingReveal stream={partial} variant="cascade">
 *     {(f) => (
 *       <article>
 *         <h2 data-streamfield-state={f.title?.state}>{f.title?.value}</h2>
 *         <p data-streamfield-state={f.summary?.state}>{f.summary?.value}</p>
 *       </article>
 *     )}
 *   </StreamingReveal>
 *
 * Then in your CSS:
 *
 *   [data-streamfield-state='streaming'] { ... }
 *   [data-streamfield-state='complete']  { ... }
 *
 * Or import the bundled `styles.css` for opinionated defaults
 * (`@import "streamfield/styles.css"`).
 */
export function StreamingReveal<T extends object>({
  stream,
  done,
  onFieldComplete,
  variant = 'cascade',
  children,
}: StreamingRevealProps<T>) {
  const fields = useFieldStates<T>(stream, done, onFieldComplete);
  return (
    <div data-streamfield="root" data-streamfield-variant={variant}>
      {children(fields)}
    </div>
  );
}
