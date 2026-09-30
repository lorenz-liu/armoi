"""Recording when a piece was worn, and sorting by it."""

from datetime import UTC, datetime, timedelta

from tests.conftest import API, make_item


def names(response) -> list[str]:
    return [item["name"] for item in response.json()["items"]]


def test_a_new_item_has_never_been_worn(client):
    assert make_item(client)["last_used_date"] is None


def test_marking_it_used_defaults_to_today(client):
    item = make_item(client)
    response = client.post(f"{API}/items/{item['id']}/use", json={})
    assert response.status_code == 200
    assert response.json()["last_used_date"] == datetime.now(UTC).date().isoformat()


def test_the_client_supplies_its_own_today(client):
    # The phone's calendar date wins, so a timezone gap cannot record yesterday.
    item = make_item(client)
    response = client.post(f"{API}/items/{item['id']}/use", json={"used_on": "2026-03-04"})
    assert response.json()["last_used_date"] == "2026-03-04"


def test_marking_again_overwrites_rather_than_accumulates(client):
    item = make_item(client)
    client.post(f"{API}/items/{item['id']}/use", json={"used_on": "2026-03-04"})
    client.post(f"{API}/items/{item['id']}/use", json={"used_on": "2026-05-09"})
    assert client.get(f"{API}/items/{item['id']}").json()["last_used_date"] == "2026-05-09"


def test_the_date_can_be_cleared(client):
    item = make_item(client)
    client.post(f"{API}/items/{item['id']}/use", json={})
    assert client.delete(f"{API}/items/{item['id']}/use").status_code == 200
    assert client.get(f"{API}/items/{item['id']}").json()["last_used_date"] is None


def test_a_plain_update_does_not_disturb_it(client):
    """`last_used_date` is outside the writable field set, so PUT cannot wipe it."""
    item = make_item(client)
    client.post(f"{API}/items/{item['id']}/use", json={"used_on": "2026-03-04"})
    client.put(f"{API}/items/{item['id']}", json={"name": "Renamed"})
    assert client.get(f"{API}/items/{item['id']}").json()["last_used_date"] == "2026-03-04"


def test_marking_an_unknown_item_is_404(client):
    assert client.post(f"{API}/items/404/use", json={}).status_code == 404


def test_the_date_reaches_the_library_listing(client):
    item = make_item(client)
    client.post(f"{API}/items/{item['id']}/use", json={"used_on": "2026-03-04"})
    assert client.get(f"{API}/items").json()["items"][0]["last_used_date"] == "2026-03-04"


class TestSortingByUse:
    """Never-worn pieces must land at the right end of each ordering."""

    def build(self, client):
        today = datetime.now(UTC).date()
        recent = make_item(client, name="Recent")
        old = make_item(client, name="Old")
        make_item(client, name="Never")
        client.post(f"{API}/items/{recent['id']}/use", json={"used_on": today.isoformat()})
        client.post(
            f"{API}/items/{old['id']}/use",
            json={"used_on": (today - timedelta(days=90)).isoformat()},
        )

    def test_longest_unused_puts_never_worn_first(self, client):
        self.build(client)
        response = client.get(f"{API}/items", params={"sort": "last_used", "order": "asc"})
        assert names(response) == ["Never", "Old", "Recent"]

    def test_recently_used_puts_never_worn_last(self, client):
        self.build(client)
        response = client.get(f"{API}/items", params={"sort": "last_used", "order": "desc"})
        assert names(response) == ["Recent", "Old", "Never"]


def test_name_sorts_both_ways(client):
    for name in ["Boots", "Anorak", "Coat"]:
        make_item(client, name=name)
    assert names(client.get(f"{API}/items", params={"sort": "name", "order": "asc"})) == [
        "Anorak",
        "Boots",
        "Coat",
    ]
    assert names(client.get(f"{API}/items", params={"sort": "name", "order": "desc"})) == [
        "Coat",
        "Boots",
        "Anorak",
    ]
