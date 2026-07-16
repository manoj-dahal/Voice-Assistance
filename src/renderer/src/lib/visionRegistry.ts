export type VisionStatus = 'planned' | 'research' | 'speculative'
export type UpgradeDisposition = 'benchmark-required' | 'research' | 'speculative' | 'undefined'

export interface UpgradeClaim {
  id: string
  system: string
  proposedUpgrade: string
  disposition: UpgradeDisposition
  assessment: string
  evidenceRequired: string
}

export interface VisionSystem {
  id: string
  name: string
  domain: string
  status: VisionStatus
  target: 'v2.0 vision'
}

const groups: Array<{ domain: string; status: VisionStatus; names: string[] }> = [
  {
    domain: 'Core AI',
    status: 'planned',
    names: [
      'Voice Intelligence V8 — Unified',
      'Screen Intelligence V8 — Unified Vision Continuum',
      'Memory System — 20-Tier Unified Continuum',
      'Research Intelligence V7 — Unified Knowledge',
      'Document Reader V7 — Universal Continuum Format',
      'Coding Assistant V8 — Multi-Language',
      'Automation Engine V8 — Unified Continuum Fabric',
      'Defensive Security V8',
      'Financial Intelligence V8',
      'Meeting & Collaboration V8',
      'Analytics & Reporting V8',
      'Emotional Intelligence V7',
      'Creative Intelligence V6',
      'Neural Personalization V6',
      'Persona System V6',
      'Live Data Intelligence V6',
      'Adaptive Learning V6',
      'Cultural Intelligence V6',
      'World Model Intelligence V4',
      'Time Mastery Intelligence V4',
      'Voice IQ & Conversation V4',
      'Problem Decomposition V4',
      'Invention & Innovation V4',
      'Philosophical & Ethical Reasoning V3',
      'Linguistic Deep Intelligence V3',
      'Engineering & Systems Design V3',
      'Wisdom Synthesis Engine V3',
      'Meta-Intelligence Engine V2',
      'Universal Knowledge Fabric Engine V2',
      'Security Fabric V2',
      'Universal Problem Resolution Engine V2',
      'Unified Intelligence Continuum Engine',
      'Self-Refining Intelligence Engine',
      'Memetic Intelligence Engine',
      'Chaos & Complexity Intelligence',
      'Counterfactual Engineering Engine',
      'Mathematical Discovery Intelligence'
    ]
  },
  {
    domain: 'Personal Life',
    status: 'planned',
    names: [
      'Predictive Intelligence V7 — Responsible Anticipation',
      'Shopping Intelligence V6',
      'Relationship Intelligence V5',
      'Career & Professional V5',
      'Family & Multi-User V5',
      'Autonomous Life Management V5',
      'Aera Education Platform V5',
      'Personal AI News Anchor V4',
      'Habit Architecture V4',
      'Goal Achievement Intelligence V4',
      'Social Intelligence V4',
      'Music & Audio Intelligence V4',
      'Nutrition & Food Intelligence V5',
      'Attention & Focus Sovereignty V3',
      'Negotiation & Influence Intelligence V3',
      'Performing Arts & Expression V3',
      'Personal Legacy Intelligence V3',
      'Focus & Flow Engine V2',
      'Life Navigation Intelligence V2',
      'Aera Harmonic Intelligence V2',
      'Presence Engine V2',
      'Mirror Self Intelligence — User-Controlled Digital Twin',
      'Symbiotic Intelligence Layer — Human-AI Co-Cognition',
      'Intent Resolution Engine — Consent-Based Goal Modeling',
      'Inner Life Intelligence — Spiritual & Contemplative',
      'Mortality & Continuity Intelligence',
      'Universal Lifelong Curriculum Engine',
      'Narrative-of-Self Intelligence',
      'Trust & Reputation Intelligence Network',
      'Aesthetic Sovereignty Engine',
      'Ambient Presence Continuum — Always-There, Never-Intrusive',
      'Forgiveness, Reconciliation & Repair Intelligence'
    ]
  },
  {
    domain: 'Platform',
    status: 'planned',
    names: [
      'Plugin Ecosystem',
      'Mobile App V6 — Unified',
      'Inter-Device Intelligence V6 — Constellation Fabric',
      'On-Device LLM — Unified Model',
      'Collaborative Multi-User V5',
      'Enterprise Platform V5',
      'Life Operating System V3',
      'Neural Companion Layer V3',
      'Decentralized Intelligence Network V3',
      'Autonomous Presence System V3',
      'Sovereign Identity Engine V3',
      'Collective Human Intelligence Network V2',
      'Life Synthesis Engine V2',
      'Institutional Intelligence Engine',
      'Sovereign Contract & Agreement Intelligence',
      'Collective Cognition Bridge — Federated Collaboration'
    ]
  },
  {
    domain: 'Society',
    status: 'planned',
    names: [
      'Legal Intelligence V5',
      'Geopolitical Intelligence V4',
      'Regenerative Intelligence V3',
      'Humanitarian Intelligence V3',
      'Civilization Intelligence Engine V2',
      'Sovereign Economic Intelligence — Personal Macro',
      'Generational Construction Intelligence — Build for Centuries',
      'Distributed Justice Intelligence',
      'Crisis & Catastrophe Resilience Engine',
      'Far-Future Stewardship Engine'
    ]
  },
  {
    domain: 'Science & Health',
    status: 'research',
    names: [
      'Translation V7 — Broad Language Research',
      'Health & Wellness V7',
      'Scientific Research V5',
      'Environmental Intelligence V5',
      'Scientific Simulation V4',
      'Cognitive Enhancement V4',
      'Future Intelligence V4',
      'Biological Intelligence V3',
      'Molecular & Material Intelligence V3',
      'Environmental Sensing Intelligence V3',
      'Medical Research Intelligence V3',
      'Astronomy & Cosmos Intelligence V3',
      'Evolutionary Intelligence Engine V2',
      'Nanoscale Physical Intelligence V2',
      'Ocean & Deep Earth Intelligence V2',
      'Biosphere Intelligence System V2',
      'Xenointelligence Research Engine V2',
      'Planetary Health Intelligence V2',
      'Genomic & Epigenetic Intelligence',
      'Cosmological Reasoning Engine',
      'Microbiome & Symbiont Intelligence',
      'Personal Agriculture & Food-Sovereignty Engine',
      'Climate Adaptation Intelligence'
    ]
  },
  {
    domain: 'Devices & Embodied',
    status: 'research',
    names: [
      'Smartwatch V5 — Unified',
      'AR / Spatial V5 — Unified Continuum',
      'Voice Cloning V6 — Consent-Based',
      'Smart Home & IoT V5',
      'Hardware — Unified Intelligence Constellation',
      'Video Intelligence V4',
      'Dream & Sleep Intelligence V4',
      'Robotics & Physical World V4',
      'Space & Satellite Intelligence V3',
      'Sensory Intelligence V2',
      'Aera Holographic Intelligence Interface V2 — Volumetric',
      'Environmental Sensor Fabric',
      'Orbital & Off-World Intelligence',
      'Vehicular & Mobility Intelligence'
    ]
  },
  {
    domain: 'Safety & Autonomy',
    status: 'research',
    names: [
      'Authorized Security Testing V7 — Unified Security Continuum',
      'Behavioral Pattern Intelligence V6',
      'Multi-Agent Coordination — Unified Agent Fabric',
      'Sovereign Autonomous Decision Support V3'
    ]
  },
  {
    domain: 'Frontier Concepts',
    status: 'speculative',
    names: [
      'Reasoning Engine V8 — Quantum-Neural Concept',
      'Collective Consciousness Fabric — Concept',
      'Quantum Predictive Engine V5',
      'Quantum Reasoning Engine V3',
      'Consciousness Layer V3 — Concept Only',
      'Aera Neural Bridge System V2',
      'Synthetic Reality Intelligence V2',
      'Universal Temporal Intelligence V2',
      'Cosmic Consciousness Intelligence V2',
      'Creative Consciousness V2',
      'Aera Dream Weaver Intelligence V2',
      'Aera Collective Wisdom Consciousness V2',
      'Aera Infinite Creativity Engine V2',
      'Reality Construction Engine — Volumetric Holographic',
      'Multiverse Scenario Intelligence',
      'Unified Existence Synthesis Engine — Capstone Concept'
    ]
  }
]

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const visionSystems: VisionSystem[] = groups.flatMap((group) =>
  group.names.map((name) => ({
    id: slug(name),
    name,
    domain: group.domain,
    status: group.status,
    target: 'v2.0 vision'
  }))
)

