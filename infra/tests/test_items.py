"""Item CRUD, vocabulary auto-creation and validation."""

from tests.conftest import API, make_item


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


def test_create_returns_full_detail(client):
    item = make_item(client)
    assert item["name"] == "Wool Coat"
    assert item["brand"] == "Totême"
    assert item["storage"] == "Hallway Closet"
    assert item["seasons"] == ["autumn", "winter"]
    assert item["price_currency"] == "EUR"
    assert item["image_count"] == 0
    assert item["pairings"] == []


def test_brand_and_storage_libraries_grow_on_first_use(client):
    make_item(client)
    brands = client.get(f"{API}/brands").json()
    storages = client.get(f"{API}/storages").json()
    assert [b["name"] for b in brands] == ["Totême"]
    assert brands[0]["item_count"] == 1
    assert [s["name"] for s in storages] == ["Hallway Closet"]


def test_brand_matching_is_case_and_whitespace_insensitive(client):
    make_item(client, name="A", brand="Totême")
    make_item(client, name="B", brand="  totême ")
    brands = client.get(f"{API}/brands").json()
    assert len(brands) == 1
    assert brands[0]["item_count"] == 2


def test_seasons_are_deduped_and_canonically_ordered(client):
    item = make_item(client, seasons=["winter", "spring", "winter"])
    assert item["seasons"] == ["spring", "winter"]


def test_update_replaces_the_writable_field_set(client):
    item = make_item(client)
    response = client.put(
        f"{API}/items/{item['id']}",
        json={"name": "Renamed", "seasons": ["summer"], "category_id": "shoes.boots.chelsea-boots"},
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["name"] == "Renamed"
    assert updated["brand"] is None
    assert updated["seasons"] == ["summer"]
    assert updated["category_id"] == "shoes.boots.chelsea-boots"
    # the brand row itself survives, it is just no longer referenced
    assert client.get(f"{API}/brands").json()[0]["item_count"] == 0


def test_price_currency_is_dropped_without_an_amount(client):
    item = make_item(client, price_amount=None, price_currency="USD")
    assert item["price_amount"] is None
    assert item["price_currency"] is None


def test_unknown_category_is_rejected(client):
    response = client.post(f"{API}/items", json={"name": "X", "category_id": "clothing.nope"})
    assert response.status_code == 422


def test_invalid_enums_are_rejected(client):
    assert client.post(f"{API}/items", json={"name": "X", "gender": "other"}).status_code == 422
    assert client.post(f"{API}/items", json={"name": "X", "seasons": ["monsoon"]}).status_code == 422
    assert client.post(f"{API}/items", json={"name": "X", "price_amount": -1}).status_code == 422
    assert client.post(f"{API}/items", json={"name": "  "}).status_code == 422


def test_delete_removes_the_item(client):
    item = make_item(client)
    assert client.delete(f"{API}/items/{item['id']}").status_code == 204
    assert client.get(f"{API}/items/{item['id']}").status_code == 404


def test_missing_item_is_404(client):
    assert client.get(f"{API}/items/9999").status_code == 404
