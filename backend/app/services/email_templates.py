from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


ACTION_TRANSLATIONS = {
    "Send push notification": "Explore more features available in your account.",
    "Launch in-app walkthrough": "Explore more features available in your account.",
    "Send reactivation email": "Explore more features available in your account.",
    "Offer win-back content": "Reach out to us if you need help getting started.",
    "Retry payment reminder": "Update your billing information if necessary.",
    "Prompt billing update": "Update your billing information if necessary.",
    "Offer loyalty discount": "Review your current subscription plan.",
    "Route to success manager": "Contact our support team if you need assistance.",
    "Promote annual plan incentive": "Review your current subscription plan.",
    "Offer targeted retention discount": "Review your current subscription plan.",
    "Recommend sticky features tutorial": "Explore more features available in your account.",
    "Trigger onboarding success sequence": "Explore more features available in your account.",
}

FEATURE_COPY = {
    "days_since_last_login": "your recent activity has reduced",
    "avg_logins_per_week": "your login frequency has changed",
    "feature_usage_score": "you are using fewer available features",
    "payment_failures_90d": "there may be billing activity affecting your account",
    "support_tickets_30d": "you may have experienced some support friction",
    "MonthlyCharges": "your current plan cost may not match your usage",
    "Contract": "your current subscription commitment may need review",
}


def normalize_reason(value: str) -> str:
    return value.lower().replace("_", " ").strip()


def humanize_reason(reason: str) -> str:
    return FEATURE_COPY.get(reason, reason.replace("_", " "))


def build_customer_insights(ctx: TemplateContext) -> str:
    """
    Smarter summary generator that produces ONE natural paragraph
    by combining the top detected reasons into clean business language
    without exposing any raw ML features or jargon.
    """
    reasons = [normalize_reason(r) for r in ctx.top_reasons]
    
    clauses = []
    for r in reasons:
        if "inactive" in r:
            clauses.append("a period of inactivity on your account recently")
        elif "engagement" in r:
            clauses.append("a decrease in your recent account activity")
        elif "stickiness" in r or "adoption" in r:
            clauses.append("some features included in your plan haven't been fully explored yet")
        elif "payment" in r:
            clauses.append("a pending billing update or payment issue that needs attention")
        elif "price" in r:
            clauses.append("a potential mismatch between your current plan and your actual usage")
        elif "lifecycle" in r:
            clauses.append("you are still in the early stages of setting up your account")
        elif "high" in r:
            clauses.append("an opportunity to connect and ensure you are receiving the absolute best level of support")
        elif "contract" in r or "commitment" in r:
            clauses.append("your current subscription commitment is up for review")

    # Remove duplicates but keep order
    seen = set()
    unique_clauses = []
    for c in clauses:
        if c not in seen:
            seen.add(c)
            unique_clauses.append(c)

    if not unique_clauses:
        return "We are checking in to see how your experience has been and to make sure you're getting the absolute most out of your account."

    if len(unique_clauses) == 1:
        c = unique_clauses[0]
        if c.startswith("you"):
            return f"We're reaching out because {c}, and we want to help ensure everything is running smoothly."
        else:
            return f"We're reaching out because we noticed {c}, and we want to help ensure everything is running smoothly."

    # If multiple, combine the top 2 into a single cohesive paragraph
    c1, c2 = unique_clauses[0], unique_clauses[1]
    intro = f"We're reaching out because {c1}" if c1.startswith("you") else f"We're reaching out because we noticed {c1}"
    addition = f"{c2}" if c2.startswith("you") else f"we noticed {c2}"
        
    return f"{intro}. In addition, {addition}—so we wanted to check in and see how we can best support you."



@dataclass(slots=True)
class TemplateContext:
    to_email: str
    user_label: str

    risk_level: str
    segment: str
    engagement_label: str

    top_reasons: list[str]
    recommended_actions: list[str]

    brand_name: str

    recency_days: int | None = None
    logins_per_week: float | None = None
    feature_usage_score: float | None = None
    payment_failures: int | None = None
    monthly_charges: float | None = None
    tenure_months: int | None = None
    service_count: int | None = None
    contract_type: str | None = None


# Base template

