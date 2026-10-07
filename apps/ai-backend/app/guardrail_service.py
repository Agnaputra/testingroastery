"""Runtime NVIDIA NeMo Guardrails adapter for the Virtual Barista.

The adapter intentionally fails closed for a denied rail and reports a degraded
state when the optional NeMo runtime cannot be initialised.  The deterministic
checks remain a defence-in-depth fallback; they are not presented as NeMo.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .config import settings


REFUSAL_MESSAGE = (
    "Maaf, saya tidak dapat membantu permintaan yang berbahaya, melanggar privasi, "
    "atau mencoba membocorkan instruksi dan data internal."
)


@dataclass(frozen=True)
class GuardrailDecision:
    allowed: bool
    status: str
    message: str = ""


class NemoGuardrailService:
    """Loads one reusable LLMRails instance and validates input/output at runtime."""

    def __init__(self) -> None:
        self._rails: Any | None = None
        self._error: str | None = None
        self._initialised = False

    def _ensure_rails(self) -> bool:
        if self._initialised:
            return self._rails is not None
        self._initialised = True
        if not settings.ENABLE_GUARDRAILS:
            self._error = "disabled_by_configuration"
            return False
        if not settings.OPENAI_API_KEY:
            self._error = "missing_openai_api_key"
            return False
        try:
            from nemoguardrails import LLMRails, RailsConfig

            config_path = Path(__file__).with_name("guardrails")
            self._rails = LLMRails(RailsConfig.from_path(str(config_path)))
            return True
        except Exception as error:  # Service remains available with explicit degraded status.
            self._error = type(error).__name__
            return False

    @staticmethod
    def _deterministic_input_blocked(value: str) -> bool:
        value = value.lower()
        return any(
            phrase in value
            for phrase in (
                "ignore previous instructions", "system prompt", "jailbreak", "bypass",
                "meretas", "ddos", "script injection", "drop table", "select * from users",
            )
        )

    @staticmethod
    def _deterministic_output_blocked(value: str) -> bool:
        value = value.lower()
        return any(
            phrase in value
            for phrase in ("hpp", "landed cost", "gross profit", "margin roastery", "system prompt")
        )

    def _check(self, message: dict[str, str]) -> bool | None:
        if not self._ensure_rails():
            return None
        try:
            # check() is NeMo's no-generation validation API; it executes the
            # configured input/output rails without replacing our Responses API.
            result = self._rails.check(messages=[message])
            if hasattr(result, "passed"):
                return bool(result.passed)
            if isinstance(result, dict):
                if "passed" in result:
                    return bool(result["passed"])
                if "blocked" in result:
                    return not bool(result["blocked"])
            return True
        except Exception as error:
            self._error = type(error).__name__
            return None

    def check_input(self, user_input: str) -> GuardrailDecision:
        if self._deterministic_input_blocked(user_input):
            return GuardrailDecision(False, "blocked_input_policy", REFUSAL_MESSAGE)
        verdict = self._check({"role": "user", "content": user_input})
        if verdict is False:
            return GuardrailDecision(False, "blocked_input_nemo", REFUSAL_MESSAGE)
        if verdict is None:
            return GuardrailDecision(True, "degraded_custom_input")
        return GuardrailDecision(True, "passed_nemo")

    def check_output(self, response: str) -> GuardrailDecision:
        if self._deterministic_output_blocked(response):
            return GuardrailDecision(False, "blocked_output_policy", REFUSAL_MESSAGE)
        verdict = self._check({"role": "assistant", "content": response})
        if verdict is False:
            return GuardrailDecision(False, "blocked_output_nemo", REFUSAL_MESSAGE)
        if verdict is None:
            return GuardrailDecision(True, "degraded_custom_output")
        return GuardrailDecision(True, "passed_nemo")

    def status(self) -> dict[str, object]:
        ready = self._ensure_rails()
        return {
            "configured": settings.ENABLE_GUARDRAILS,
            "runtime_ready": ready,
            "runtime": "nemo" if ready else "degraded",
            "reason": self._error,
        }


guardrail_service = NemoGuardrailService()
