# Method

## 1. Stages, assigned at the moment of writing

A reply belongs to the stage the person was in **when they wrote it**. CRMs store the stage of today, so a person who wrote while onboarding and was accepted two days later shows up as "accepted" if you only look at the current property.

Fix it with dates: compare the reply's date with the stage dates of the contact (`accepted_at`, `customer_since`, `trial_started_at`...). If the reply is older than the date the person entered a stage, they were still in the previous one.

Keep the stages in separate reports or separate sections. People deciding whether to buy talk about price, value and trust. People stuck in a process talk about links that fail and steps they do not understand. Mixed, both signals get lost.

## 2. Noise

Drop, count and report what you dropped, by rule:
- Tool notifications (calendar, meeting recorders, automation tools, document tools).
- Bounces and abuse reports (some look like people forwarding a message).
- Partners and vendors.
- Your own internal notes stored as replies.

**Filter by sender, not by subject.** A subject that looks like a sales campaign can carry real replies from real people. Keep the list of dropped senders in the output so anyone can see what was thrown away.

## 3. Classification

- Closed taxonomy per stage (`taxonomies.md`). One primary category, optional secondary.
- One outcome signal per reply: `will_convert`, `on_the_fence`, `blocked`, `wont_convert`, `confused_status`, `unclear` (for process stages: `will_complete`, `already_completed`...).
- `quote`: the person's own words only. Strip quoted previous emails, signatures, legal footers and tracking links. Never paraphrase or translate.
- `triggered_by`: which message they were answering (from the subject, or from the contact's last-email property). This tells you which of your emails generates which concern.
- **Inclusion beats taxonomy.** In practice, classifiers rarely pick the wrong category; they include things that do not belong (an internal note, a partner thread, someone looking for a job). Review inclusion by hand: who is speaking, and about which funnel.

## 4. Where the money is

Two orderings of the same concerns:
- **By volume:** what people say most.
- **By outcome:** what share of the people with each concern converted (or advanced) afterwards.

They do not match, and that gap is the most useful finding of the audit. In the first deployment (a B2C membership product), price was the loudest objection (about a quarter of replies) and **0%** of those people paid; a broken checkout converted around **45%** and "I did not know it was paid" around **34%**. Fixing the checkout and the message was faster money than fighting on price.

**Your standard reply's effectiveness, without reading each reply.** If support answers each concern with a standard response, then "% that converts per concern" is the effectiveness of that response. It is not purely causal (other touchpoints exist): say so.

## 5. Rigor checks (every run)

| Check | What goes wrong | What to do |
|---|---|---|
| **Stage leakage** | Replies written before the person entered the stage get counted in it | Compare dates, move them to the right stage, report how many |
| **Survivorship bias** | A process stage identified by today's status loses everyone who already finished: the report becomes a list of failures by construction and "do they finish?" is always 0% | The people removed by the leakage check are exactly the ones who finished. Report them as the stage's successes, with how long they took |
| **Unidentified contacts** | Replies with no stage or no contact: nobody counts them and no workflow reaches them | Triage them, rescue the real people, and always report how many there were |
| **Weekly windows** | People who object and then buy do it within days; with day-level dates, a weekly cut misses most of them | Report weekly payments as counts, not rates; compute conversion per concern on monthly cuts or a mature baseline |
| **Duplicates** | A record linked to several contacts appears several times | Dedupe by contact + normalised quote |
| **Batch effects** | Stage counts jump because of campaign batches or expiry jobs | Look at the series by day before calling anything a trend |

## 6. Follow-up

Each week, check the current status of every person the previous report named as blocked. It answers the only question that matters about the audit: did the decisions get executed, and did unblocking work? In the first deployment, people unblocked by hand paid within about two days; the ones nobody unblocked did not. The return of support is unblocking, not replying.

Trust only status fields for this check. When a follow-up worker says "nobody wrote again", cross it with the other workers.

## 7. Bug radar (process stages)

- **What counts:** a technical failure that stops someone from moving forward. Price, legitimacy doubts, asking for more time or not understanding the process are not bugs. Keep the line clean or nobody believes the number.
- **Weigh it twice:** affected / people who entered the stage that week, and affected / people who wrote.
- **Lethality:** of the affected, how many advanced. Zero out of nine turns a complaint into an argument.
- **Tiers:** P1 = wide reach and high lethality and close to finishing. P2 = one of the two, with a clear repro. P3 = low volume or people get past it.
- Each cluster: a name, the people with their email, where in the funnel, tier and **one repro line for engineering with the literal error**.
- Screenshots cannot be read by query: give the record ids so someone opens them.

## 8. Action points

- **Actionable** = something concrete someone can do, with a clear owner, that moves conversion or completion. Not "keep an eye on it", not pure price complaints with no lever, not "not interested".
- **Priority by high-intent blockage.** A bug that stops five people who already decided to pay is worth more than twenty undecided messages.
- Each row includes the names or emails that trigger it.
- Order: process stages first, then conversion; inside each, by priority.

## Another CRM

The method needs four things from any CRM:

| Need | HubSpot | Typical alternatives |
|---|---|---|
| The reply text | Ticket `content` | Conversation messages, email activities, help desk tickets |
| When it was written | Ticket `createdate` | Message timestamp |
| Who wrote it | Associated contact | Requester, person, lead |
| Their stage and the dates they entered each stage | Contact properties (`*_at`, lifecycle stage) | Lifecycle fields, deal stages, custom fields |

If the CRM cannot join replies with contact properties in one query, pull replies for the period first, then look up each contact's stage dates in batches. Write the specific queries and limits you find into the config, the way `hubspot.md` does for HubSpot.