class RetentionTemplate(ABC):
    triggers: tuple[str, ...] = ()

    def matches(self, reasons: list[str]) -> bool:
        incoming = {normalize_reason(x) for x in reasons}
        allowed = {normalize_reason(x) for x in self.triggers}
        return bool(incoming.intersection(allowed))

    @abstractmethod
    def subject(self, ctx: TemplateContext) -> str:
        pass

    @abstractmethod
    def text_body(self, ctx: TemplateContext) -> str:
        pass

    @abstractmethod
    def html_body(self, ctx: TemplateContext) -> str:
        pass

    def actions_text(self, ctx: TemplateContext) -> str:
        translated = []
        for x in ctx.recommended_actions:
            t = ACTION_TRANSLATIONS.get(x)
            if t and t not in translated:
                translated.append(t)
        
        if not translated:
            return "• Explore more features available in your account.\n• Contact our support team if you need assistance."
            
        return "\n".join(f"• {x}" for x in translated)

    def html_wrapper(self, ctx: TemplateContext, body: str) -> str:
        summary = build_customer_insights(ctx)
        
        translated_actions = []
        for x in ctx.recommended_actions:
            t = ACTION_TRANSLATIONS.get(x)
            if t and t not in translated_actions:
                translated_actions.append(t)
                
        if not translated_actions:
            translated_actions = [
                "Explore more features available in your account.",
                "Contact our support team if you need assistance."
            ]

        actions_html = "".join(
            f'<li style="margin-bottom: 8px; color: #475569;">{x}</li>'
            for x in translated_actions
        )

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 0 32px;">
              <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.05em; color: #0f172a; text-transform: uppercase;">
                {ctx.brand_name}
              </div>
              <div style="height: 1px; background-color: #f1f5f9; margin-top: 16px;"></div>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6;">
              <!-- Greeting -->
              <p style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #0f172a;">
                Hi {ctx.user_label},
              </p>
              
              <!-- Friendly Introduction -->
              <p style="margin-top: 0; margin-bottom: 16px; color: #334155;">
                {body}
              </p>
              
              <!-- Smarter Summary Paragraph -->
              <p style="margin-top: 0; margin-bottom: 24px; color: #334155;">
                {summary}
              </p>
              
              <!-- Optional Suggestions Divider / Header -->
              <div style="margin-top: 24px; margin-bottom: 12px; font-weight: 600; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.02em;">
                Suggested Next Steps:
              </div>
              
              <!-- Suggestions Bullet List -->
              <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px;">
                {actions_html}
              </ul>
              
              <!-- Closing Paragraph -->
              <p style="margin-top: 24px; margin-bottom: 24px; color: #334155;">
                If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.
              </p>
              
              <!-- Signature -->
              <p style="margin-top: 24px; margin-bottom: 0; font-weight: 500; color: #0f172a;">
                Warmly,<br>
                <span style="color: #64748b; font-size: 14px;">The {ctx.brand_name} Success Team</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
              This is a personalized account check-in from {ctx.brand_name}. You are receiving this as part of our commitment to active customer support.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# Templates

class InactivityTemplate(RetentionTemplate):
    triggers = ("Inactive user",)

    def subject(self, ctx: TemplateContext) -> str:
        return "We'd love to hear how we can help"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We noticed you haven't had a chance to log in lately, and we wanted to check if everything is working well."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We noticed you haven't had a chance to log in lately, and we wanted to check if everything is working well."
        )


class LowEngagementTemplate(RetentionTemplate):
    triggers = ("Low engagement",)

    def subject(self, ctx: TemplateContext) -> str:
        return "Need any help with your account?"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We're reaching out to make sure you're discovering all the tools and capabilities available to you."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We're reaching out to make sure you're discovering all the tools and capabilities available to you."
        )


class AdoptionTemplate(RetentionTemplate):
    triggers = ("Low product stickiness",)

    def subject(self, ctx: TemplateContext) -> str:
        return "We'd love to show you some handy features"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We wanted to share a few tips to help you get additional value and efficiency out of your current plan."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We wanted to share a few tips to help you get additional value and efficiency out of your current plan."
        )


class BillingTemplate(RetentionTemplate):
    triggers = ("Payment issue",)

    def subject(self, ctx: TemplateContext) -> str:
        return "Quick update regarding your account status"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We are reaching out to help ensure your account services continue without interruption and to help resolve any account status details."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We are reaching out to help ensure your account services continue without interruption and to help resolve any account status details."
        )


class PriceTemplate(RetentionTemplate):
    triggers = ("Price sensitivity",)

    def subject(self, ctx: TemplateContext) -> str:
        return "Let's find the perfect plan for your needs"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We want to make sure you're on the plan that makes the most sense for your current requirements, so you're not paying for things you don't need."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We want to make sure you're on the plan that makes the most sense for your current requirements, so you're not paying for things you don't need."
        )


class LifecycleTemplate(RetentionTemplate):
    triggers = ("Early lifecycle risk",)

    def subject(self, ctx: TemplateContext) -> str:
        return "Let's make sure you're getting the most from your new account"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "Since you recently got started with us, we want to make sure you have all the resources and guidance you need for a smooth onboarding experience."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "Since you recently got started with us, we want to make sure you have all the resources and guidance you need for a smooth onboarding experience."
        )


class HighValueTemplate(RetentionTemplate):
    triggers = ("High-value risk",)

    def subject(self, ctx: TemplateContext) -> str:
        return "We're here to help you get the most out of your account"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "As one of our most valued customers, we want to check in personally to ensure we are fully supporting your success and providing the high-quality experience you expect."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "As one of our most valued customers, we want to check in personally to ensure we are fully supporting your success and providing the high-quality experience you expect."
        )


class FallbackTemplate(RetentionTemplate):
    triggers = ()

    def matches(self, reasons: list[str]) -> bool:
        return True

    def subject(self, ctx: TemplateContext) -> str:
        return "We're here to help"

    def text_body(self, ctx: TemplateContext) -> str:
        intro = "We're checking in to see how your experience has been and to make sure we're supporting you in the best way possible."
        summary = build_customer_insights(ctx)
        actions = self.actions_text(ctx)
        return f"""Hi {ctx.user_label},

{intro}

{summary}

Suggested Next Steps:
{actions}

If you have any questions, need assistance, or if your requirements have shifted, simply reply to this message. We are always happy to help and ensure you're getting the best value.

Warmly,
The {ctx.brand_name} Success Team"""

    def html_body(self, ctx: TemplateContext) -> str:
        return self.html_wrapper(
            ctx,
            "We're checking in to see how your experience has been and to make sure we're supporting you in the best way possible."
        )



# Selector


TEMPLATE_REGISTRY = [
    HighValueTemplate(),
    BillingTemplate(),
    InactivityTemplate(),
    LifecycleTemplate(),
    PriceTemplate(),
    LowEngagementTemplate(),
    AdoptionTemplate(),
    FallbackTemplate(),
]


def select_template(reasons: list[str]) -> RetentionTemplate:
    for template in TEMPLATE_REGISTRY:
        if template.matches(reasons):
            return template
    return FallbackTemplate()