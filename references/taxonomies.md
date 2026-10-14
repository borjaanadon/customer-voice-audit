# Starter taxonomies

Starting points, not answers. In setup, classify about 30 real replies with the starter set for each stage and then adjust: merge what never appears, split what hides two problems, add what is missing. Then close the taxonomy and keep it stable, so weeks compare.

Each code gets a plain-language label. The report uses the labels, never the codes.

## Deciding to buy (accepted, trial, signed up but not paying)

| Code | Category | Plain label in the report |
|---|---|---|
| B1 | Price, cannot afford | "It is too expensive" |
| B2 | Value unclear | "I am not sure it is worth it yet" |
| B3 | Trust, legitimacy | "Is this real?" |
| B4 | How it works | "How does it work exactly?" |
| B5 | Timing | "Not the right moment" |
| B6 | Already solved elsewhere | "I already have something for this" |
| B7 | Checkout or payment broken | "The checkout is broken" |
| B8 | Discount, other payment options | "Can I get a discount or pay in parts?" |
| B9 | Status confusion | "Did I already pay? Am I already in?" / "I did not know it was paid" |
| B10 | Not interested, opt-out | The goodbyes |
| B11 | Ready to buy | "I am ready, where do I pay?" |
| B12 | Other | Explain in a note |

Signals: `will_convert`, `on_the_fence`, `blocked`, `wont_convert`, `confused_status`, `unclear`.

## Stuck in a process (onboarding, application, setup, activation)

| Code | Category | Plain label |
|---|---|---|
| P1 | Link invalid, cannot log in, technical error | "The link is not valid" / "I cannot get in" |
| P2 | Wants to finish, needs the link again or more time | "I want to finish, just send it again" |
| P3 | Where am I in the process | "Where am I?" |
| P4 | Completed a step, asking about status | "I already did it, what now?" |
| P5 | What do I get, do I have to pay | "What do I get, and is it paid?" |
| P6 | Missing information, blocked by a requirement | "I do not have what you ask for" |
| P7 | Not interested, leaving | The goodbyes |
| P8 | Other | Explain in a note |

Signals: `will_complete`, `on_the_fence`, `blocked`, `wont_complete`, `already_completed`, `unclear`.

## Before the funnel (leads who are not in a process yet)

| Code | Category | Plain label |
|---|---|---|
| L1 | What is this, how does it work | "What is this?" |
| L2 | Is it legitimate | "Is this a scam / a job offer?" |
| L3 | Is it paid | "How much is it?" |
| L4 | How do I start | "How do I get in?" |
| L5 | Opt-out before starting | "Remove me" |

## Lessons from the first deployment

- **Questions about price are not objections about price.** In the process stage nobody said "it is expensive"; several asked "how much is it?". Same words, different problem: one is a message gap, the other a value gap.
- **People looking for something you do not sell** (a job, a vendor, a different product) show up in every stage. They are an acquisition-message problem, not a support problem: give them their own line in the report.
- **A category that grows suddenly** usually has a trigger: a new email, a new campaign, a broken link. Look at `triggered_by` before calling it a trend.
