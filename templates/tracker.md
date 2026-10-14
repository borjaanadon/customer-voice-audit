# Action tracker

The bridge between whoever runs the audit and whoever acts on it. One row per action point. In Notion, create a database with these properties; in Markdown, keep this table.

| Property | Type | Values | Convention |
|---|---|---|---|
| Task | title | free text | The concrete action, with the names or emails that trigger it in brackets |
| Stage | select | one per funnel stage (e.g. `Completion`, `Conversion`) | Exactly one per row |
| Prio | select | `1` · `2` · `3` | 1 = high-intent blockage or a decision with the biggest return. 3 = tactical or low volume |
| Week added | text | `W##` | Week it was detected |
| Owner | select | from `audit-config.md` | |
| Status | status | `Not started` · `In progress` · `Done` | New rows start `Not started` |

**View:** sort by Stage, then Prio, so the order never depends on the order rows were created.

**Repeated issues:** a new row prefixed `W## recurring, N weeks |`. Do not edit the old row: it keeps the history.

## Rows (Markdown mode)

| Task | Stage | Prio | Week added | Owner | Status |
|---|---|---|---|---|---|
