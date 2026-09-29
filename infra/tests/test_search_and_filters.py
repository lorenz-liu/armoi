"""Search matches every textual facet; filters AND together."""

import pytest

from tests.conftest import API, make_item


@pytest.fixture()
def library(client):
    return {
        "coat": make_item(
            client,
            name="Wool Coat",
            brand="Totême",
            storage="Hallway Closet",
            category_id="clothing.outerwear.coats",
            gender="female",
            seasons=["autumn", "winter"],
            price_amount="699.00",
            price_currency="EUR",
            notes="Double faced wool.",
        ),
        "boots": make_item(
            client,
            name="Chelsea Boots",
            brand="Margiela",
            storage="Shoe Rack",
            category_id="shoes.boots.chelsea-boots",
            gender="unisex",
            seasons=["autumn"],
            price_amount="850.00",
            price_currency="EUR",
            notes="Black calfskin.",
        ),
        "ring": make_item(
            client,
            name="Signet Ring",
            brand="Totême",
            storage="Jewellery Box",
            category_id="accessories.jewellery.rings",
            gender="unisex",
            seasons=["spring", "summer", "autumn", "winter"],
            price_amount="220.00",
            price_currency="USD",
            notes=None,
        ),
    }


def names(response) -> set[str]:
    return {item["name"] for item in response.json()["items"]}


def test_search_matches_item_name(client, library):
    assert names(client.get(f"{API}/items", params={"search": "chelsea"})) == {"Chelsea Boots"}


def test_search_matches_brand(client, library):
    assert names(client.get(f"{API}/items", params={"search": "totême"})) == {
        "Wool Coat",
        "Signet Ring",
    }


def test_search_matches_storage(client, library):
    assert names(client.get(f"{API}/items", params={"search": "jewellery box"})) == {"Signet Ring"}


def test_search_matches_notes(client, library):
    assert names(client.get(f"{API}/items", params={"search": "calfskin"})) == {"Chelsea Boots"}


def test_search_matches_english_category_label(client, library):
    assert names(client.get(f"{API}/items", params={"search": "Coats"})) == {"Wool Coat"}


def test_search_matches_chinese_category_label(client, library):
    assert names(client.get(f"{API}/items", params={"search": "戒指"})) == {"Signet Ring"}


def test_search_is_case_insensitive(client, library):
    assert names(client.get(f"{API}/items", params={"search": "WOOL"})) == {"Wool Coat"}


def test_category_filter_includes_the_whole_subtree(client, library):
    assert names(client.get(f"{API}/items", params={"category_id": "shoes"})) == {"Chelsea Boots"}
    assert names(client.get(f"{API}/items", params={"category_id": "clothing.outerwear"})) == {
        "Wool Coat"
    }


def test_category_filter_does_not_leak_across_sibling_prefixes(client, library):
    make_item(client, name="Coat Hanger", category_id="clothing.outerwear.jackets")
    assert names(client.get(f"{API}/items", params={"category_id": "clothing.outerwear.coats"})) == {
        "Wool Coat"
    }


def test_season_filter_is_a_union(client, library):
    assert names(client.get(f"{API}/items", params={"season": "summer"})) == {"Signet Ring"}
    assert names(client.get(f"{API}/items", params={"season": ["winter", "summer"]})) == {
        "Wool Coat",
        "Signet Ring",
    }


def test_gender_and_currency_filters(client, library):
    assert names(client.get(f"{API}/items", params={"gender": "female"})) == {"Wool Coat"}
    assert names(client.get(f"{API}/items", params={"currency": "USD"})) == {"Signet Ring"}


def test_price_range_filter(client, library):
    assert names(client.get(f"{API}/items", params={"min_price": 300, "max_price": 800})) == {
        "Wool Coat"
    }


def test_filters_combine_with_and(client, library):
    response = client.get(f"{API}/items", params={"season": "autumn", "gender": "unisex"})
    assert names(response) == {"Chelsea Boots", "Signet Ring"}


def test_sorting_and_paging(client, library):
    ascending = client.get(f"{API}/items", params={"sort": "price", "order": "asc"})
    assert [i["name"] for i in ascending.json()["items"]] == [
        "Signet Ring",
        "Wool Coat",
        "Chelsea Boots",
    ]

    page = client.get(f"{API}/items", params={"sort": "name", "order": "asc", "limit": 2}).json()
    assert page["total"] == 3 and len(page["items"]) == 2
    rest = client.get(
        f"{API}/items", params={"sort": "name", "order": "asc", "limit": 2, "offset": 2}
    ).json()
    assert len(rest["items"]) == 1


def test_brand_scoped_listing(client, library):
    brand_id = library["coat"]["brand_id"]
    assert names(client.get(f"{API}/brands/{brand_id}/items")) == {"Wool Coat", "Signet Ring"}


def test_storage_scoped_listing_still_honours_search(client, library):
    storage_id = library["ring"]["storage_id"]
    response = client.get(f"{API}/storages/{storage_id}/items", params={"search": "signet"})
    assert names(response) == {"Signet Ring"}
