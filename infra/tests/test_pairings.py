"""Pairings are symmetric no matter which side records them."""

from tests.conftest import API, make_item


def test_pairing_is_visible_from_both_items(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Boots")
    client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": b["id"]})

    assert [p["id"] for p in client.get(f"{API}/items/{a['id']}").json()["pairings"]] == [b["id"]]
    assert [p["id"] for p in client.get(f"{API}/items/{b['id']}").json()["pairings"]] == [a["id"]]


def test_pairings_can_be_set_at_creation_time(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Scarf", pairing_ids=[a["id"]])
    assert [p["id"] for p in client.get(f"{API}/items/{a['id']}").json()["pairings"]] == [b["id"]]


def test_update_replaces_the_pairing_set(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Boots")
    c = make_item(client, name="Bag")
    client.put(f"{API}/items/{a['id']}", json={"name": "Coat", "pairing_ids": [b["id"], c["id"]]})
    client.put(f"{API}/items/{a['id']}", json={"name": "Coat", "pairing_ids": [c["id"]]})

    assert client.get(f"{API}/items/{b['id']}").json()["pairings"] == []
    assert [p["id"] for p in client.get(f"{API}/items/{c['id']}").json()["pairings"]] == [a["id"]]


def test_pairing_count_is_unlimited_and_deduped(client):
    hub = make_item(client, name="Hub")
    partners = [make_item(client, name=f"P{i}")["id"] for i in range(12)]
    client.put(
        f"{API}/items/{hub['id']}", json={"name": "Hub", "pairing_ids": partners + partners}
    )
    assert len(client.get(f"{API}/items/{hub['id']}/pairings").json()) == 12


def test_removing_a_pairing_clears_both_sides(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Boots")
    client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": b["id"]})
    assert client.delete(f"{API}/items/{b['id']}/pairings/{a['id']}").status_code == 204
    assert client.get(f"{API}/items/{a['id']}").json()["pairings"] == []


def test_self_pairing_and_unknown_partner_are_rejected(client):
    a = make_item(client, name="Coat")
    assert client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": a["id"]}).status_code == 422
    assert client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": 4242}).status_code == 422


def test_deleting_an_item_drops_its_pairings(client):
    a = make_item(client, name="Coat")
    b = make_item(client, name="Boots")
    client.post(f"{API}/items/{a['id']}/pairings", json={"item_id": b["id"]})
    client.delete(f"{API}/items/{b['id']}")
    assert client.get(f"{API}/items/{a['id']}").json()["pairings"] == []
