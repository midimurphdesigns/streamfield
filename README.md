# streamfield

A React toolkit for the streaming UI patterns AI apps actually need. Render Vercel AI SDK partial-object streams with field-by-field reveal physics, type out text fields at deliberate cadence, and rate-limit fast-arriving lists so visitors can actually watch the agent think.

```bash
npm install streamfield
```

## What's in 0.2

- **`<StreamingReveal>`** — render-prop component that diffs partial-object snapshots into per-field `pending / streaming / complete` state. The original primitive.
- **`<Typewriter>` + `useTextReveal`** — character-by-character text reveal with optional caret. The natural sibling for AI-generated string fields.
- **`usePacedList`** — rate-limit the visible length of a growing list to a minimum cadence. Fixes the "all 6 reasoning steps arrived in one frame" problem.

## What it does

Your AI app uses `streamObject` from the Vercel AI SDK (or any source that emits progressively-completing JSON). Without `streamfield`, the natural result is fields that snap into place jarringly — title appears all at once, summary appears all at once, and the "streaming" feels like a stuttering refresh, not a reveal.

`streamfield` diffs successive snapshots, derives per-field `pending → streaming → complete` state, and hands the state to your children via render prop. You style state transitions however you want — or use the bundled CSS for opinionated defaults.

## Usage

```tsx
import { StreamingReveal } from 'streamfield';
import 'streamfield/styles.css'; // optional — opinionated defaults

function Suggestion({ partial, done }) {
  return (
    <StreamingReveal stream={partial} done={done} variant="cascade">
      {(f) => (
        <article>
          <h2 data-streamfield-state={f.title?.state}>{f.title?.value}</h2>
          <p data-streamfield-state={f.summary?.state}>{f.summary?.value}</p>
          <ul>
            {f.bullets?.value?.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </article>
      )}
    </StreamingReveal>
  );
}
```

## Typewriter

```tsx
import { Typewriter } from 'streamfield';

<Typewriter text={reasoning} speed={22} cursor />
```

`speed` is ms between characters (default 22 ≈ 45 cps). `cursor` toggles a blinking caret while typing.

## usePacedList

```tsx
import { usePacedList } from 'streamfield';

const visible = usePacedList(steps, 480);
return visible.map((s) => <ReasoningStep key={s.id} {...s} />);
```

Given a list that grows over time (from `streamObject`'s `partialObjectStream`, an SSE feed, anywhere), `usePacedList` returns a prefix that reveals one item at a time at `intervalMs` cadence — even if all items arrived in the same network frame.

## Variants

- **`cascade`** (default) — per-element opacity + y-translate + blur ease in
- **`shimmer`** — cyan-tinted gradient sweeps across the field until complete
- **`underline-fill`** — animated underline draws as the field streams

Or skip the bundled styles entirely and write your own selectors against `[data-streamfield-state='streaming']` / `[data-streamfield-state='complete']`.

## API

```ts
<StreamingReveal
  stream={Partial<T>}                  // your partial-object snapshot
  order?={ReadonlyArray<keyof T>}      // optional reveal order
  variant?={'cascade' | 'shimmer' | 'underline-fill'}
  done?={boolean}                      // forces remaining fields to complete
  onFieldComplete?={(field) => void}   // per-field complete callback
>
  {(fields) => /* render-prop */ }
</StreamingReveal>
```

`fields` is a `FieldStateMap<T>` — `{ [K in keyof T]: { state, value } }`.

## Why not just CSS transitions?

Because `partial-object → DOM` is not a 1:1 mapping. A field can:

- be absent in one snapshot, present in the next, then change value 4 times in 200ms
- arrive partially-formed (string still being written, array still being filled)
- reverse — the model edits its own output mid-stream
- abort — the stream stops, leaving fields stuck at 30%

CSS transitions can't see any of that. `streamfield` does the diffing and tells you the answer.

## Live demo

[streamfield.kevinmurphywebdev.com](https://streamfield.kevinmurphywebdev.com) — interactive playground with a slider that scrubs through a partial-object stream so you can see the variants side-by-side.

## License

MIT — see [LICENSE](./LICENSE).

## Author

[Kevin Murphy](https://kevinmurphywebdev.com) · Product Engineer · Applied AI · Tempe, AZ.

Extracted from [tablesalt](https://github.com/midimurphdesigns/tablesalt), an in-browser data exploration agent.
