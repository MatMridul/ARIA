"""Cryptographic HMAC-SHA256 signature verification for payment telemetry webhooks.

Follows the standard payment gateway webhook signing scheme (Stripe / Adyen / GitHub):
  Header: X-Aria-Signature: t=<timestamp>,v1=<signature>
  Signature: HMAC-SHA256(secret, f"{timestamp}.{raw_payload}")
"""

import hashlib
import hmac
import time
from typing import Tuple, Union

DEFAULT_WEBHOOK_SECRET = "whsec_aria_reference_secret_default"
DEFAULT_TOLERANCE_SECONDS = 300  # 5 minutes replay protection window


def generate_signature(
    secret: str,
    payload: Union[str, bytes],
    timestamp: Union[int, float, None] = None,
) -> Tuple[str, int]:
    """Generate an HMAC-SHA256 signature header and integer timestamp for a payload.

    Returns:
        Tuple of (formatted_header_string, timestamp_int)
        e.g. ("t=1791396000,v1=9c4a...", 1791396000)
    """
    ts = int(timestamp if timestamp is not None else time.time())
    payload_bytes = payload.encode("utf-8") if isinstance(payload, str) else payload
    signed_payload = f"{ts}.".encode("utf-8") + payload_bytes

    mac = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256)
    sig_hex = mac.hexdigest()
    header_val = f"t={ts},v1={sig_hex}"
    return header_val, ts


def verify_signature(
    secret: str,
    payload: Union[str, bytes],
    signature_header: str,
    tolerance_seconds: int = DEFAULT_TOLERANCE_SECONDS,
    now: Union[int, float, None] = None,
) -> Tuple[bool, str]:
    """Verify an incoming webhook payload against an X-Aria-Signature header.

    Checks:
    1. Header structure (contains t= and v1= tokens).
    2. Clock skew tolerance (rejects expired or future-skewed timestamps).
    3. Timing-safe cryptographic signature comparison.

    Returns:
        (is_valid: bool, reason: str)
    """
    if not signature_header or not isinstance(signature_header, str):
        return False, "missing_or_invalid_header"

    # Parse components (t=...,v1=...)
    items = [item.strip() for item in signature_header.split(",") if "=" in item]
    parsed = {}
    for item in items:
        k, v = item.split("=", 1)
        parsed[k.strip()] = v.strip()

    if "t" not in parsed or "v1" not in parsed:
        return False, "malformed_signature_header"

    try:
        ts = int(parsed["t"])
    except ValueError:
        return False, "invalid_timestamp_format"

    received_sig = parsed["v1"]

    # Replay protection / Clock skew check
    current_time = float(now if now is not None else time.time())
    if tolerance_seconds > 0 and abs(current_time - ts) > tolerance_seconds:
        return False, "timestamp_out_of_tolerance"

    # Compute expected signature
    payload_bytes = payload.encode("utf-8") if isinstance(payload, str) else payload
    signed_payload = f"{ts}.".encode("utf-8") + payload_bytes
    expected_mac = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256)
    expected_sig = expected_mac.hexdigest()

    # Timing-attack safe comparison
    if not hmac.compare_digest(expected_sig, received_sig):
        return False, "signature_mismatch"

    return True, "valid"
