export type AdvancedFeatureStatus = 'planned' | 'research'
export type AdvancedFeatureRisk = 'low' | 'medium' | 'high'

export interface AdvancedFeature {
  id: string
  name: string
  category: string
  status: AdvancedFeatureStatus
  risk: AdvancedFeatureRisk
  purpose: string
}

function slug(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function group(
  category: string,
  status: AdvancedFeatureStatus,
  risk: AdvancedFeatureRisk,
  entries: Array<[string, string]>
): AdvancedFeature[] {
  return entries.map(([name, purpose]) => ({
    id: `advanced.${slug(category)}.${slug(name)}`,
    name,
    category,
    status,
    risk,
    purpose
  }))
}

export const advancedFeatures: AdvancedFeature[] = [
  ...group('Voice & Language', 'planned', 'low', [
    ['Multilingual Wake Phrases', 'Configure local activation phrases independently for each selected language.'],
    ['Automatic Language Detection', 'Detect likely language changes and ask before changing speech recognition.'],
    ['Mixed-Language Conversation', 'Preserve code-switching, proper nouns, code, and filenames across languages.'],
    ['Transliteration Mode', 'Convert selected text between writing systems without claiming full translation.'],
    ['Pronunciation Training', 'Store user-approved pronunciation preferences for names and technical terms.'],
    ['Conversation Captions', 'Display synchronized speaker, timestamp, language, and correction metadata.'],
    ['Voice Calibration', 'Measure microphone readiness, noise, volume, and installed voice compatibility.']
  ]),
  ...group('Voice & Language', 'research', 'high', [
    ['Speaker Separation', 'Separate consenting speakers in approved recordings without unauthorized identity inference.']
  ]),
  ...group('Agent Intelligence', 'planned', 'medium', [
    ['Visual Dependency Editor', 'Design agent-task dependency graphs with explicit parallel and sequential stages.'],
    ['Agent Consensus', 'Compare independent specialist findings and expose agreement and disagreement.'],
    ['Agent Debate Mode', 'Run proposal, critique, evidence, risk, and synthesis roles under one visible workflow.'],
    ['Agent Budgets', 'Limit mission requests, tokens, cost, time, concurrency, and retries.'],
    ['Agent Checkpoints', 'Pause dependency graphs for explicit user approval before downstream work.'],
    ['Mission Templates', 'Create reusable, permission-aware agent mission templates.'],
    ['Mission Cloning', 'Duplicate a prior mission while changing the objective and preserving controls.'],
    ['Mission Comparison', 'Compare model, latency, cost, sources, failures, and results across runs.'],
    ['Agent Result Voting', 'Collect user quality feedback without claiming autonomous self-improvement.']
  ]),
  ...group('Skills', 'planned', 'medium', [
    ['Skill Versioning', 'Track manifest, permission, trigger, migration, and rollback history.'],
    ['Skill Dependencies', 'Declare and validate capabilities required by each skill.'],
    ['Skill Conflict Detection', 'Detect overlapping trigger phrases and incompatible enabled skills.'],
    ['Skill Permission Diff', 'Show new, removed, and expanded permissions before updates.'],
    ['Skill Execution Receipts', 'Record triggers, inputs, permissions, approvals, outputs, duration, and failures.'],
    ['Voice-Created Skills', 'Convert spoken skill descriptions into simulation-only drafts.'],
    ['Skill Test Cases', 'Attach intent, permission, confirmation, and output assertions to skills.']
  ]),
  ...group('Skills', 'research', 'high', [
    ['Signed Skill Marketplace', 'Require publisher verification, signatures, integrity hashes, scanning, and revocation.']
  ]),
  ...group('Memory & Knowledge', 'planned', 'medium', [
    ['Memory Timeline', 'Browse memories by date, project, decision, event, and milestone.'],
    ['Memory Importance', 'Assign critical, important, normal, temporary, and archived retention levels.'],
    ['Memory Pinning', 'Prioritize user-pinned memories in local retrieval and graph layout.'],
    ['Memory Source Preview', 'Display the original voice, note, document, conversation, or import source.'],
    ['Memory Merge Assistant', 'Propose merges for duplicates while preserving original records.'],
    ['Memory Branch History', 'Retain revision history when facts and preferences change.'],
    ['Project Memory Boundaries', 'Restrict project memories to their approved project context.'],
    ['Local Embedding Profiles', 'Choose fast, multilingual, high-quality, or offline local embedding profiles.'],
    ['Knowledge Graph Relationship Editor', 'Create, rename, merge, and delete explicit graph relationships.'],
    ['Knowledge Graph Explanation', 'Explain the local evidence used to suggest a relationship.']
  ]),
  ...group('Provider Management', 'planned', 'medium', [
    ['Provider Capability Matrix', 'Report text, vision, audio, tools, search, streaming, and context support.'],
    ['Per-Skill Provider Assignment', 'Choose an approved model route independently for each skill.'],
    ['Prompt Caching', 'Use supported provider caching to reduce repeated cost and latency.'],
    ['Request Batching', 'Combine compatible low-priority requests without mixing private contexts.'],
    ['Provider Latency History', 'Track median, percentile, failure, fallback, and output metrics locally.'],
    ['Provider Maintenance Mode', 'Disable a provider temporarily without deleting encrypted credentials.'],
    ['Model Compatibility Test', 'Test system prompts, JSON, Unicode, tool calls, cancellation, and long output.']
  ]),
  ...group('Privacy & Security', 'planned', 'high', [
    ['Data-Flow Map', 'Visualize where microphone, text, image, memory, and provider data travel.'],
    ['Per-Language Privacy Rules', 'Apply different cloud and retention policies by selected language.'],
    ['Provider Retention Labels', 'Show documented provider-retention expectations with freshness dates.'],
    ['Secure Temporary Workspace', 'Erase temporary messages, images, notes, searches, and task results on exit.'],
    ['Screenshot Redaction', 'Blur selected faces, identifiers, names, and screen regions before upload.'],
    ['Secret Quarantine', 'Block, clear, and avoid repeating detected credentials or private keys.'],
    ['Permission Expiration', 'Grant capabilities for one action, a duration, a session, or until revocation.'],
    ['Security Policy Simulator', 'Evaluate planned workflows against current permission policies without execution.']
  ]),
  ...group('Desktop & Mobile', 'planned', 'medium', [
    ['Desktop Quick-Capture Widget', 'Capture voice memories, screenshots, reminders, clipboard text, and quick tasks.'],
    ['Cross-Device Handoff', 'Transfer approved context between paired devices using encrypted sessions.'],
    ['Phone-as-Camera Mode', 'Use an explicitly active phone camera with a persistent capture indicator.'],
    ['Remote Approval', 'Approve a waiting desktop action from an authenticated paired device.'],
    ['Device Capability Matrix', 'Show exactly which permissions are available on each paired device.'],
    ['Offline Mobile Capture', 'Store mobile captures locally and synchronize only after approval.']
  ]),
  ...group('Productivity', 'planned', 'medium', [
    ['Universal Task Relationships', 'Connect tasks with projects, notes, meetings, decisions, and reminders.'],
    ['Task Energy Levels', 'Classify work as deep, quick, creative, administrative, or low-energy.'],
    ['Rescheduling Proposals', 'Suggest schedule changes after missed work without silently editing calendars.'],
    ['Priority Explanation', 'Explain the evidence and constraints behind task-priority recommendations.'],
    ['Deadline Risk Detection', 'Identify dependency, workload, ownership, and deadline conflicts.'],
    ['Completion Evidence', 'Require approved evidence such as a file, test, checklist, or confirmation.']
  ])
]
