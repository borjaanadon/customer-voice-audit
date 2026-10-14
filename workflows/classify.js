// Customer voice audit: weekly classification, one agent per funnel stage.
// Run with Claude Code's Workflow tool. Edit CONFIG first (it mirrors audit-config.md).
// Output: one object per agent. Aggregate it with a script (dedupe by contact + normalised quote),
// never by reading it: the output is large.

export const meta = {
  name: 'customer-voice-audit',
  description: 'Classify a week of lead and customer replies from the CRM by funnel stage, with literal quotes and outcome signals',
  phases: [{ title: 'Classify', detail: 'One agent per stage, plus triage of replies with no stage and a follow-up of last week\'s blocked people' }],
}

// ---------- EDIT FOR YOUR PORTAL AND PERIOD ----------
const CONFIG = {
  start: '2026-10-05', // Monday
  end: '2026-10-11',   // Sunday (BETWEEN is inclusive to the whole day)
  // How the agent finds the CRM query tool. For Claude's HubSpot connector:
  toolSearch: 'hubspot query crm data',
  replyObject: 'TICKET',
  replyFields: 'hs_object_id, subject, content, source_type, createdate',
  contactFields: 'CONTACT.email, CONTACT.hs_email_last_email_name',
  stages: [
    {
      key: 'deciding',
      label: 'Deciding to buy (accepted, not paid)',
      // Cross-object filters on dates are ignored in HubSpot: only IS NULL / IS NOT NULL here.
      where: 'CONTACT.accepted_at IS NOT NULL AND CONTACT.customer_since IS NULL',
      extraFields: 'CONTACT.accepted_at, CONTACT.customer_since',
      taxonomy: 'B1 Price, cannot afford · B2 Value unclear · B3 Trust · B4 How it works · B5 Timing · B6 Already solved elsewhere · B7 Checkout or payment broken · B8 Discount or payment options · B9 Status confusion · B10 Not interested · B11 Ready to buy · B12 Other',
      signals: ['will_convert', 'on_the_fence', 'blocked', 'wont_convert', 'confused_status', 'unclear'],
      // Leakage check: replies written before this date belong to the previous stage.
      stageDateField: 'accepted_at',
    },
    {
      key: 'in_process',
      label: 'Stuck in a process (onboarding)',
      // IN does not work in HubSpot: the agent runs one query per value.
      whereValues: { property: 'CONTACT.status', values: ['started', 'in_review', 'dropped_out'] },
      extraFields: 'CONTACT.status',
      taxonomy: 'P1 Link invalid or technical error · P2 Wants to finish, needs link or time · P3 Where am I · P4 Completed a step, asking status · P5 What do I get, is it paid · P6 Missing information · P7 Not interested · P8 Other',
      signals: ['will_complete', 'on_the_fence', 'blocked', 'wont_complete', 'already_completed', 'unclear'],
    },
  ],
  // Replies whose contact has no stage: rescue the real people.
  triage: { where: 'CONTACT.status IS NULL' },
  // People named as blocked in last week's report (emails), to check if they moved.
  followUp: [],
  noiseSenders: ['notify@', 'no-reply@', 'noreply@', 'calendar-notification@', 'mailer-daemon@'],
  model: 'sonnet', effort: 'high', // classification against a closed taxonomy; aggregation stays in the main session
}
// -----------------------------------------------------

const RULES = `
CRM QUERY LIMITS (HubSpot, verified): a BETWEEN on a CONTACT date is silently ignored in cross-object queries, so never rely on it; IN does not work, run one query per value; OFFSET does not paginate, split by day of createdate if you hit the limit; no expressions in GROUP BY. Every call needs chatInsights and verbosityLevel "LOW".
NOISE: drop and count anything sent by ${CONFIG.noiseSenders.join(', ')}, calendar invites, tool notifications, bounces, partners and vendors, and internal notes written by our team. Filter by sender, not by subject. Return the list of dropped senders.
QUOTES: "quote" is the person's own words only, literal. Strip quoted previous emails, signatures, footers and tracking links. Never paraphrase or translate. Always include the email.
INCLUSION: only people talking about this funnel. People looking for something we do not sell go to category Other with a note. Six well-classified records beat forty forced ones.`

