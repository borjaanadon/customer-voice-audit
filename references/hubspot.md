# HubSpot

Everything here was verified against a live portal with Claude's HubSpot connector (`query_crm_data`, `search_crm_objects`). Read-only: the audit never writes to HubSpot.

## Where the replies are

**Replies do not live in email objects. They live in tickets** (`content`), when your inbox creates tickets from incoming messages. Searching email objects for your own replies returns nothing at scale either.

Isolate them with **cross-object queries**: select ticket fields and filter by properties of the associated contact.

```sql
SELECT hs_object_id, subject, content, source_type, createdate,
       CONTACT.email, CONTACT.lifecyclestage, CONTACT.<stage_date_property>, CONTACT.hs_email_last_email_name
FROM TICKET
WHERE createdate BETWEEN '<START>' AND '<END>'
  AND CONTACT.<stage_date_property> IS NOT NULL
LIMIT 200
```

`CONTACT.hs_email_last_email_name` tells you which marketing email the person was answering.

## Size the week (one query)

```sql
SELECT CONTACT.<stage_property>, COUNT(*)
FROM TICKET
WHERE createdate BETWEEN '<START>' AND '<END>'
GROUP BY CONTACT.<stage_property>
ORDER BY COUNT(*) DESC
```

It gives the whole distribution of the week at once, including how many replies have no stage at all.

Trend of 5-6 weeks in one pass: `GROUP BY DATE_TRUNC(createdate, 'WEEK')`. For people entering a stage, query `FROM CONTACT WHERE <stage_date> BETWEEN ...` grouped the same way.

## Gotchas (all verified)

| Gotcha | Detail |
|---|---|
| **`CONTACT.<date> BETWEEN` does not filter** | In a cross-object query, a BETWEEN on a contact date is silently ignored and returns every row. No error. `IS NULL` / `IS NOT NULL` work. To filter by a contact date, query `FROM CONTACT` directly |
| **`IN` does not work** | Run one query per value. Check for the same value written two ways (`dropped_out` and `dropped out` existed side by side) |
| **`OFFSET` does not paginate** | With `LIMIT`/`OFFSET` it returns the same page every time. For large cohorts, split by day of `createdate` |
| **Expressions in `GROUP BY` fail** | `GROUP BY CONTACT.x IS NULL` gives an internal error. Column names only |
| **Date `BETWEEN` is inclusive to the whole day** | `BETWEEN '2026-09-14' AND '2026-09-20'` includes all of Sunday. Do not use the next Monday as the end |
| **Day granularity, no time** | Many date properties have no time, so "wrote, then paid the same day" is lost |
| **Duplicate rows** | A ticket with several associated contacts appears several times |
| **Empty properties are omitted** | A missing property in the result means empty, not "does not exist" |
| **Undocumented lifecycle stages** | Portals often have custom stages with numeric ids. Route by an explicit status or date property, not by lifecycle stage |
| **Workflows are not readable** | The connector exposes contacts and tickets, not workflow enrolments. Rebuild "workflow health" from cohorts (how many entered a stage, how many are still there, how many moved on) and say it is a reconstruction |
| **Screenshots** | `content` only references an image. Give ticket ids so someone opens them in the UI |

## Two definitions that look the same and are not

"Accepted and not paid" defined by dates (`accepted_at IS NOT NULL AND customer_since IS NULL`) and defined by status flags (`status = accepted AND has_paid = false`) can differ a lot: in the first deployment, 22 against 40 in the same week. The difference were people who had paid and then cancelled. Pick one definition, state it in the report's method section, and keep it across weeks.

## Call hygiene

Every call to `query_crm_data` / `search_crm_objects` needs the `chatInsights` field; `verbosityLevel: "LOW"` keeps output small. Large results are saved to a file by the harness: process them with a script instead of reading them.
