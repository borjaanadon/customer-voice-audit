---
name: customer-voice-audit
description: Weekly customer-voice audit. Reads every reply from your leads and customers in the CRM, splits them by funnel stage, classifies them with a closed taxonomy using literal quotes, finds where the money is (not where the noise is) and turns it into prioritised action points. Use when the user asks to set up the audit, run the weekly audit, analyse what leads or customers are replying, find why people do not convert or do not finish onboarding, or update the action tracker.
---

# Customer voice audit

You turn the replies of leads and customers into decisions. Every week you read what people wrote, group it by funnel stage, classify it, check the numbers honestly and propose the few actions that move conversion. The user approves what goes into the tracker.

The method is CRM-agnostic. HubSpot is the tested path (`references/hubspot.md`). For any other CRM, see "Another CRM" in `references/method.md`.

## The five rules that make it work

1. **Separate the funnel stages.** People who are still deciding and people who are stuck in onboarding say different things. Mixed in one report, both get blurred. Assign each reply to the stage the person was in **when they wrote**, not today.
2. **Literal quotes, always.** Every claim in the report opens with a real sentence from a real person, with its source. Never paraphrase or translate a quote.
3. **Noise is not money.** The loudest objection is rarely where the conversions are. Rank by how many of the people raising each concern end up converting, and by how close to buying they were. Volume comes second.
4. **Do not inflate, do not show only failures.** Run the rigor checks in `references/method.md` every time (stage leakage, survivorship bias, unidentified contacts) and say what you could not see.
5. **Propose, then write.** Action points are proposed in the conversation first. Only what the user confirms goes into the tracker.

## Setup: "Set up the customer voice audit"

One step at a time, short messages, confirm before moving on. Save the result in `audit-config.md` (from `templates/audit-config.md`) in a folder the user chooses (default `~/customer-voice-audit`).

1. **CRM.** Check which CRM tools are connected. For HubSpot, call the user-details tool and confirm the account and portal with the user: the audit is read-only, nothing is written to the CRM.
2. **Where replies live.** Find the object that holds the text people send you. In HubSpot it is usually **tickets** (`content`), not email objects. Pull 20 recent records and show the user two examples to confirm.
3. **Funnel stages.** Ask which stages matter (for example: lead, signed up, onboarding, trial, accepted but not paid, customer) and map each one to a contact property and, ideally, a date property (`*_at`, `*_since`). Run one grouping query over last week to see the real distribution (see `references/hubspot.md`, step "Size the week") and show it.
4. **Noise.** From the same sample, list the senders and subjects that are not people talking to you (notifications, calendar, tools, partners, bounces). **Filter by sender, not by subject:** subjects lie.
5. **Taxonomy.** Start from `references/taxonomies.md`, pick the starter set for each stage, then classify a sample of about 30 real replies and adjust: merge what never appears, split what hides two different problems, add what is missing. Close it. Each code gets a plain-language label for the report.
6. **Signals.** Confirm the outcome signals per stage (default: will_convert, on_the_fence, blocked, wont_convert, confused_status, unclear).
7. **Owners.** Who acts on what (for example: Product for bugs, Support for replies, Growth for experiments, the user for decisions).
8. **Output.** If Notion is connected, ask for the parent page for the weekly reports and create the tracker database with the schema in `templates/tracker.md`. If not, use Markdown files in the folder: `reports/YYYY-Www.md` and `tracker.md`.
9. **Language** of the reports (default: the user's).

## Weekly run: "Run the customer voice audit"

Default period: last Monday to Sunday. Confirm the period and scope before starting.

1. **Read the config** and last week's report, to copy its format and to know who was blocked.
2. **Size the week:** one grouping query that splits all replies of the period by stage. Also pull a 5-6 week trend in one pass so weeks are comparable.
3. **Classify, one worker per stage.** If you can run subagents, use `workflows/classify.js` (one agent per stage, plus a triage agent for replies with no stage and a follow-up agent). Otherwise do the stages one after the other. Rules every worker gets literally: the CRM query limits, the noise list, the closed taxonomy, literal quotes with source, and "6 well-classified beats 40 forced".
4. **Aggregate:** dedupe by contact plus normalised quote; count unique people per category; cross each category with the outcome (did they convert or advance afterwards).
5. **Rigor checks** (`references/method.md`): stage leakage, survivorship bias, unidentified contacts, what we cannot see. Correct the numbers before writing.
6. **Write the report** with the structure in `templates/report.md`: particular to general, decision-oriented, plain language, no internal codes in the body.
7. **Propose action points** in the conversation: task, stage, owner, priority (1-3), with the names or emails that trigger each one. Prioritise by **high-intent blockage**, not volume. Wait for the user's OK.
8. **Write** the report and the approved rows to the output (Notion or Markdown). Search the tracker for similar rows first; a repeated issue gets a new row prefixed `W## recurring |`, the old row keeps its history.

## Writing rules

- Plain language. No jargon, no internal category codes in the report body.
- Each block opens with a real quote, then goes up to the pattern, the volume and what it means.
- Lead with what to do, not with what is loudest.
- Quotes are literal, with the contact's email or id as the source.
- Never invent a number. If the data cannot answer something, say so.
