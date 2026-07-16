export type CapabilityStatus = 'available' | 'adapter-ready' | 'research' | 'speculative'
export type CapabilityCategory = 'input' | 'intelligence' | 'output' | 'governance'

export interface CapabilityDefinition {
  id: string
  name: string
  category: CapabilityCategory
  status: CapabilityStatus
  providerDependent?: boolean
  description: string
  reality: string
  nextStep: string
  permission: string
}

export const capabilityStatusLabels: Record<CapabilityStatus, string> = {
  available: 'Available',
  'adapter-ready': 'Adapter-ready',
  research: 'Research',
  speculative: 'Speculative'
}

export const capabilities: CapabilityDefinition[] = [
  {
    id: 'voice', name: 'Voice', category: 'input', status: 'available',
    description: 'Speech recognition and gentle spoken responses.',
    reality: 'Uses the browser Web Speech APIs; quality and availability depend on the browser and installed voices.',
    nextStep: 'Add streaming speech and local wake-word detection.',
    permission: 'Microphone permission is requested by the browser.'
  },
  {
    id: 'text', name: 'Text', category: 'input', status: 'available',
    description: 'Typed conversation and deterministic commands.',
    reality: 'Handled in the React client with local routing and optional server reasoning.',
    nextStep: 'Add rich attachments and conversation export.',
    permission: 'No additional permission.'
  },
  {
    id: 'touch', name: 'Touch', category: 'input', status: 'available',
    description: 'Responsive controls for phones and tablets.',
    reality: 'The current interface supports pointer and touch interaction through standard web events.',
    nextStep: 'Add gesture shortcuts and haptic-capable adapters.',
    permission: 'No additional permission.'
  },
  {
    id: 'vision', name: 'Vision', category: 'input', status: 'available', providerDependent: true,
    description: 'Consent-based screenshot and image understanding.',
    reality: 'PNG, JPEG, and WebP files are sent to configured Gemini vision only after an action preview.',
    nextStep: 'Add user-selected screen-region capture.',
    permission: 'Explicit approval before every upload.'
  },
  {
    id: 'web-research', name: 'Live Web Research', category: 'input', status: 'available', providerDependent: true,
    description: 'Grounded research with returned source links.',
    reality: 'Gemini Google Search grounding activates only for routed research requests.',
    nextStep: 'Add source-quality ranking and saved research reports.',
    permission: 'Queries leave the device when cloud reasoning is enabled.'
  },
  {
    id: 'markdown-capture', name: 'Markdown Capture', category: 'input', status: 'available',
    description: 'Grow memory by saying “remember that…”.',
    reality: 'POST /remember writes a timestamped Markdown file into the configured notes captures directory.',
    nextStep: 'Index an existing notes vault and detect updated files.',
    permission: 'Writes only to the configured notes directory.'
  },
  {
    id: 'files', name: 'Files & Documents', category: 'input', status: 'adapter-ready',
    description: 'Document extraction and question answering.',
    reality: 'The permission model and visual upload path exist, but general PDF and office-document parsers are not connected.',
    nextStep: 'Add local PDF, DOCX, and spreadsheet extraction.',
    permission: 'Per-file selection and preview required.'
  },
  {
    id: 'camera', name: 'Camera', category: 'input', status: 'adapter-ready',
    description: 'Live camera context with explicit consent.',
    reality: 'Browser media APIs can provide a stream, but ERA does not open or analyze a live camera today.',
    nextStep: 'Build a visible camera session with a persistent recording indicator.',
    permission: 'Explicit camera permission and an active-session indicator.'
  },
  {
    id: 'audio-stream', name: 'Audio Stream', category: 'input', status: 'adapter-ready',
    description: 'Full-duplex conversational audio.',
    reality: 'Current voice recognition is turn-based rather than a continuous bidirectional stream.',
    nextStep: 'Connect Gemini Live with VAD and interruption handling.',
    permission: 'Microphone permission and clear session controls.'
  },
  {
    id: 'video-stream', name: 'Video Stream', category: 'input', status: 'adapter-ready',
    description: 'Time-aware visual context from selected video.',
    reality: 'No video decoder or temporal analysis pipeline is connected.',
    nextStep: 'Add bounded frame sampling for a user-selected clip.',
    permission: 'Per-file or per-session approval.'
  },
  {
    id: 'live-data', name: 'Live Data', category: 'input', status: 'adapter-ready',
    description: 'Weather, market, calendar, and event feeds.',
    reality: 'The orchestrator can route these requests, but dedicated providers are not configured except search grounding.',
    nextStep: 'Add typed connectors with freshness timestamps.',
    permission: 'Connector-specific read scopes.'
  },
  {
    id: 'iot', name: 'IoT & Environment', category: 'input', status: 'adapter-ready',
    description: 'Permission-scoped device and sensor context.',
    reality: 'No device gateway or sensor is connected; the tool boundary is ready for an isolated adapter.',
    nextStep: 'Add an MQTT or Home Assistant connector.',
    permission: 'Device allowlist and confirmation for state changes.'
  },
  {
    id: 'robotics', name: 'Robotics', category: 'input', status: 'research',
    description: 'Physical-agent observation and control.',
    reality: 'ERA has no robot control plane, hardware safety loop, or verified actuator feedback.',
    nextStep: 'Define a simulation-only adapter before physical testing.',
    permission: 'Hardware interlocks and operator supervision required.'
  },
  {
    id: 'vehicle', name: 'Vehicle', category: 'input', status: 'research',
    description: 'Vehicle telemetry and assistance.',
    reality: 'No vehicle bus, OEM API, or safety-certified integration exists.',
    nextStep: 'Limit early work to read-only telemetry in simulation.',
    permission: 'Never control safety-critical systems without certification.'
  },
  {
    id: 'bio-sensors', name: 'Bio Sensors', category: 'input', status: 'research',
    description: 'Health and biometric context.',
    reality: 'No medical or biometric device is connected, and ERA is not a clinical system.',
    nextStep: 'Define consent, retention, and medical-disclaimer requirements.',
    permission: 'Explicit opt-in and strict sensitive-data handling.'
  },
  {
    id: 'space-data', name: 'Space & Orbital Data', category: 'input', status: 'research',
    description: 'Public satellite and orbital information.',
    reality: 'This can be built using public data APIs, but no orbital provider is configured.',
    nextStep: 'Connect a read-only public ephemeris source.',
    permission: 'Provider terms and freshness must be displayed.'
  },
  {
    id: 'neural-bridge', name: 'Neural Bridge', category: 'input', status: 'speculative',
    description: 'Direct neural-signal interaction.',
    reality: 'No neural hardware, validated signal decoder, or safe interface is present.',
    nextStep: 'Keep as a research concept until real, consent-safe hardware exists.',
    permission: 'Not available.'
  },
  {
    id: 'quantum-signal', name: 'Quantum Signal', category: 'input', status: 'speculative',
    description: 'Quantum-computing input or acceleration.',
    reality: 'ERA uses conventional local and cloud computing. No quantum processor is connected.',
    nextStep: 'Only evaluate a concrete workload against a real provider.',
    permission: 'Not available.'
  },
  {
    id: 'orchestrator', name: 'Unified Orchestrator', category: 'intelligence', status: 'available',
    description: 'One external voice with internally selected specialist roles.',
    reality: 'A deterministic router selects up to five logical specialist instructions for one model request.',
    nextStep: 'Add isolated tool workers with shared traces.',
    permission: 'Routes are visible in the OS Center.'
  },
  {
    id: 'memory-layers', name: 'Memory Layers', category: 'intelligence', status: 'available',
    description: 'Working, long-term, semantic, and episodic context.',
    reality: 'Conversation is working context; explicit memories use browser storage and Markdown captures.',
    nextStep: 'Add encrypted semantic indexing over the notes vault.',
    permission: 'Memory can be paused, viewed, and deleted.'
  },
  {
    id: 'knowledge-graph', name: 'LIVE Knowledge Graph', category: 'intelligence', status: 'available',
    description: 'Visible relationships among projects and memories.',
    reality: 'Lexical semantic similarity chooses related nodes; new captures animate into the graph.',
    nextStep: 'Upgrade to local embeddings and editable relationships.',
    permission: 'Graph data remains local in this version.'
  },
  {
    id: 'planning', name: 'Planning', category: 'intelligence', status: 'available',
    description: 'Projects, roadmaps, priorities, and next actions.',
    reality: 'Projects persist locally and roadmap prompts use configured reasoning.',
    nextStep: 'Add milestones, dependencies, and calendar synchronization.',
    permission: 'External schedule changes require confirmation.'
  },
  {
    id: 'finance', name: 'Finance Intelligence', category: 'intelligence', status: 'available', providerDependent: true,
    description: 'Educational market research and risk frameworks.',
    reality: 'ERA provides analysis only. It has no brokerage connection and cannot execute trades.',
    nextStep: 'Add timestamped read-only market data.',
    permission: 'No autonomous transactions.'
  },
  {
    id: 'consciousness', name: 'Consciousness Layer', category: 'intelligence', status: 'speculative',
    description: 'Claims of subjective awareness or a persistent self.',
    reality: 'ERA does not claim consciousness, feelings, self-awareness, or an independent will.',
    nextStep: 'Keep language and product behavior transparent about model limitations.',
    permission: 'Not a deployable capability.'
  },
  {
    id: 'counterfactual', name: 'Scenario Modeling', category: 'intelligence', status: 'adapter-ready',
    description: 'Compare alternatives, risks, and counterfactual outcomes.',
    reality: 'Language-model reasoning can generate scenarios, but they are estimates rather than future knowledge.',
    nextStep: 'Add explicit assumptions, confidence labels, and domain data.',
    permission: 'User remains the decision-maker.'
  },
  {
    id: 'text-output', name: 'Text & Code', category: 'output', status: 'available',
    description: 'Answers, plans, explanations, and code assistance.',
    reality: 'Text is rendered in the conversation interface; code execution is not automatic.',
    nextStep: 'Add sandboxed code previews and export.',
    permission: 'Execution requires an isolated tool and confirmation.'
  },
  {
    id: 'voice-output', name: 'Voice Output', category: 'output', status: 'available',
    description: 'Soft, configurable spoken responses.',
    reality: 'Browser speech synthesis applies voice selection, pace, and pitch preferences.',
    nextStep: 'Add an optional consistent neural character voice.',
    permission: 'Audio plays only when spoken replies are enabled.'
  },
  {
    id: 'local-actions', name: 'Local Actions', category: 'output', status: 'available',
    description: 'Timers, notes, calculations, and allowlisted websites.',
    reality: 'Only deterministic implemented actions can run; each result is reported honestly.',
    nextStep: 'Add signed desktop adapters with capability scopes.',
    permission: 'Consequential actions use previews and approval gates.'
  },
  {
    id: 'ar-spatial', name: 'AR, Spatial & Haptics', category: 'output', status: 'research',
    description: 'Spatial interfaces and physical feedback.',
    reality: 'No XR renderer or haptic device adapter is included.',
    nextStep: 'Prototype a standards-based WebXR viewer.',
    permission: 'Per-device consent and safe intensity limits.'
  },
  {
    id: 'holographic', name: 'Holographic & Volumetric', category: 'output', status: 'speculative',
    description: 'Volumetric or holographic presence.',
    reality: 'No compatible display pipeline or hardware integration exists.',
    nextStep: 'Treat as a future display adapter, not a current feature.',
    permission: 'Not available.'
  },
  {
    id: 'privacy', name: 'Privacy Controls', category: 'governance', status: 'available',
    description: 'Memory controls, secret rejection, and local-first state.',
    reality: 'Sensitive captures are blocked, memory is inspectable, and API keys stay server-side.',
    nextStep: 'Add encrypted storage and per-connector retention policies.',
    permission: 'The user can disable memory and delete local records.'
  },
  {
    id: 'action-gates', name: 'Action Gates', category: 'governance', status: 'available',
    description: 'Purpose, impact, risk, and execution previews.',
    reality: 'Destructive local actions and image uploads require explicit approval.',
    nextStep: 'Apply signed approvals to every future external tool.',
    permission: 'The user is the final authority.'
  },
  {
    id: 'audit', name: 'Auditability', category: 'governance', status: 'available',
    description: 'Visible routing, approvals, failures, and actions.',
    reality: 'A bounded local audit log records current application events.',
    nextStep: 'Add export, integrity checks, and configurable retention.',
    permission: 'Audit data remains local and can be cleared.'
  }
]

export function resolveCapabilityStatus(
  capability: CapabilityDefinition,
  providerConnected: boolean
): CapabilityStatus {
  if (capability.providerDependent && !providerConnected) return 'adapter-ready'
  return capability.status
}
