# streamfield

A small React library for the streaming UI patterns AI apps actually need. Render Vercel AI SDK partial-object streams without the flicker, type out text fields at deliberate cadence, and rate-limit fast-arriving lists so visitors can watch the agent think.

```bash
npm install streamfield
```

## What's in 0.2

- **`<StreamingReveal>`**. Render-prop component that diffs partial-object snapshots into per-field `pending / streaming / complete` state. The original primitive.
- **`<Typewriter>` and `useTextReveal`**. Character-by-character text reveal with an optional caret. The natural sibling for AI-generated string fields.
- **`usePacedList`**. Rate-limits the visible length of a growing list to a minimum cadence. Fixes the "all six reasoning steps arrived in one frame" problem.

## The problem

The Vercel AI SDK's `streamObject` re-sends the whole JSON object every chunk, so naive rendering rewrites the page on every chunk. The title flashes in, the bullets pop into the DOM, the summary keeps overwriting itself. CSS transitions can't help: the elements existed before the stream and exist after it; only their text content changes, and CSS animates property changes, not innerText swaps.

## What streamfield does

For every field in your object, streamfield diffs the latest snapshot against the previous one and tells you which of three states the field is in right now:

- **pending**. The field hasn't appeared yet. Reserve space or show a skeleton so layout doesn't jump when it lands.
- **streaming**. The field is currently being written. Draw the user's eye to it (a shimmer sweep, a growing underline, a soft blur that clears).
- **complete**. The field has stopped changing. Fire a sound, hide a cursor, enable a button, or trigger any action that needs the field finalized.

State is exposed two ways: as a `data-streamfield-state` attribute on whatever element you stamp it onto (style with plain CSS), and as a render-prop value (act on it in JavaScript).

## End-to-end example with the Vercel AI SDK

```tsx
// app/api/suggest/route.ts
import { streamObject } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: gateway('openai/gpt-4o-mini'),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      bullets: z.array(z.string()),
    }),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

```tsx
// app/page.tsx
'use client';

import { experimental_useObject as useObject } from 'ai/react';
import { z } from 'zod';
import { StreamingReveal } from 'streamfield';
import 'streamfield/styles.css'; // optional defaults; skip for custom CSS

const schema = z.object({
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()),
});

type Suggestion = z.infer<typeof schema>;

export default function Page() {
  const { object, submit, isLoading } = useObject({
    api: '/api/suggest',
    schema,
  });

  return (
    <>
      <button onClick={() => submit({ prompt: 'top regions by ARR' })}>
        Ask
      </button>

      <StreamingReveal<Suggestion>
        stream={object ?? {}}
        done={!isLoading}
        variant="cascade"
      >
        {(f) => (
          <article>
            <h2 data-streamfield-state={f.title?.state}>
              {f.title?.value}
            </h2>
            <p data-streamfield-state={f.summary?.state}>
              {f.summary?.value}
            </p>
            <ul data-streamfield-state={f.bullets?.state}>
              {f.bullets?.value?.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </article>
        )}
      </StreamingReveal>
    </>
  );
}
```

What's happening:

- `useObject` from the Vercel AI SDK calls `/api/suggest`, streams the response, and exposes the in-progress partial object as `object`.
- That partial is handed to `<StreamingReveal>` as `stream`, with `done={!isLoading}` so the component knows when the stream finishes.
- Inside the render-prop, every field in your schema is `f.<fieldName>` with a `state` (one of `pending`, `streaming`, `complete`) and a `value`. Stamp the state onto the element with `data-streamfield-state` and style it however you like.
- If you imported `streamfield/styles.css`, the three variants (`cascade`, `shimmer`, `underline-fill`) handle the animation for you. If you didn't, write your own selectors against the data attribute.

## Typewriter

```tsx
import { Typewriter } from 'streamfield';

<Typewriter text={reasoning} speed={22} cursor />
```

`speed` is milliseconds between characters (default 22, about 45 chars/sec). `cursor` toggles a blinking caret while typing. `Typewriter` is append-only: if `text` grows over time (a streaming string field), it continues from where it was rather than restarting.

## usePacedList

```tsx
import { usePacedList } from 'streamfield';

const visible = usePacedList(steps, 480);
return visible.map((s) => <ReasoningStep key={s.id} {...s} />);
```

Given a list that grows over time (from `streamObject`'s `partialObjectStream`, an SSE feed, anywhere), `usePacedList` returns a prefix that reveals one item at a time at `intervalMs` cadence, even if every item arrived in the same network frame.

## Variants

- **`cascade`** (default). Per-element opacity, y-translate, and blur ease in.
- **`shimmer`**. Cyan-tinted gradient sweeps across the field until complete.
- **`underline-fill`**. Animated underline draws as the field streams.

Skip the bundled styles and write your own selectors against `[data-streamfield-state='streaming']` and `[data-streamfield-state='complete']` for full control.

## API

```ts
<StreamingReveal
  stream={Partial<T>}                  // current partial-object snapshot
  order?={ReadonlyArray<keyof T>}      // optional reveal order
  variant?={'cascade' | 'shimmer' | 'underline-fill'}
  done?={boolean}                      // forces remaining fields to complete
  onFieldComplete?={(field) => void}   // per-field complete callback
>
  {(fields) => /* render-prop */ }
</StreamingReveal>
```

`fields` is a `FieldStateMap<T>`: `{ [K in keyof T]: { state, value } }`. The `useFieldStates` hook is also exported if you want the state map without the render-prop wrapper.

## Why not just CSS transitions?

CSS can't see field lifecycle. A field can be absent in one snapshot, present in the next, change value four times in 200ms, arrive partially formed, get edited mid-stream, or get cut off when the stream aborts. None of that produces a CSS-animatable property change. You need a state attribute derived from snapshot comparison to react to any of it, and that's the work streamfield does for you.

## Live demo

[streamfield.kevinmurphywebdev.com](https://streamfield.kevinmurphywebdev.com). Interactive playground with a slider that scrubs through a partial-object stream so you can see the same partial rendered with and without streamfield, side by side.

## License

MIT. See [LICENSE](./LICENSE).

## Author

[Kevin Murphy](https://kevinmurphywebdev.com). Product Engineer, applied AI, Tempe, AZ.

Extracted from [tablesalt](https://github.com/midimurphdesigns/tablesalt), an in-browser data exploration agent.
