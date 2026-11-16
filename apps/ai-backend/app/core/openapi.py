"""Preserve public schema identifiers after moving Python router modules."""
from typing import Any

from fastapi import FastAPI

SCHEMA_NAMES = {
    "app__api__routers__customer_auth__Credentials": "app__customer_auth__Credentials",
    "app__api__routers__customer_account__ProfileInput": "app__customer_account__ProfileInput",
    "app__api__routers__events__Credentials": "app__events__Credentials",
    "app__api__routers__events__ProfileInput": "app__events__ProfileInput",
}


def preserve_schema_names(app: FastAPI) -> None:
    generate = app.openapi
    references = {f"#/components/schemas/{new}": f"#/components/schemas/{old}" for new, old in SCHEMA_NAMES.items()}

    def rewrite_references(value: Any) -> None:
        if isinstance(value, dict):
            if "$ref" in value:
                value["$ref"] = references.get(value["$ref"], value["$ref"])
            for child in value.values():
                rewrite_references(child)
        elif isinstance(value, list):
            for child in value:
                rewrite_references(child)

    def openapi() -> dict[str, Any]:
        schema = generate()
        definitions = schema.get("components", {}).get("schemas", {})
        if any(name in definitions for name in SCHEMA_NAMES):
            for new, old in SCHEMA_NAMES.items():
                if new in definitions:
                    definitions[old] = definitions.pop(new)
            rewrite_references(schema)
        return schema

    app.openapi = openapi