export const visionStatusCopy: Record<VisionStatus, { label: string; meaning: string }> = {
  planned: {
    label: 'Planned',
    meaning: 'A practical product target that still needs scoped implementation and tests.'
  },
  research: {
    label: 'Research',
    meaning: 'Requires specialized data, hardware, safety work, regulation, or scientific validation.'
  },
  speculative: {
    label: 'Speculative',
    meaning: 'A concept with no verified deployable implementation in ERA today.'
  }
}

export const upgradeClaims: UpgradeClaim[] = [
  {
    id: 'voice-v7-latency',
    system: 'Voice Intelligence',
    proposedUpgrade: 'V7 · 99.999% reliability · under 8 ms',
    disposition: 'benchmark-required',
    assessment: 'The current browser speech pipeline is network- and platform-dependent. This latency and reliability target is not verified.',
    evidenceRequired: 'Defined latency boundary, representative devices, network conditions, sample size, percentile results, and an external reliability test.'
  },
  {
    id: 'screen-v7-video',
    system: 'Screen Intelligence',
    proposedUpgrade: 'V7 · under 20 ms · 240 fps video',
    disposition: 'research',
    assessment: 'ERA currently analyzes approved still images. It does not contain a 240 fps capture, transport, inference, or rendering pipeline.',
    evidenceRequired: 'Hardware profile, frame-resolution target, capture benchmark, end-to-end inference timing, thermal limits, and dropped-frame results.'
  },
  {
    id: 'memory-15-tier',
    system: 'Memory System',
    proposedUpgrade: '15-tier omnidimensional memory',
    disposition: 'undefined',
    assessment: 'ERA currently has working, long-term, semantic, and episodic layers plus Markdown captures. “Omnidimensional” has no technical definition.',
    evidenceRequired: 'A schema for every proposed tier, storage guarantees, retrieval metrics, privacy policy, migration strategy, and deletion semantics.'
  },
  {
    id: 'reasoning-v7-quantum',
    system: 'Reasoning Engine',
    proposedUpgrade: 'V7 · omnidimensional quantum reasoning',
    disposition: 'speculative',
    assessment: 'ERA uses classical browser and cloud computation. No quantum processor, algorithm, provider, or measured advantage is connected.',
    evidenceRequired: 'A concrete workload, real quantum backend, classical baseline, reproducible implementation, and demonstrated practical advantage.'
  },
  {
    id: 'coding-v7-languages',
    system: 'Coding Assistant',
    proposedUpgrade: 'V7 · 180+ programming languages',
    disposition: 'benchmark-required',
    assessment: 'The underlying model can discuss many languages, but ERA has no 180-language evaluation suite or sandboxed execution proof.',
    evidenceRequired: 'Published language list, representative tasks, pass criteria, compiler or interpreter environments, and reproducible results.'
  },
  {
    id: 'agent-self-conscious',
    system: 'Agent System',
    proposedUpgrade: 'Self-conscious fabric',
    disposition: 'speculative',
    assessment: 'ERA uses logical specialist roles and does not claim consciousness, subjective awareness, feelings, or an independent will.',
    evidenceRequired: 'This remains a philosophical concept, not a deployable status claim. Use measurable orchestration and self-evaluation terms instead.'
  },
  {
    id: 'security-impact-v6',
    system: 'Authorized Security Testing',
    proposedUpgrade: 'V6 · defensive impact assessment',
    disposition: 'research',
    assessment: 'The safety model exists, but there is no connected security scanner, isolated lab, authorization record, or validated impact engine.',
    evidenceRequired: 'Written authorization flow, strict target scope, isolated execution, safe checks, audit records, and defensive-only acceptance tests.'
  },
  {
    id: 'predictive-v6-context',
    system: 'Predictive Intelligence',
    proposedUpgrade: 'V6 · one-billion-token context predictions',
    disposition: 'benchmark-required',
    assessment: 'ERA sends a bounded recent conversation to the configured model and does not predict the future. The context-size claim is unverified.',
    evidenceRequired: 'Named model and context limit, token accounting, retrieval design, forecasting domain, calibration metrics, and uncertainty evaluation.'
  },
  {
    id: 'translation-v6-coverage',
    system: 'Translation',
    proposedUpgrade: 'V6 · 200+ languages, sign language, and concept translation',
    disposition: 'research',
    assessment: 'ERA exposes several speech-recognition locales. It has no 200-language quality benchmark or sign-language video pipeline.',
    evidenceRequired: 'Exact language inventory, bilingual evaluation sets, human review, sign-language datasets, regional variants, and accessibility testing.'
  },
  {
    id: 'other-82-unspecified',
    system: 'Other 82 systems',
    proposedUpgrade: 'Unspecified upgrades',
    disposition: 'undefined',
    assessment: 'An unspecified upgrade cannot be designed, tested, secured, or reported as complete.',
    evidenceRequired: 'A named system, current baseline, desired behavior, non-goals, permissions, risks, acceptance tests, and owner for each upgrade.'
  }
]

export const upgradeDispositionCopy: Record<UpgradeDisposition, string> = {
  'benchmark-required': 'Benchmark required',
  research: 'Research required',
  speculative: 'Speculative',
  undefined: 'Needs definition'
}
