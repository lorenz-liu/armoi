"""Cross-user isolation: one account cannot see another's library."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.auth.tokens import create_token_pair
from app.models import User
from tests.conftest import API, make_item


def test_items_are_scoped_to_the_authenticated_user(client: TestClient) -> None:
    owned = make_item(client, name="Mine")
    assert client.get(f"{API}/items/{owned['id']}").status_code == 200

    TestingSession = client.testing_session  # type: ignore[attr-defined]
    with TestingSession() as session:
        other = User(
            provider="apple",
            provider_sub="other-user",
            email="other@armoi.app",
            display_name="Other",
        )
        session.add(other)
        session.commit()
        session.refresh(other)
        pair = create_token_pair(user_id=other.id, token_version=other.token_version)

    foreign = client.get(
        f"{API}/items/{owned['id']}",
        headers={"Authorization": f"Bearer {pair.access_token}"},
    )
    assert foreign.status_code == 404

    listing = client.get(
        f"{API}/items",
        headers={"Authorization": f"Bearer {pair.access_token}"},
    )
    assert listing.status_code == 200
    assert listing.json()["total"] == 0
    assert listing.json()["items"] == []
