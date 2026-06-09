from __future__ import annotations

import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.config import settings
from app.services.email_templates import TemplateContext, select_template
from app.utils.logger import configure_logger


logger = configure_logger("email_service", settings.logs_dir / "email_service.log")


# ── Public result type (unchanged) ───────────────────────────────────────────

@dataclass(slots=True)
class EmailSendResult:
    ok: bool
    provider: str
    error: str | None = None


# ── Composition layer (new: template-based) ───────────────────────────────────

def compose_retention_email(
    *,
    to_email: str,
    user_label: str,
    churn_probability: float,
    risk_level: str,
    segment: str,
    engagement_label: str,
    top_reasons: list[str],
    recommended_actions: list[str],
    # optional behavioural signals — passed through from batch/prediction payload
    business_signals: dict[str, Any] | None = None,
) -> tuple[str, str, str]:
    """
    Select the most relevant retention email template based on the
    churn reasons already computed by build_reason_candidates(), then
    render it with real behavioural context.

    Returns (subject, plain_text_body, html_body) — same contract as before.
    """
    bs = business_signals or {}

    ctx = TemplateContext(
        to_email=to_email,
        user_label=user_label.strip() or "there",
        risk_level=risk_level,
        segment=segment,
        engagement_label=engagement_label,
        top_reasons=top_reasons,
        recommended_actions=recommended_actions,
        brand_name=settings.mail_from_name,
        recency_days=int(bs["recency_days"]) if "recency_days" in bs else None,
        logins_per_week=float(bs["frequency_logins_per_week"]) if "frequency_logins_per_week" in bs else None,
        feature_usage_score=float(bs["feature_usage_score"]) if "feature_usage_score" in bs else None,
        payment_failures=int(bs["payment_failures_90d"]) if "payment_failures_90d" in bs else None,
        monthly_charges=float(bs["monetary_value"]) if "monetary_value" in bs else None,
        tenure_months=None,   # enriched below if available in signals
        service_count=int(bs["service_count"]) if "service_count" in bs else None,
        contract_type=bs.get("contract_type"),
    )

    template = select_template(top_reasons)
    logger.info(
        "EMAIL TEMPLATE | user=%s reasons=%s template=%s",
        user_label,
        top_reasons,
        type(template).__name__,
    )

    subject   = template.subject(ctx)
    text_body = template.text_body(ctx)
    html_body = template.html_body(ctx)
    return subject, text_body, html_body


# ── Sending layer (unchanged) ─────────────────────────────────────────────────

def send_email(to_address: str, subject: str, text_body: str, html_body: str) -> EmailSendResult:
    if settings.smtp_user and settings.smtp_password:
        return _send_smtp(to_address, subject, text_body, html_body)

    logger.info(
        "STUB email (no SMTP credentials) | to=%s subject=%s — "
        "set GMAIL_ADDRESS + GMAIL_APP_PASSWORD or SMTP_USER + SMTP_PASSWORD",
        to_address,
        subject,
    )
    return EmailSendResult(ok=True, provider="stub")


def _send_smtp(to_address: str, subject: str, text_body: str, html_body: str) -> EmailSendResult:
    host = settings.smtp_host or "smtp.gmail.com"
    port = settings.smtp_port or 587
    if not settings.mail_from_email:
        return EmailSendResult(ok=False, provider="smtp", error="MAIL_FROM_EMAIL not configured")
    if not settings.smtp_user or not settings.smtp_password:
        return EmailSendResult(
            ok=False,
            provider="smtp",
            error="SMTP_USER (or GMAIL_ADDRESS) and SMTP_PASSWORD (or GMAIL_APP_PASSWORD) are required",
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{settings.mail_from_name} <{settings.mail_from_email}>"
    msg["To"]      = to_address
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html",  "utf-8"))

    try:
        with smtplib.SMTP(host, port, timeout=60) as server:
            if settings.smtp_use_tls:
                server.ehlo()
                server.starttls()
                server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        logger.info("SMTP sent | to=%s host=%s", to_address, host)
        return EmailSendResult(ok=True, provider="smtp")
    except Exception as exc:  # noqa: BLE001
        logger.exception("SMTP failed | to=%s", to_address)
        return EmailSendResult(ok=False, provider="smtp", error=str(exc))
