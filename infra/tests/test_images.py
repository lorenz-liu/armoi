"""Image upload, the 10-per-item cap, ordering and cleanup."""

from pathlib import Path

from app.config import MAX_IMAGES_PER_ITEM, settings
from tests.conftest import API, make_item, png_bytes


def media_files(root: Path) -> list[Path]:
    """Flat file list under media/ (keys live in per-user nested folders)."""
    if not root.exists():
        return []
    return sorted(path for path in root.rglob("*") if path.is_file())


def upload(client, item_id: int, count: int = 1, content_type: str = "image/png"):
    files = [("files", (f"shot{i}.png", png_bytes(), content_type)) for i in range(count)]
    return client.post(f"{API}/items/{item_id}/images", files=files)


def test_upload_returns_positions_and_urls(client):
    item = make_item(client)
    response = upload(client, item["id"], count=3)
    assert response.status_code == 201
    images = response.json()
    assert [image["position"] for image in images] == [0, 1, 2]
    assert all(image["url"].startswith(settings.media_url_path) for image in images)
    assert all(image["width"] == 8 for image in images)


def test_cover_image_is_the_first_position(client):
    item = make_item(client)
    images = upload(client, item["id"], count=2).json()
    detail = client.get(f"{API}/items/{item['id']}").json()
    assert detail["cover_image"]["id"] == images[0]["id"]
    assert detail["image_count"] == 2


def test_cap_is_enforced_across_separate_uploads(client):
    item = make_item(client)
    assert upload(client, item["id"], count=MAX_IMAGES_PER_ITEM).status_code == 201
    overflow = upload(client, item["id"], count=1)
    assert overflow.status_code == 409
    assert client.get(f"{API}/items/{item['id']}").json()["image_count"] == MAX_IMAGES_PER_ITEM


def test_rejected_batch_writes_no_files(client, tmp_env: Path):
    item = make_item(client)
    upload(client, item["id"], count=1)
    before = media_files(tmp_env / "media")
    files = [
        ("files", ("ok.png", png_bytes(), "image/png")),
        ("files", ("bad.txt", b"not an image", "text/plain")),
    ]
    assert client.post(f"{API}/items/{item['id']}/images", files=files).status_code == 415
    assert media_files(tmp_env / "media") == before


def test_reorder_rewrites_positions(client):
    item = make_item(client)
    images = upload(client, item["id"], count=3).json()
    reversed_ids = [image["id"] for image in reversed(images)]
    response = client.put(
        f"{API}/items/{item['id']}/images/order", json={"image_ids": reversed_ids}
    )
    assert response.status_code == 200
    assert [image["id"] for image in response.json()] == reversed_ids
    assert client.get(f"{API}/items/{item['id']}").json()["cover_image"]["id"] == reversed_ids[0]


def test_reorder_must_list_every_current_image(client):
    item = make_item(client)
    images = upload(client, item["id"], count=3).json()
    response = client.put(
        f"{API}/items/{item['id']}/images/order", json={"image_ids": [images[0]["id"]]}
    )
    assert response.status_code == 400


def test_delete_image_removes_row_and_file(client, tmp_env: Path):
    item = make_item(client)
    image = upload(client, item["id"], count=1).json()[0]
    assert len(media_files(tmp_env / "media")) == 1
    assert client.delete(f"{API}/items/{item['id']}/images/{image['id']}").status_code == 204
    assert media_files(tmp_env / "media") == []


def test_delete_image_belonging_to_another_item_is_404(client):
    a, b = make_item(client, name="A"), make_item(client, name="B")
    image = upload(client, a["id"], count=1).json()[0]
    assert client.delete(f"{API}/items/{b['id']}/images/{image['id']}").status_code == 404


def test_deleting_an_item_cleans_up_its_files(client, tmp_env: Path):
    item = make_item(client)
    upload(client, item["id"], count=2)
    client.delete(f"{API}/items/{item['id']}")
    assert media_files(tmp_env / "media") == []


def test_uploaded_file_is_served_back(client):
    item = make_item(client)
    image = upload(client, item["id"], count=1).json()[0]
    served = client.get(image["url"])
    assert served.status_code == 200
    assert served.headers["content-type"] == "image/png"
