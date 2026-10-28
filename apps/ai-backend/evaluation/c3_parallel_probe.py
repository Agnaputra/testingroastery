"""C3 publication race probe via real HTTP; test DB only."""

import time
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import httpx

from app.config import settings
from app.price_service import require_price_test_mode


require_price_test_mode()
base = "http://127.0.0.1:8014"
proxy = "http://127.0.0.1:3002"
slug = "ijen-carbonic-maceration-asmara"
if not settings.ADMIN_API_KEY:
    raise RuntimeError("C3 test admin key is required in the process environment")
headers = {"X-Admin-Key": settings.ADMIN_API_KEY}
question = {"message": "Berapa harga Ijen Carbonic Maceration 100g?", "history": []}


def set_status(published):
    with httpx.Client(timeout=20) as client:
        response = client.patch(
            base + "/api/catalog/publication", headers=headers,
            json={"slugs": [slug], "isPublished": published},
        )
        response.raise_for_status()
        return time.perf_counter()


def request(path, method="GET"):
    started = time.perf_counter()
    with httpx.Client(timeout=30) as client:
        body = ({"query": "Ijen Carbonic Maceration", "limit": 5} if path.endswith("/api/search")
                else question if method == "POST" else None)
        response = client.request(method, path, json=body)
    data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
    visible = (
        any(key.startswith(slug + ":") for key in data.get("prices", {}))
        or slug in [item.get("slug") for item in data.get("data", [])]
        or slug in [item.get("slug") for item in data.get("results", [])]
        or slug in data.get("recommendedProductSlugs", [])
    )
    return {"path": path.split("/")[-1], "status": response.status_code,
            "visible": visible, "started": started, "ended": time.perf_counter()}


set_status(True)
try:
    barrier = Barrier(5)
    paths = [
        (proxy + "/api/catalog/authority", "GET"),
        (base + "/api/products", "GET"),
        (base + "/api/search", "POST"),
        (proxy + "/api/chat", "POST"),
    ]

    def concurrent(path, method):
        barrier.wait()
        return request(path, method)

    def toggle():
        barrier.wait()
        time.sleep(0.05)
        return set_status(False)

    with ThreadPoolExecutor(max_workers=5) as pool:
        requests = [pool.submit(concurrent, path, method) for path, method in paths]
        committed = pool.submit(toggle).result()
        in_flight = [future.result() for future in requests]
    after_commit = [request(path, method) for path, method in paths]
    if any(result["visible"] for result in after_commit):
        raise AssertionError("A post-commit response exposed the unpublished slug")
    print({"in_flight": [{**result, "started_before_commit": result["started"] < committed}
                          for result in in_flight],
           "after_commit": [{"path": result["path"], "status": result["status"],
                              "visible": result["visible"]} for result in after_commit]})
finally:
    set_status(True)
