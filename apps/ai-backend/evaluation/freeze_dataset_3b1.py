"""Fail-closed preparation and eventual freeze of the reviewed 3B dataset.

Default mode checks readiness without writing a frozen dataset. No evaluator or
generation API is called. Run --freeze only after real human signoff.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

from evaluation.trace import code_revision, knowledge_base_version


ROOT = Path(__file__).parent
DATASET = ROOT / "dataset_candidates_3b.json"
DEFAULT_SIGNOFFS = "dataset_signoffs_3b1_v2.json"
CATEGORIES = {
    "Product Information", "Product Recommendation", "Brewing Guidance / Recipe Information", "Product Comparison"
}
REVIEW_FIELDS = ("id", "category", "question", "reference", "supporting_kb_source", "expected_slugs")


def encoded(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def item_hash(item: dict) -> str:
    # The signer approves exactly these words, product IDs, and source fields.
    content = {field: item[field] for field in REVIEW_FIELDS}
    return sha256(json.dumps(content, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def load_dataset() -> tuple[dict, bytes, list[dict]]:
    raw = DATASET.read_bytes()
    document = json.loads(raw)
    candidates = document["candidates"]
    selected = [item for item in candidates if item["proposed_final"]]
    counts = Counter(item["category"] for item in selected)
    if len(candidates) != 50 or len(selected) != 40 or counts != Counter({category: 10 for category in CATEGORIES}):
        raise ValueError("Draft must contain 50 candidates and exactly 10 selected per category")
    if len({item["id"] for item in candidates}) != 50:
        raise ValueError("Fixture IDs must be unique")
    if document["dataset_status"] != "DRAFT" or document["human_validation"] != "PENDING":
        raise ValueError("Expected the original unvalidated draft")
    if any(not item["reference"].strip() or not item["expected_slugs"] for item in selected):
        raise ValueError("Selected item lacks reference or expected product")
    for item in selected:
        sources = item["supporting_kb_source"]
        if {source["slug"] for source in sources} != set(item["expected_slugs"]):
            raise ValueError(f"Incomplete product sources: {item['id']}")
        if any(not source["fields"] for source in sources):
            raise ValueError(f"Incomplete source fields: {item['id']}")
    return document, raw, selected


def signoff_template(document: dict, raw: bytes, selected: list[dict]) -> dict:
    return {
        "dataset_version": "",
        "validation_date": "",
        "validators": {"researcher": "", "owner_52_coffee": ""},
        "knowledge_base_fingerprint": document["knowledge_base_fingerprint"],
        "draft_sha256": sha256(raw),
        "reference_answers_final": False,
        "source_units_confirmed": False,
        "revision_notes": "",
        "items": [
            {
                "id": item["id"], "content_sha256": item_hash(item),
                "researcher": {"approved": False, "validator": "", "date": ""},
                "owner_52_coffee": {"approved": False, "validator": "", "date": ""},
                "revision_note": "",
            }
            for item in selected
        ],
    }


def valid_date(value: str) -> bool:
    try:
        return date.fromisoformat(value).isoformat() == value
    except (TypeError, ValueError):
        return False


def blockers(document: dict, raw: bytes, selected: list[dict], signoffs: dict, current_kb: str) -> list[str]:
    problems: list[str] = []
    if current_kb == "unavailable" or current_kb != document["knowledge_base_fingerprint"]:
        problems.append("Knowledge base fingerprint unavailable or changed")
    if signoffs.get("knowledge_base_fingerprint") != document["knowledge_base_fingerprint"]:
        problems.append("Signoff knowledge base fingerprint differs")
    if signoffs.get("draft_sha256") != sha256(raw):
        problems.append("Draft changed after signoff template creation")
    version = signoffs.get("dataset_version", "")
    if not isinstance(version, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", version):
        problems.append("Dataset version missing or invalid")
    if not valid_date(signoffs.get("validation_date", "")):
        problems.append("Validation date missing or invalid")
    validators = signoffs.get("validators", {})
    for role in ("researcher", "owner_52_coffee"):
        if not isinstance(validators, dict) or not isinstance(validators.get(role), str) or not validators[role].strip():
            problems.append(f"Validator missing: {role}")
    if signoffs.get("reference_answers_final") is not True:
        problems.append("Final reference answers not confirmed")
    if signoffs.get("source_units_confirmed") is not True:
        problems.append("Source units not confirmed")
    entries = signoffs.get("items", [])
    if not isinstance(entries, list) or len(entries) != 40 or len({x.get("id") for x in entries if isinstance(x, dict)}) != 40:
        problems.append("Signoff entries must contain exactly 40 unique IDs")
        return problems
    by_id = {entry["id"]: entry for entry in entries}
    if set(by_id) != {item["id"] for item in selected}:
        problems.append("Signoff IDs do not match selected questions")
        return problems
    unapproved: list[str] = []
    for item in selected:
        entry = by_id[item["id"]]
        if entry.get("content_sha256") != item_hash(item):
            problems.append(f"Reviewed content changed: {item['id']}")
        for role in ("researcher", "owner_52_coffee"):
            approval = entry.get(role, {})
            expected_validator = validators.get(role, "") if isinstance(validators, dict) else ""
            if (not isinstance(approval, dict) or approval.get("approved") is not True
                    or approval.get("validator") != expected_validator
                    or not valid_date(approval.get("date", ""))):
                unapproved.append(f"{item['id']}:{role}")
    if unapproved:
        problems.append(f"Human approvals incomplete: {len(unapproved)} of 80 ({', '.join(unapproved[:6])}{' ...' if len(unapproved)>6 else ''})")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prepare-signoffs", action="store_true", help="Write a blank template once")
    parser.add_argument("--freeze", action="store_true", help="Write final files only after all checks pass")
    parser.add_argument("--signoffs-name", default=DEFAULT_SIGNOFFS, help="Signoff JSON basename in evaluation/")
    args = parser.parse_args()
    if args.prepare_signoffs and args.freeze:
        parser.error("Choose one action")
    if not re.fullmatch(r"dataset_signoffs_3b1(?:_[A-Za-z0-9-]+)?\.json", args.signoffs_name):
        parser.error("Invalid signoff basename")
    signoffs_path = ROOT / args.signoffs_name
    document, raw, selected = load_dataset()
    if args.prepare_signoffs:
        if signoffs_path.exists():
            raise FileExistsError("Signoff file exists; preserve human review")
        signoffs_path.write_bytes(encoded(signoff_template(document, raw, selected)))
        print(f"Blank signoff template written: {signoffs_path.name}; no approval granted")
        return 0
    if not signoffs_path.exists():
        print("BLOCKED: signoff file missing")
        return 1
    signoffs = json.loads(signoffs_path.read_text(encoding="utf-8"))
    problems = blockers(document, raw, selected, signoffs, knowledge_base_version())
    if problems:
        for problem in problems:
            print("BLOCKED:", problem)
        return 1
    fixtures = [
        {"id": item["id"], "question": item["question"], "reference": item["reference"],
         "expected_slugs": item["expected_slugs"]}
        for item in selected
    ]
    fixture_bytes = encoded(fixtures)
    manifest = {
        "dataset_version": signoffs["dataset_version"],
        "validation_date": signoffs["validation_date"],
        "validators": signoffs["validators"],
        "knowledge_base_fingerprint": document["knowledge_base_fingerprint"],
        "total_questions": len(fixtures),
        "category_distribution": dict(Counter(item["category"] for item in selected)),
        "dataset_checksum_sha256": sha256(fixture_bytes),
        "draft_sha256": sha256(raw),
        "signoffs_sha256": sha256(signoffs_path.read_bytes()),
        "code_revision": code_revision(),
        "frozen_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    if not args.freeze:
        print("READY: human signoffs and KB fingerprint pass; no dataset frozen")
        print("PROPOSED_CHECKSUM:", manifest["dataset_checksum_sha256"])
        return 0
    target = ROOT / "frozen" / signoffs["dataset_version"]
    target.mkdir(parents=True, exist_ok=False)
    (target / "fixtures.json").write_bytes(fixture_bytes)
    (target / "manifest.json").write_bytes(encoded(manifest))
    (target / "signoffs.json").write_bytes(signoffs_path.read_bytes())
    print(f"FROZEN: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
