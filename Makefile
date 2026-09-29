# Armoi — developer entry points.
#
# Every tunable lives in the variables below; recipes only reference them.
# Override any of them inline, e.g. `make dev API_PORT=9000`.

SHELL := /bin/bash
.DEFAULT_GOAL := help

PYTHON_VERSION ?= 3.13
API_HOST       ?= 0.0.0.0
API_PORT       ?= 8000

INFRA  := infra
MOBILE := mobile
VENV   := $(INFRA)/.venv
# Absolute, so recipes stay readable after a `cd` into a subdirectory.
BIN    := $(abspath $(VENV))/bin
PY     := $(VENV)/bin/python

# Must mirror ARMOI_DATABASE_URL / ARMOI_MEDIA_DIR in infra/app/config.py.
DB_FILE   ?= $(INFRA)/data/armoi.db
MEDIA_DIR ?= $(INFRA)/media

.PHONY: help install dev api app db db-reset reset test test-api test-app lint categories clean

## help: list the available targets
help:
	@echo "Armoi"
	@echo
	@grep -E '^## ' $(MAKEFILE_LIST) \
		| sed -e 's/^## //' \
		| awk -F': ' '{ printf "  \033[1m%-14s\033[0m %s\n", $$1, $$2 }'
	@echo
	@echo "  API on http://localhost:$(API_PORT) — docs at /docs"

# --- bootstrap --------------------------------------------------------------
# Sentinel targets: each installs only when its marker is missing or stale.

$(PY):
	@command -v uv >/dev/null || { echo "uv is required: https://docs.astral.sh/uv/"; exit 1; }
	cd $(INFRA) && uv venv --python $(PYTHON_VERSION) .venv && uv pip install -e '.[dev]'

$(MOBILE)/node_modules: $(MOBILE)/package.json
	cd $(MOBILE) && npm install
	@touch $(MOBILE)/node_modules

# Both sides read a .env; seed it from the example on first run.
$(INFRA)/.env: $(INFRA)/.env.example
	@cp -n $< $@ && echo "created $@"

$(MOBILE)/.env: $(MOBILE)/.env.example
	@cp -n $< $@ && echo "created $@"

## install: create the venv, install both dependency sets, seed .env files
install: $(PY) $(MOBILE)/node_modules $(INFRA)/.env $(MOBILE)/.env

# --- running ----------------------------------------------------------------

## dev: run the backend and the Expo dev server together
dev: install
	@echo "→ api  http://localhost:$(API_PORT)"
	@echo "→ app  Expo dev server (press ? for its menu)"
	@echo
	@( cd $(INFRA) && exec $(BIN)/uvicorn app.main:app \
		--reload --host $(API_HOST) --port $(API_PORT) ) & \
	api_pid=$$!; \
	trap 'kill -TERM $$api_pid 2>/dev/null; wait $$api_pid 2>/dev/null' EXIT INT TERM; \
	( cd $(MOBILE) && exec npx expo start )

## api: run only the backend, with reload
api: $(PY) $(INFRA)/.env
	cd $(INFRA) && $(BIN)/uvicorn app.main:app \
		--reload --host $(API_HOST) --port $(API_PORT)

## app: run only the Expo dev server
app: $(MOBILE)/node_modules $(MOBILE)/.env
	cd $(MOBILE) && npx expo start

# --- data -------------------------------------------------------------------

# A no-op so `make db reset` reads as a sentence; alone, it shows the help.
db:
ifeq ($(MAKECMDGOALS),db)
	@$(MAKE) --no-print-directory help
else
	@:
endif

reset: db-reset

## db reset: delete the database and every uploaded image (asks first)
db-reset:
	@if [ "$(FORCE)" != "1" ]; then \
		printf 'Delete %s and everything in %s/? [y/N] ' '$(DB_FILE)' '$(MEDIA_DIR)'; \
		read -r reply || reply=n; \
		case "$$reply" in [yY]*) ;; *) echo "Aborted."; exit 0;; esac; \
	fi; \
	rm -f '$(DB_FILE)' '$(DB_FILE)-wal' '$(DB_FILE)-shm'; \
	rm -rf '$(MEDIA_DIR)'; \
	echo "Database and media cleared. The schema is recreated on next start."

## categories: regenerate the category tree from TODO.md (Python + TypeScript)
categories: $(PY)
	cd $(INFRA) && $(BIN)/python scripts/build_categories.py --write

# --- checks -----------------------------------------------------------------

## test: run both test suites
test: test-api test-app

test-api: $(PY)
	cd $(INFRA) && $(BIN)/python -m pytest

test-app: $(MOBILE)/node_modules
	cd $(MOBILE) && npm test

## lint: ruff on the backend, tsc and eslint on the app
lint: $(PY) $(MOBILE)/node_modules
	cd $(INFRA) && $(BIN)/ruff check app tests scripts
	cd $(MOBILE) && npx tsc --noEmit && npx expo lint

## clean: remove build artefacts, caches and installed dependencies
clean:
	rm -rf $(VENV) $(MOBILE)/node_modules $(MOBILE)/.expo $(MOBILE)/dist
	find $(INFRA) -name __pycache__ -type d -prune -exec rm -rf {} +
	rm -rf $(INFRA)/.pytest_cache $(INFRA)/.ruff_cache
