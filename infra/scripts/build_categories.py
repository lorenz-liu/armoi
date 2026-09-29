#!/usr/bin/env python3
"""Regenerate the canonical category tree from the spec in ``TODO.md``.

The spec holds two parallel ASCII trees (Chinese then English). This script
parses both, checks they have identical shape, derives a stable dot-path id
from the English labels, and writes:

    infra/app/categories_data.py
    mobile/src/data/categories.ts

Usage::

    python scripts/build_categories.py          # print JSON, write nothing
    python scripts/build_categories.py --write  # regenerate both files
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
SPEC_FILE = REPO_ROOT / "TODO.md"
PY_TARGET = REPO_ROOT / "infra" / "app" / "categories_data.py"
TS_TARGET = REPO_ROOT / "mobile" / "src" / "data" / "categories.ts"

BRANCH_RE = re.compile(r"^((?:(?:│|\s)\s\s\s)*)(?:├──|└──)\s(.+?)\s*$")
TRAILING_LATIN_RE = re.compile(r"\s+[A-Za-z&\-\s]+$")
INDENT_WIDTH = 4


def read_tree_blocks(text: str) -> tuple[list[str], list[str]]:
    blocks: list[list[str]] = []
    current: list[str] = []
    inside = False
    for line in text.split("\n"):
        if line.strip() == "```":
            if inside:
                blocks.append(current)
                current = []
            inside = not inside
            continue
        if inside:
            current.append(line)
    trees = [b for b in blocks if any("├──" in l or "└──" in l for l in b)]
    if len(trees) != 2:
        raise SystemExit(f"expected 2 tree blocks in {SPEC_FILE}, found {len(trees)}")
    return trees[0], trees[1]


def parse(lines: list[str]) -> list[dict[str, Any]]:
    root: list[dict[str, Any]] = []
    stack: list[tuple[int, list[dict[str, Any]]]] = [(-1, root)]
    for line in lines:
        match = BRANCH_RE.match(line)
        if not match:
            continue
        depth = len(match.group(1)) // INDENT_WIDTH
        while stack and stack[-1][0] >= depth:
            stack.pop()
        node = {"label": match.group(2).strip(), "children": []}
        stack[-1][1].append(node)
        stack.append((depth, node["children"]))
    return root


def shape(nodes: list[dict[str, Any]]) -> list[Any]:
    return [[len(n["children"]), shape(n["children"])] for n in nodes]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).replace("&", "and")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def merge(zh_nodes: list[dict], en_nodes: list[dict], prefix: str = "") -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    used: set[str] = set()
    for zh_node, en_node in zip(zh_nodes, en_nodes, strict=True):
        slug = base = slugify(en_node["label"])
        counter = 2
        while slug in used:
            slug = f"{base}-{counter}"
            counter += 1
        used.add(slug)
        path = f"{prefix}.{slug}" if prefix else slug
        out.append(
            {
                "id": path,
                # the zh spec suffixes its top level with the English name; drop it
                "zh": TRAILING_LATIN_RE.sub("", zh_node["label"]).strip(),
                "en": en_node["label"],
                "children": merge(zh_node["children"], en_node["children"], path),
            }
        )
    return out


def build() -> list[dict[str, Any]]:
    zh_block, en_block = read_tree_blocks(SPEC_FILE.read_text(encoding="utf-8"))
    zh, en = parse(zh_block), parse(en_block)
    if shape(zh) != shape(en):
        raise SystemExit("the Chinese and English category trees have different shapes")
    return merge(zh, en)


PY_HEADER = '''"""Canonical category tree — GENERATED, do not edit by hand.

Regenerate with::

    python scripts/build_categories.py --write

Each node id is a dot-delimited path (``clothing.tops.t-shirts``) so that an
item's category can be filtered by prefix without extra joins.
"""

from __future__ import annotations

from typing import Any

CATEGORY_TREE: list[dict[str, Any]] = '''

PY_FOOTER = '''


def _flatten(nodes: list[dict[str, Any]], depth: int = 0, parent: str | None = None):
    for node in nodes:
        yield {
            "id": node["id"],
            "zh": node["zh"],
            "en": node["en"],
            "depth": depth,
            "parent_id": parent,
            "is_leaf": not node["children"],
        }
        yield from _flatten(node["children"], depth + 1, node["id"])


CATEGORY_LIST: list[dict[str, Any]] = list(_flatten(CATEGORY_TREE))
CATEGORY_BY_ID: dict[str, dict[str, Any]] = {c["id"]: c for c in CATEGORY_LIST}
CATEGORY_IDS: frozenset[str] = frozenset(CATEGORY_BY_ID)
'''

TS_HEADER = """/**
 * Canonical category tree — GENERATED, do not edit by hand.
 * Source of truth: TODO.md; regenerate with `python infra/scripts/build_categories.py --write`.
 */

export type CategoryNode = {
  id: string;
  zh: string;
  en: string;
  children: CategoryNode[];
};

export const CATEGORY_TREE: CategoryNode[] = """

TS_FOOTER = """;

export type FlatCategory = {
  id: string;
  zh: string;
  en: string;
  depth: number;
  parentId: string | null;
  isLeaf: boolean;
};

function flatten(nodes: CategoryNode[], depth = 0, parentId: string | null = null): FlatCategory[] {
  return nodes.flatMap((node) => [
    { id: node.id, zh: node.zh, en: node.en, depth, parentId, isLeaf: node.children.length === 0 },
    ...flatten(node.children, depth + 1, node.id),
  ]);
}

export const CATEGORY_LIST: FlatCategory[] = flatten(CATEGORY_TREE);

function indexNodes(nodes: CategoryNode[]): Record<string, CategoryNode> {
  return nodes.reduce<Record<string, CategoryNode>>(
    (acc, node) => Object.assign(acc, { [node.id]: node }, indexNodes(node.children)),
    {},
  );
}

/** The tree node (with its children) for any id. */
export const CATEGORY_NODE_BY_ID: Record<string, CategoryNode> = indexNodes(CATEGORY_TREE);

/** Direct children of a category, or the roots when given `null`. */
export function categoryChildren(parentId: string | null): CategoryNode[] {
  return parentId === null ? CATEGORY_TREE : (CATEGORY_NODE_BY_ID[parentId]?.children ?? []);
}

export const CATEGORY_BY_ID: Record<string, FlatCategory> = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.id, c]),
);

/** Ancestor chain for a category id, root first, including the node itself. */
export function categoryChain(id: string | null | undefined): FlatCategory[] {
  if (!id) return [];
  const parts = id.split('.');
  return parts
    .map((_, i) => CATEGORY_BY_ID[parts.slice(0, i + 1).join('.')])
    .filter((node): node is FlatCategory => node !== undefined);
}
"""


def main() -> None:
    tree = build()
    if "--write" not in sys.argv:
        print(json.dumps(tree, ensure_ascii=False, indent=2))
        return
    PY_TARGET.write_text(
        PY_HEADER + json.dumps(tree, ensure_ascii=False, indent=4) + PY_FOOTER, encoding="utf-8"
    )
    TS_TARGET.write_text(
        TS_HEADER + json.dumps(tree, ensure_ascii=False, indent=2) + TS_FOOTER, encoding="utf-8"
    )
    print(f"wrote {PY_TARGET.relative_to(REPO_ROOT)} and {TS_TARGET.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
