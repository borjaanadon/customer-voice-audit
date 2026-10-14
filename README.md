# customer-voice-audit

A Claude skill that reads every reply from your leads and customers, classifies it, and turns it into the few actions that actually move conversion.

Every week your support inbox holds the most honest market research you will ever get: people telling you, in their own words, why they have not paid yet, where your onboarding breaks and what they did not understand. Almost nobody reads it as a whole. This skill does, and it is built around one finding: **the loudest complaint is rarely where the money is.**

## What you get every week

- **One report per funnel stage.** People deciding whether to buy and people stuck in onboarding say different things. Mixed together, both signals blur.
- **Every claim backed by a literal quote** from a real person, with its source. Particular to general: the quote first, then the pattern, the volume and what it means.
- **"Where the money actually is":** the same concerns ranked by how many of those people convert afterwards, not by how often they are said.
- **Whether your replies work:** if support answers each concern with a standard response, the share that converts per concern is the effectiveness of that response. No need to read every reply.
- **A bug radar** for process stages: technical failures that stop people, weighted by reach and lethality, each with a one-line repro for engineering.
- **Action points with an owner and a priority**, proposed to you first and written to your tracker only after your OK.

## What the first deployment found

Run weekly for a B2C membership product, on support tickets in HubSpot:

| Concern | Share of replies | Converted afterwards |
|---|---|---|
| "It is too expensive" | about 25% (the loudest) | **0%** |
| "The checkout is broken" | small | **about 45%** |
| "I did not know it was paid" | medium | **about 34%** |

Price was the noise; a broken checkout and a hidden price were the money. Two more findings changed how the team worked:

- **Unblocking pays, replying does not.** People unblocked by hand paid within about two days; the ones nobody unblocked did not. The weekly follow-up of last week's blocked people is what proved it.
- **A process report built on today's status only shows failures.** Everyone who finished has already left the stage. The method recovers them (see "survivorship bias" in `references/method.md`).

## How it works

```
Setup (once)                           Weekly run
-------------                          ----------
CRM + where replies live          ->   size the week (one query)
funnel stages + their dates       ->   one classifier per stage, in parallel
noise rules (by sender)           ->   triage replies with no stage
taxonomy, tuned on ~30 replies    ->   follow up last week's blocked people
owners + output (Notion / md)     ->   rigor checks -> report -> proposed actions -> your OK -> tracker
```

The rigor checks run every week, because this kind of report is easy to inflate:

| Check | Catches |
|---|---|
| Stage leakage | Replies written before the person entered the stage |
| Survivorship bias | A process stage that only ever shows failures |
| Unidentified contacts | Real people hiding among replies with no stage |
| Weekly windows | Conversion rates computed before people had time to convert |
| Inclusion review | Internal notes, partners and people looking for something you do not sell, counted as customers |

## Install

1. Copy this folder to `~/.claude/skills/customer-voice-audit` (Claude Code), or zip it and upload it in Claude: Settings, Capabilities, Skills.
2. Connect HubSpot in Claude (and Notion if you want the reports and tracker there).
3. Say **"Set up the customer voice audit"**. Claude finds where your replies live, maps your funnel stages, tunes the taxonomy on a sample of real replies and creates the tracker.
4. Every Monday: **"Run the customer voice audit"**.

## Requirements

- Claude with the HubSpot connector. The audit is read-only: it never writes to your CRM.
- Optional: Notion connector for reports and tracker. Without it, everything is written as Markdown files.
- Optional: Claude Code with the Workflow tool, to classify the stages in parallel with `workflows/classify.js`. Without it, stages run one after the other.

**Other CRMs:** the method needs four things from any CRM (reply text, date, contact, stage and stage dates). HubSpot is the tested path; `references/method.md` explains how to plug in another one.

## What's in this repo

| Path | What it is |
|---|---|
| `SKILL.md` | Setup and the weekly run |
| `references/method.md` | Stages, noise, classification, where the money is, rigor checks, follow-up, bug radar, action points, other CRMs |
| `references/hubspot.md` | Where replies live in HubSpot, the queries, and every query gotcha found the hard way |
| `references/taxonomies.md` | Starter taxonomies per stage, with plain-language labels |
| `templates/` | Config, report structure and tracker schema |
| `workflows/classify.js` | Parallel classification: one agent per stage, triage and follow-up |

---

Built by [Borja Anadón](https://borjaanadon.com). MIT licence.
