# Armoi

A personal library for clothes, shoes, bags and jewellery. Photograph a piece,
file it by brand, storage place and category, note its season, gender and
price — then browse the collection as a lookbook rather than a spreadsheet.

<p align="left"><img src="icon.jpg" width="96" alt="Armoi"></p>

## What it does

- **Items** — up to 10 photos, name, brand, storage place, seasons (multi),
  gender, a three-level category, and an optional price with a currency.
- **Pairings** — mark two pieces as worn together; the relation is mutual, so
  it shows on both.
- **Libraries that grow themselves** — typing a new brand or storage place adds
  it to its library and offers it back as prefix autocomplete next time.
- **One browsing surface** — search across every textual field, filter by any
  facet, sort, and switch between four view densities (1 / 2 / 3 up, or list).
  The main screen, a brand page and a storage page all behave identically.
- **Bilingual** — the whole UI, including all 200 category names, in English
  and Chinese, switchable in Settings.

## Repository

```
armoi/
├── infra/     FastAPI + SQLAlchemy + SQLite  →  infra/README.md
├── mobile/    Expo + React Native + TypeScript  →  mobile/README.md
├── icon.jpg   app icon
└── TODO.md    the original specification
```

## Quick start

```bash
# backend
cd infra
uv venv --python 3.13 .venv && uv pip install -e '.[dev]'
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# mobile, in a second shell
cd mobile
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_BASE_URL
npx expo start
```

On a physical device, point `EXPO_PUBLIC_API_BASE_URL` at your machine's LAN
address rather than `localhost`.

## Tests

```bash
cd infra  && .venv/bin/python -m pytest && .venv/bin/ruff check app tests scripts
cd mobile && npm run typecheck && npm run lint && npm test
```

72 backend tests, 73 mobile tests.

## Design notes

**Categories are generated, not typed twice.** `TODO.md` holds the category
tree in Chinese and English; `infra/scripts/build_categories.py --write`
parses both, checks they match in shape, derives a stable dot-path id from the
English labels, and writes the Python and TypeScript copies. Changing the tree
means editing the spec and regenerating — the two sides cannot drift.

**Categories are a vocabulary, not a table.** Items store the dot path
(`clothing.outerwear.coats`), so filtering a whole branch is a prefix match on
one indexed column, and picking a category needs no joins.

**Pairings are stored once.** Each edge is written with `item_a_id < item_b_id`
and read from either end, which makes the relation symmetric by construction
rather than by convention.

**Every constant lives in one file per side** — `infra/app/config.py` and
`mobile/src/config.ts`. Nothing else declares a tunable literal; the UI's
entire geometry is derived from a single 4pt base unit and two palette anchors.
See `mobile/README.md` for the full system.
