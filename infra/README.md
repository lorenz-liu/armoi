# Armoi — backend (`infra`)

FastAPI + SQLAlchemy + SQLite. Serves the item library, the brand and storage
vocabularies, the category tree and the uploaded item images.

## Run

From the repository root, `make api` (or `make dev` for both sides). By hand:

```bash
uv venv --python 3.13 .venv
uv pip install -e '.[dev]'
cp .env.example .env          # optional; defaults work as-is
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs: <http://localhost:8000/docs>

## Test

```bash
.venv/bin/python -m pytest      # 83 functional tests
.venv/bin/ruff check app tests scripts
```

## Layout

| Path | Role |
| --- | --- |
| `app/config.py` | **Every** tunable constant. Nothing else declares one. |
| `app/db.py` | Engine, session factory, SQLite pragmas, additive schema sync. |
| `app/models.py` | ORM schema. |
| `app/schemas.py` | Wire contract (Pydantic). |
| `app/errors.py` | Status-code aliases stable across Starlette renames. |
| `app/services/` | Business logic: `items`, `images`, `vocabulary`. |
| `app/routers/` | HTTP surface: `items`, `vocabularies`, `catalog`. |
| `app/categories_data.py` | Generated category tree — do not hand-edit. |
| `scripts/build_categories.py` | Regenerates the tree from `TODO.md` (Python + TypeScript). |

## Data model

```
brands ──┐                       ┌── item_seasons   (item_id, season)
         ├──< items >────────────┼── item_images    (ordered, ≤ 10)
storages ┘        └──< item_pairings >──┘ (symmetric, stored a<b)
```

* Brands and storages are **user-grown vocabularies**: naming one on an item
  creates it, matched case- and whitespace-insensitively, then offered back
  through `/brands/suggest?q=` prefix autocomplete.
* Categories are **not** a table. The tree is a fixed generated vocabulary and
  items store its dot-path id (`clothing.outerwear.coats`), so filtering a
  branch is a prefix match over one indexed column.
* There is no migration framework. `create_all` builds the schema and
  `init_db` additionally adds any *nullable* column a model gained after the
  database already existed, so a new field does not cost you your library.
  Anything else raises rather than guessing.
* Pairings are symmetric by construction: the row is always written with
  `item_a_id < item_b_id` and read from either end, so A↔B needs no duplicate.

## Endpoints

```
GET    /health
GET    /api/v1/items                 search + filters + sort + paging
POST   /api/v1/items
GET    /api/v1/items/{id}
PUT    /api/v1/items/{id}
DELETE /api/v1/items/{id}
POST   /api/v1/items/{id}/use        record that it was worn
DELETE /api/v1/items/{id}/use        forget when it was worn
POST   /api/v1/items/{id}/images     multipart, ≤ 10 per item
PUT    /api/v1/items/{id}/images/order
DELETE /api/v1/items/{id}/images/{image_id}
GET    /api/v1/items/{id}/pairings
POST   /api/v1/items/{id}/pairings
DELETE /api/v1/items/{id}/pairings/{partner_id}
GET    /api/v1/brands   /suggest  /{id}  /{id}/items      (+ POST/PUT/DELETE)
GET    /api/v1/storages /suggest  /{id}  /{id}/items      (+ POST/PUT/DELETE)
GET    /api/v1/categories  /categories/flat
GET    /api/v1/meta  /stats
GET    /media/{filename}
```

`GET /items` query parameters: `search`, `brand_id[]`, `storage_id[]`,
`category_id[]` (subtree), `gender[]`, `season[]`, `currency`, `min_price`,
`max_price`, `sort` (`created_at|updated_at|name|price|last_used`), `order`, `limit`,
`offset`.

Sorting by `last_used` relies on SQLite's NULL ordering, which is exactly
right here: ascending puts never-worn pieces first ("longest unworn"),
descending puts them last ("recently worn"). `tests/test_usage.py` pins it.

`last_used_date` is deliberately outside the writable field set, so a plain
`PUT` cannot wipe it — only the `/use` endpoints change it. Clients send their
own calendar date, so a timezone gap cannot record yesterday.
