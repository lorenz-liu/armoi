# Armoi — mobile (`mobile`)

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript 6 · expo-router.

## Run

From the repository root, `make app` (or `make dev` for both sides). By hand:

```bash
npm install
cp .env.example .env        # point EXPO_PUBLIC_API_BASE_URL at your backend
npx expo start
```

### Testing on a real phone

Nothing to configure. The app takes the backend host from whichever machine is
serving the bundle: `Constants.expoConfig.hostUri` is `192.168.x.x:8081` when
Metro is reached over the LAN, so the API resolves to `http://192.168.x.x:8000`
on a phone and `http://127.0.0.1:8000` in a simulator. The backend binds
`0.0.0.0`, so both work.

Just make sure the phone is on the same Wi-Fi and macOS's firewall is not
blocking Python. Set `EXPO_PUBLIC_API_BASE_URL` only to point somewhere else —
a deployed server or a tunnel.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # 168 tests
```

## Layout

| Path | Role |
| --- | --- |
| `src/config.ts` | **Every** constant: API, limits, geometry, palette, motion. |
| `src/theme/` | Tokens *derived* from config — spacing, radii, type scale, grid solver. |
| `src/i18n/` | `en`/`zh` dictionaries, typed dot-path `t()`, category labels, formatting. |
| `src/api/` | Typed endpoint bindings over a fetch client with timeout + retry. |
| `src/api/index.ts` | Also builds multipart parts for uploads — see the note below. |
| `src/hooks/` | `useAsync`, `useDebounced`, `usePreferences`, `useLibrary`. |
| `src/components/ui/` | Primitives: Text, Surface, Button, Chip, TextField, Sheet… |
| `src/components/library/` | Domain components: cards, grid, header, pickers, the edge rail. |
| `src/features/` | Screen bodies shared by more than one route. |
| `src/data/categories.ts` | Generated category tree — do not hand-edit. |
| `app/` | expo-router routes. |

## Routes

```
/                     the library
/item/[id]            one piece
/item/edit?id=        create (no id) or edit
/brands               the brand library
/brands/[id]          everything of one brand
/storages             the storage library
/storages/[id]        everything in one place
/settings             language, default view, counters, server status
```

## Uploading photos

From SDK 54 Expo replaces the global `fetch`, and its multipart serialiser
accepts a part only as a string, a `Blob`, or an object exposing `bytes()`. It
rejects React Native's classic `{uri, name, type}` part outright with
*Unsupported FormDataPart implementation*. Parts are therefore built from
`expo-file-system`'s `File`, which implements `Blob` and carries the name and
mime type the backend needs; the picker's own mime type is used as a fallback,
since the file system reports an empty one when it cannot sniff the format.

`__tests__/upload.test.ts` runs the parts through Expo's real converter, and
asserts the old shape still fails — the two together are what stop this
regressing.

## The design system

The brief asks for geometry with explicit mathematical backing. Nothing in the
UI is a loose number:

**One atom.** `BASE_UNIT = 4`. Every spacing, radius and size is `u(n) = n · 4`,
so all edges land on a shared 4pt grid. `__tests__/theme.test.ts` asserts it.

**Type: a modular scale.** `fontSize(step) = round(14 · 1.2^step)`. The ratio
1.2 (a major second) is tight enough that caption, body and subtitle stay
distinguishable without the display sizes running away.

**Radii: the nesting rule.** A child inset by `p` inside a container of radius
`R` takes `R − p` (`radius.nest`), so concentric corners stay parallel — the
photo inside a card, the segment inside its track. Clamped at 4pt, below which
a corner reads as square.

**The grid: one solved equation.** Cell width solves

```
n·w + (n−1)·gap + 2·gutter = viewport
```

for `w`, with `gutter = 16`, `gap = 12`. All four view modes (1 / 2 / 3 columns
and list) therefore share identical outer margins and sit on the same grid.

**The rail.** Height is derived, not chosen: `2 · tabHeight + 2 · padding +
gripBlock` — everything it actually renders, so the centring maths cannot drift
from the pixels. It rests `RAIL.defaultBottomInset` (500pt) above the bottom of
the screen, measured to its centre, and can be dragged anywhere along the right
edge; the position is clamped inside the safe area and remembered. Its width is
comfortably past the 44pt touch minimum.

**Elevation.** Four levels, each a soft wide shadow under 10% opacity — the
"floating paper" the brief asks for, never a hard drop shadow.

**Colour.** The two specified anchors (`#F6EEE1` paper, `#0B0B0B` ink) plus
neutrals interpolated between them. The only chromatic notes are the four
season dots and a single muted bronze for selection, all desaturated so they
never compete with the photography.

**The cell caption is the user's choice.** A library cell always carries its
photograph and its name; everything else — brand, storage, category, price,
last worn, seasons — is chosen in Settings and defaults to brand, storage and
seasons, because where a piece lives is more use day to day than what it cost.
One hook builds the caption for both cards and list rows, so the two cannot
drift, and the line always renders in the canonical field order however the
choices were made.

**Sorting is a menu of ideas, not axes.** Seven named orderings — recently
added, longest unworn, recently worn, name A–Z / Z–A, price up / down — chosen
from a dropdown, rather than a field the user must combine with a direction.

**The view switcher floats.** Density is a way of *looking* at the library, so
it sits at the top right above everything and never costs a row of layout. The
grid reserves its measured height at the top, so scrolled to the very top the
first row sits *below* it — content may pass under floating chrome while
scrolling, but it should never begin underneath it.

**Chrome at the bottom.** The search field and the control row dock at the
bottom of the screen, inside thumb reach, leaving the whole upper screen to the
photographs. The dock is real layout rather than a floating overlay, so it owns
the bottom safe area and cannot drift when the column count changes; a
`KeyboardAvoidingView` lifts it clear of the keyboard. A title bar appears at
the top only on the brand and storage pages, where it names what you are
looking at.

**Editorial asymmetry.** In the one-up view alternate cards flip their caption
alignment, which gives a single column the staggered rhythm of a magazine
spread without breaking the grid.

## Language

The whole UI ships in English and Chinese, switchable in Settings and
persisted. The `en` dictionary is the reference type; `zh` is checked against
it structurally, and the test suite asserts both cover identical keys with
identical `{placeholders}`. Category names come from the generated tree, which
carries both labels for all 200 nodes.
