"""Brand and storage libraries: autocomplete, rename, delete."""

import pytest

from tests.conftest import API, make_item


@pytest.fixture(params=["brands", "storages"])
def vocabulary(request):
    """Both vocabularies share one implementation, so both run the same suite."""
    return request.param


def field_for(vocabulary: str) -> str:
    return "brand" if vocabulary == "brands" else "storage"


def only(vocabulary: str, value: str | None) -> dict:
    """Item overrides that set just this vocabulary and clear the other one."""
    return {"brand": None, "storage": None, field_for(vocabulary): value}


def seed(client, vocabulary: str, names: list[str]) -> None:
    for index, name in enumerate(names):
        make_item(client, name=f"Item {index}", **only(vocabulary, name))


def test_created_on_demand_and_listed_alphabetically(client, vocabulary):
    seed(client, vocabulary, ["Zegna", "Acne Studios", "Margiela"])
    listed = [row["name"] for row in client.get(f"{API}/{vocabulary}").json()]
    assert listed == ["Acne Studios", "Margiela", "Zegna"]


def test_prefix_autocomplete(client, vocabulary):
    seed(client, vocabulary, ["Acne Studios", "Acqua di Parma", "Margiela"])
    suggestions = client.get(f"{API}/{vocabulary}/suggest", params={"q": "ac"}).json()
    assert {s["name"] for s in suggestions} == {"Acne Studios", "Acqua di Parma"}
    assert client.get(f"{API}/{vocabulary}/suggest", params={"q": "zz"}).json() == []


def test_autocomplete_ranks_most_used_first(client, vocabulary):
    for i in range(3):
        make_item(client, name=f"P{i}", **only(vocabulary, "Popular"))
    make_item(client, name="Q", **only(vocabulary, "Pocket"))
    suggestions = client.get(f"{API}/{vocabulary}/suggest", params={"q": "po"}).json()
    assert [s["name"] for s in suggestions] == ["Popular", "Pocket"]


def test_empty_prefix_returns_the_top_entries(client, vocabulary):
    seed(client, vocabulary, ["A", "B", "C"])
    assert len(client.get(f"{API}/{vocabulary}/suggest").json()) == 3


def test_explicit_create_then_reuse_does_not_duplicate(client, vocabulary):
    assert client.post(f"{API}/{vocabulary}", json={"name": "Lemaire"}).status_code == 201
    make_item(client, name="Coat", **only(vocabulary, "lemaire"))
    rows = client.get(f"{API}/{vocabulary}").json()
    assert len(rows) == 1 and rows[0]["item_count"] == 1


def test_rename_propagates_to_items(client, vocabulary):
    seed(client, vocabulary, ["Old Name"])
    row = client.get(f"{API}/{vocabulary}").json()[0]
    assert client.put(f"{API}/{vocabulary}/{row['id']}", json={"name": "New Name"}).status_code == 200
    item = client.get(f"{API}/items").json()["items"][0]
    assert item[field_for(vocabulary)] == "New Name"


def test_rename_onto_an_existing_name_conflicts(client, vocabulary):
    seed(client, vocabulary, ["First", "Second"])
    rows = client.get(f"{API}/{vocabulary}").json()
    response = client.put(f"{API}/{vocabulary}/{rows[0]['id']}", json={"name": "second"})
    assert response.status_code == 409


def test_delete_keeps_items_but_clears_the_reference(client, vocabulary):
    seed(client, vocabulary, ["Doomed"])
    row = client.get(f"{API}/{vocabulary}").json()[0]
    assert client.delete(f"{API}/{vocabulary}/{row['id']}").status_code == 204
    items = client.get(f"{API}/items").json()["items"]
    assert len(items) == 1
    assert items[0][field_for(vocabulary)] is None


def test_unknown_id_is_404(client, vocabulary):
    assert client.get(f"{API}/{vocabulary}/404").status_code == 404
    assert client.get(f"{API}/{vocabulary}/404/items").status_code == 404


def test_blank_name_is_rejected(client, vocabulary):
    assert client.post(f"{API}/{vocabulary}", json={"name": "   "}).status_code == 422
