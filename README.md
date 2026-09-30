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
- **Wear tracking** — one tap records that a piece was worn today, and the
  library can be sorted by longest unworn or most recently worn.
- **Libraries that grow themselves** — typing a new brand or storage place adds
  it to its library and offers it back as prefix autocomplete next time.
- **One browsing surface** — search across every textual field, filter by any
  facet, sort, and switch between four view densities (1 / 2 / 3 up, or list).
  The main screen, a brand page and a storage page all behave identically.
- **Your own shorthand** — choose what each cell shows beneath its photograph:
  brand, storage, category, price, last worn, seasons.
- **Bilingual** — the whole UI, including all 200 category names, in English
  and Chinese, switchable in Settings.
- **Accounts** — Google or Apple Sign-In; each user has a private library.
  The API deploys to Fly.io (Postgres + Tigris). See `infra/DEPLOY.md`.

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
make dev
```

That installs both dependency sets on first run, seeds the `.env` files from
their examples, then starts the API and the Expo dev server together. Stopping
it stops both.

### On your phone

Scan the QR code from `make dev` with the phone on the same Wi-Fi. No
configuration is needed: the API binds `0.0.0.0`, and the app derives its
address from whichever host served the bundle, so a phone reaches your
machine's LAN IP and a simulator reaches `127.0.0.1`. `make dev` prints both
URLs. Override with `EXPO_PUBLIC_API_BASE_URL` only to point elsewhere.

## Make targets

| Target | Does |
| --- | --- |
| `make dev` | Backend and Expo dev server together. |
| `make api` / `make app` | Just one side. |
| `make db reset` | Delete the database and uploaded images (asks first). |
| `make test` | Both suites — backend + mobile. |
| `make lint` | ruff, then tsc and eslint. |
| `make categories` | Regenerate the category tree from `TODO.md`. |
| `make migrate` | Apply Alembic migrations. |
| `make deploy` | `fly deploy` for the API (`infra/DEPLOY.md`). |
| `make install` | Dependencies and `.env` files only. |
| `make clean` | Remove artefacts, caches and installed dependencies. |

`make help` lists them. Override any setting inline, e.g. `make dev API_PORT=9000`.

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
