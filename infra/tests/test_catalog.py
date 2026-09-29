"""Category tree integrity and the read-only catalog endpoints."""

from app.categories_data import CATEGORY_BY_ID, CATEGORY_LIST, CATEGORY_TREE
from app.config import CURRENCIES, GENDERS, MAX_IMAGES_PER_ITEM, SEASONS
from tests.conftest import API, make_item


def test_tree_has_the_four_spec_roots():
    assert [node["id"] for node in CATEGORY_TREE] == ["clothing", "shoes", "bags", "accessories"]


def test_every_node_is_bilingual_and_uniquely_identified():
    ids = [node["id"] for node in CATEGORY_LIST]
    assert len(ids) == len(set(ids))
    assert all(node["zh"] and node["en"] for node in CATEGORY_LIST)


def test_ids_encode_their_ancestry():
    for node in CATEGORY_LIST:
        if node["parent_id"] is not None:
            assert node["id"].startswith(node["parent_id"] + ".")
            assert CATEGORY_BY_ID[node["parent_id"]]["depth"] == node["depth"] - 1


def test_tree_is_three_levels_deep():
    assert {node["depth"] for node in CATEGORY_LIST} == {0, 1, 2}


def test_categories_endpoint_returns_the_nested_tree(client):
    tree = client.get(f"{API}/categories").json()
    clothing = next(node for node in tree if node["id"] == "clothing")
    assert clothing["zh"] == "服装"
    tops = next(node for node in clothing["children"] if node["id"] == "clothing.tops")
    assert "T恤" in [child["zh"] for child in tops["children"]]


def test_flat_endpoint_matches_the_tree(client):
    assert len(client.get(f"{API}/categories/flat").json()) == len(CATEGORY_LIST)


def test_meta_exposes_the_form_enumerations(client):
    meta = client.get(f"{API}/meta").json()
    assert meta["seasons"] == list(SEASONS)
    assert meta["genders"] == list(GENDERS)
    assert meta["currencies"] == list(CURRENCIES)
    assert meta["max_images_per_item"] == MAX_IMAGES_PER_ITEM


def test_stats_counts_the_library(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Boots", brand="Margiela", storage="Shoe Rack")
    client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": b["id"]})
    stats = client.get(f"{API}/stats").json()
    assert stats == {
        "item_count": 2,
        "brand_count": 2,
        "storage_count": 2,
        "image_count": 0,
        "pairing_count": 1,
    }