const RECORD = {
  type: 'object', additionalProperties: false,
  properties: {
    email: { type: 'string' }, record_id: { type: 'string' }, created: { type: 'string' }, subject: { type: 'string' },
    quote: { type: 'string' }, category_primary: { type: 'string' }, category_secondary: { type: 'string' },
    signal: { type: 'string' }, triggered_by: { type: 'string' }, is_bug: { type: 'boolean' },
    bug_repro: { type: 'string' }, written_before_stage: { type: 'boolean' }, note: { type: 'string' },
  },
  required: ['email', 'record_id', 'quote', 'category_primary', 'signal'],
}
const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    stage: { type: 'string' }, total_fetched: { type: 'number' }, noise_dropped: { type: 'number' },
    dropped_senders: { type: 'array', items: { type: 'string' } },
    records: { type: 'array', items: RECORD }, notes: { type: 'string' },
  },
  required: ['stage', 'total_fetched', 'noise_dropped', 'records'],
}

function base(stage) {
  const fields = [CONFIG.replyFields, CONFIG.contactFields, stage.extraFields].filter(Boolean).join(', ')
  const period = `createdate BETWEEN '${CONFIG.start}' AND '${CONFIG.end}'`
  const queries = stage.whereValues
    ? stage.whereValues.values.map(v => `SELECT ${fields} FROM ${CONFIG.replyObject} WHERE ${period} AND ${stage.whereValues.property} = '${v}' LIMIT 200`)
    : [`SELECT ${fields} FROM ${CONFIG.replyObject} WHERE ${period} AND ${stage.where} LIMIT 200`]
  return { fields, queries }
}

function stagePrompt(stage) {
  const { queries } = base(stage)
  return `You classify customer replies for a weekly customer-voice audit. Stage: ${stage.label}. Period: ${CONFIG.start} to ${CONFIG.end}.
1. Find the CRM query tool with ToolSearch ("${CONFIG.toolSearch}") and load it.
2. Run these queries:
${queries.map(q => '   ' + q).join('\n')}
3. Drop noise (rules below). Classify every remaining reply.
   Taxonomy (closed): ${stage.taxonomy}.
   Signal: one of ${stage.signals.join(', ')}.
   triggered_by: which of our messages they answered (from the subject or hs_email_last_email_name).
   is_bug: true only for a technical failure that stops them; then bug_repro = one line with the literal error.
   ${stage.stageDateField ? `written_before_stage: true if createdate is earlier than ${stage.stageDateField} (they were still in the previous stage).` : ''}
4. Return JSON per the schema, stage="${stage.key}".
${RULES}`
}

const jobs = CONFIG.stages.map(s => () =>
  agent(stagePrompt(s), { schema: SCHEMA, phase: 'Classify', label: `classify:${s.key}`, model: CONFIG.model, effort: CONFIG.effort }))

if (CONFIG.triage) {
  jobs.push(() => agent(`Triage replies whose contact has no stage, for a weekly customer-voice audit. Period: ${CONFIG.start} to ${CONFIG.end}.
1. Load the CRM query tool with ToolSearch ("${CONFIG.toolSearch}").
2. First pull only subjects and senders: SELECT hs_object_id, subject, createdate, CONTACT.email FROM ${CONFIG.replyObject} WHERE createdate BETWEEN '${CONFIG.start}' AND '${CONFIG.end}' AND ${CONFIG.triage.where} LIMIT 200
3. Drop noise by sender. For the survivors only, fetch content by hs_object_id.
4. Keep only real people talking about our funnel. Classify each with the taxonomy of the stage they most likely belong to and say which in note.
Return JSON per the schema, stage="triage". Report how many you dropped and by which rule.
${RULES}`, { schema: SCHEMA, phase: 'Classify', label: 'triage', model: CONFIG.model, effort: CONFIG.effort }))
}

if (CONFIG.followUp.length) {
  jobs.push(() => agent(`Follow-up for a weekly customer-voice audit. For each of these people, look up their CURRENT stage and stage dates in the CRM, one person per query: ${CONFIG.followUp.join(', ')}.
Load the CRM query tool with ToolSearch ("${CONFIG.toolSearch}"). Return one record per person with category_primary = their current stage, signal = "advanced" or "still_blocked", and quote = "" . Trust only status and date fields; do not infer from silence.
Return JSON per the schema, stage="follow_up".`, { schema: SCHEMA, phase: 'Classify', label: 'follow-up', model: CONFIG.model, effort: CONFIG.effort }))
}

phase('Classify')
const results = await parallel(jobs)
// agent() returns null if a leg dies and parallel() never throws: check for nulls before aggregating.
return { period: { start: CONFIG.start, end: CONFIG.end }, failed: results.filter(r => !r).length, results: results.filter(Boolean) }
