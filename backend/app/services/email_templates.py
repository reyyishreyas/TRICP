from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


# ============================================================
# Feature translation layer
# ============================================================

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
    return (
        value.lower()
        .replace("_", " ")
        .strip()
    )


def humanize_reason(reason: str) -> str:
    return FEATURE_COPY.get(
        reason,
        reason.replace("_", " ")
    )


def build_customer_insights(ctx) -> list[str]:
    insights = []

    for reason in ctx.top_reasons:

        r = normalize_reason(reason)

        if "inactive" in r:
            insights.append(
                "We noticed you have not been active recently compared to your previous usage."
            )

        elif "engagement" in r:
            insights.append(
                "Your recent activity has decreased, which may mean you are not getting the full value from your account."
            )

        elif "stickiness" in r or "adoption" in r:
            insights.append(
                "Some features included in your plan have not been explored recently."
            )

        elif "payment" in r:
            insights.append(
                "We noticed some billing activity that may affect your experience."
            )

        elif "price" in r:
            insights.append(
                "Your current plan may no longer align with your recent usage."
            )

        elif "lifecycle" in r:
            insights.append(
                "Your account is still getting started and you may not have discovered everything available."
            )

        elif "high" in r:
            insights.append(
                "Your recent account behaviour changed enough that we wanted to personally check in."
            )

        else:
            insights.append(
                f"We noticed a change in {humanize_reason(reason)}."
            )

    return insights or [
        "We noticed some changes in your recent account activity."
    ]


# ============================================================
# Context
# ============================================================

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



# ============================================================
# Base template
# ============================================================

class RetentionTemplate(ABC):

    triggers = ()

    def matches(self, reasons):

        incoming = {
            normalize_reason(x)
            for x in reasons
        }

        allowed = {
            normalize_reason(x)
            for x in self.triggers
        }

        return bool(
            incoming.intersection(allowed)
        )


    @abstractmethod
    def subject(self, ctx):
        pass


    @abstractmethod
    def text_body(self, ctx):
        pass


    @abstractmethod
    def html_body(self, ctx):
        pass



    def actions_text(self, ctx):

        if not ctx.recommended_actions:
            return "• Review your account and explore available features."

        return "\n".join(
            f"• {x}"
            for x in ctx.recommended_actions
        )


    def html_wrapper(
        self,
        ctx,
        body
    ):

        insights = "".join(
            f"<li>{x}</li>"
            for x in build_customer_insights(ctx)
        )

        actions = "".join(
            f"<li>{x}</li>"
            for x in ctx.recommended_actions
        )


        return f"""
<html>
<body style="
font-family:system-ui;
line-height:1.6;
max-width:600px;
margin:auto">

<p>Hi {ctx.user_label},</p>

<p>
We noticed a few changes in your recent account activity:
</p>

<ul>
{insights}
</ul>

<p>
{body}
</p>


<p>
A few things that may help you:
</p>

<ul>
{actions}
</ul>


<p>
If something changed or you need help,
reply to this email.
</p>


<p>
— {ctx.brand_name}
</p>

</body>
</html>
"""



# ============================================================
# Templates
# ============================================================


class InactivityTemplate(RetentionTemplate):

    triggers = ("Inactive user",)


    def subject(self,ctx):
        return "We noticed your activity changed"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

We noticed your recent usage has reduced.

{self.actions_text(ctx)}

If your needs changed, we would like to understand why.

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "We wanted to check if everything is working well."
        )



class LowEngagementTemplate(RetentionTemplate):

    triggers = ("Low engagement",)


    def subject(self,ctx):
        return "Getting more value from your account"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

Your recent activity looks lower than before.

This may mean you are not discovering everything available.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "You may be missing features that could improve your experience."
        )



class AdoptionTemplate(RetentionTemplate):

    triggers = ("Low product stickiness",)


    def subject(self,ctx):
        return "Features you may want to explore"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

Some features included in your plan have not been used recently.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "Exploring more of your plan can help you get additional value."
        )



class BillingTemplate(RetentionTemplate):

    triggers = ("Payment issue",)


    def subject(self,ctx):
        return "A quick note about your account"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

We noticed some billing activity that may affect your account.

Please review your payment details if needed.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "We want to help prevent any interruption."
        )



class PriceTemplate(RetentionTemplate):

    triggers = ("Price sensitivity",)


    def subject(self,ctx):
        return "Is your current plan still the right fit?"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

Your current plan may not match your recent usage.

You may want to review your subscription options.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "Plans work best when they match your current needs."
        )



class LifecycleTemplate(RetentionTemplate):

    triggers = ("Early lifecycle risk",)


    def subject(self,ctx):
        return "Getting started with your account"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

Your account is still early in its journey.

Exploring the right features early can improve your experience.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "We noticed you may still be discovering the platform."
        )



class HighValueTemplate(RetentionTemplate):

    triggers = ("High-value risk",)


    def subject(self,ctx):
        return "A personal check-in"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

We noticed changes in your account activity and wanted to personally check in.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "We value your experience and want to make sure everything is going well."
        )



class FallbackTemplate(RetentionTemplate):

    triggers = ()


    def matches(self,reasons):
        return True


    def subject(self,ctx):
        return "A quick account check-in"


    def text_body(self,ctx):

        return f"""
Hi {ctx.user_label},

We noticed some changes in your recent activity.

{self.actions_text(ctx)}

— {ctx.brand_name}
"""


    def html_body(self,ctx):

        return self.html_wrapper(
            ctx,
            "We wanted to make sure you are getting the value you expect."
        )



# ============================================================
# Selector
# ============================================================


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


def select_template(reasons):

    for template in TEMPLATE_REGISTRY:

        if template.matches(reasons):
            return template

    return FallbackTemplate()