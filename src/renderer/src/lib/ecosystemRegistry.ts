export type EcosystemStage = 'planned' | 'research'
export type EcosystemRisk = 'low' | 'moderate' | 'high' | 'critical'

export interface EcosystemCategory {
  id: string
  name: string
  targetMinimum: number
  coverageGoal: string
  examples: string
  stage: EcosystemStage
  risk: EcosystemRisk
  authorization: string
  dataDirection: string
  approvalBoundary: string
  firstMilestone: string
  localFoundation?: string
  providerDependent?: boolean
}

export const ecosystemCategories: EcosystemCategory[] = [
  {
    id: 'email', name: 'Email', targetMinimum: 20, coverageGoal: 'Major email providers', examples: 'Gmail, Outlook, IMAP/SMTP', stage: 'planned', risk: 'high',
    authorization: 'OAuth with incremental scopes', dataDirection: 'Read metadata first; draft before send', approvalBoundary: 'Explicit approval before every external message', firstMilestone: 'Read-only Gmail inbox summary with a visible scope inspector.'
  },
  {
    id: 'calendar', name: 'Calendar', targetMinimum: 15, coverageGoal: 'Common calendar systems', examples: 'Google Calendar, Microsoft 365, CalDAV', stage: 'planned', risk: 'high',
    authorization: 'OAuth or per-server CalDAV credentials', dataDirection: 'Read events; propose writes', approvalBoundary: 'Confirm event creation, changes, invitations, and deletion', firstMilestone: 'Read-only upcoming-event briefing through one provider.'
  },
  {
    id: 'communication', name: 'Communication', targetMinimum: 30, coverageGoal: 'Major team and messaging platforms', examples: 'Slack, Teams, Discord', stage: 'planned', risk: 'high',
    authorization: 'OAuth with workspace allowlists', dataDirection: 'Read selected channels; draft outbound content', approvalBoundary: 'Confirm every message, post, mention, or membership change', firstMilestone: 'Summarize one explicitly selected Slack channel.'
  },
  {
    id: 'storage', name: 'Storage & Decentralized', targetMinimum: 25, coverageGoal: 'Cloud storage plus decentralized adapters', examples: 'Drive, OneDrive, Dropbox, IPFS', stage: 'planned', risk: 'high',
    authorization: 'OAuth, local folder grants, or signed wallet capability', dataDirection: 'Read selected roots; write only to approved paths', approvalBoundary: 'Confirm upload, sharing, movement, overwrite, and deletion', firstMilestone: 'Read-only Google Drive folder browser.'
  },
  {
    id: 'knowledge', name: 'Knowledge & PKM', targetMinimum: 20, coverageGoal: 'Popular notes and knowledge systems', examples: 'Local Markdown, Notion, Obsidian, Logseq', stage: 'planned', risk: 'moderate',
    authorization: 'Local directory grant or OAuth', dataDirection: 'Read and write selected knowledge spaces', approvalBoundary: 'Confirm destructive edits and bulk operations', firstMilestone: 'Index and search the existing local Markdown captures.', localFoundation: 'Local Markdown captures'
  },
  {
    id: 'development', name: 'Development & DevOps', targetMinimum: 60, coverageGoal: 'IDEs, repositories, CI/CD, and observability', examples: 'GitHub, GitLab, VS Code, Jenkins', stage: 'planned', risk: 'high',
    authorization: 'Fine-grained tokens, OAuth, and repository allowlists', dataDirection: 'Read code and checks; propose changes', approvalBoundary: 'Confirm pushes, merges, deployments, secrets, and destructive commands', firstMilestone: 'Read-only GitHub repository and check-status adapter.'
  },
  {
    id: 'productivity', name: 'Productivity & Project', targetMinimum: 40, coverageGoal: 'Project and task-management tools', examples: 'Jira, Linear, Asana, Trello', stage: 'planned', risk: 'moderate',
    authorization: 'OAuth with project allowlists', dataDirection: 'Read tasks; draft updates', approvalBoundary: 'Confirm assignment, status, due-date, and deletion changes', firstMilestone: 'Read-only Linear project briefing.'
  },
  {
    id: 'finance', name: 'Finance & Investment', targetMinimum: 50, coverageGoal: 'Banks, brokers, crypto, and DeFi research', examples: 'Market data, open banking, broker read APIs', stage: 'research', risk: 'critical',
    authorization: 'Read-only financial scopes and institution-specific consent', dataDirection: 'Read-only analysis by default', approvalBoundary: 'No autonomous trades or fund transfers', firstMilestone: 'Timestamped read-only market-data feed with no account access.'
  },
  {
    id: 'security', name: 'Security — All Layers', targetMinimum: 40, coverageGoal: 'Defensive digital and physical security tools', examples: 'SIEM, vulnerability management, identity monitoring', stage: 'research', risk: 'critical',
    authorization: 'Written target authorization and strict scope', dataDirection: 'Read findings; produce defensive remediation', approvalBoundary: 'No offensive action, persistence, evasion, or out-of-scope scanning', firstMilestone: 'Import and explain an existing defensive scanner report.'
  },
  {
    id: 'health-wearables', name: 'Health & Bio Wearables', targetMinimum: 35, coverageGoal: 'Wearables and approved health sensors', examples: 'Fitness watches, CGM, EEG research devices', stage: 'research', risk: 'critical',
    authorization: 'Explicit health-data consent with revocation', dataDirection: 'Read-only trends; no diagnosis', approvalBoundary: 'No clinical claims or emergency substitution', firstMilestone: 'User-selected fitness summary with clear non-medical language.'
  },
  {
    id: 'creative', name: 'Creative Tools', targetMinimum: 35, coverageGoal: 'Major design and content suites', examples: 'Adobe, Figma, Blender', stage: 'planned', risk: 'moderate',
    authorization: 'OAuth or plugin capability', dataDirection: 'Read project context; export approved assets', approvalBoundary: 'Confirm publishing, replacement, and destructive edits', firstMilestone: 'Read-only Figma file context adapter.'
  },
  {
    id: 'smart-home', name: 'Smart Home & IoT', targetMinimum: 80, coverageGoal: 'Protocols and common device types', examples: 'Home Assistant, Matter, MQTT', stage: 'research', risk: 'critical',
    authorization: 'Local gateway token and per-device allowlist', dataDirection: 'Read state; propose commands', approvalBoundary: 'Confirm locks, alarms, climate extremes, appliances, and safety-critical actions', firstMilestone: 'Read-only Home Assistant device-state dashboard.'
  },
  {
    id: 'learning', name: 'Learning & Education', targetMinimum: 30, coverageGoal: 'Learning-management and study platforms', examples: 'Canvas, Moodle, classroom tools', stage: 'planned', risk: 'moderate',
    authorization: 'OAuth and course-level scopes', dataDirection: 'Read courses; create private study materials', approvalBoundary: 'Confirm submissions, grading actions, and communications', firstMilestone: 'Read-only assignment and deadline briefing.'
  },
  {
    id: 'music', name: 'Music & Audio', targetMinimum: 25, coverageGoal: 'Music services and DAW workflows', examples: 'Spotify, Apple Music, Ableton', stage: 'planned', risk: 'moderate',
    authorization: 'OAuth or local plugin', dataDirection: 'Read playback/project state; control approved sessions', approvalBoundary: 'Confirm publishing, purchases, and destructive project edits', firstMilestone: 'Permission-scoped Spotify playback control.'
  },
  {
    id: 'media', name: 'Media & Entertainment', targetMinimum: 30, coverageGoal: 'Major media services', examples: 'Video, podcasts, libraries', stage: 'planned', risk: 'moderate',
    authorization: 'OAuth and profile-level scopes', dataDirection: 'Read libraries; control playback', approvalBoundary: 'Confirm purchases, public posts, and account changes', firstMilestone: 'Unified read-only watchlist from one provider.'
  },
  {
    id: 'transport', name: 'Transport & Mobility', targetMinimum: 20, coverageGoal: 'Maps, transit, and read-only mobility data', examples: 'Maps, public transit, vehicle telemetry', stage: 'research', risk: 'high',
    authorization: 'API keys, location consent, or OEM read scope', dataDirection: 'Read routes and status; no vehicle control', approvalBoundary: 'Confirm bookings and never control safety-critical systems', firstMilestone: 'Public-transit route and disruption adapter.'
  },
  {
    id: 'ai-platforms', name: 'AI Platforms', targetMinimum: 35, coverageGoal: 'Major model and AI service APIs', examples: 'Gemini, OpenAI-compatible, local inference', stage: 'planned', risk: 'high',
    authorization: 'Server-side provider keys and model allowlists', dataDirection: 'Send minimized request context; receive model output', approvalBoundary: 'Disclose provider use and protect sensitive context', firstMilestone: 'Provider abstraction around the existing Gemini integration.', providerDependent: true
  },
  {
    id: 'robotics', name: 'Robotics & Physical', targetMinimum: 25, coverageGoal: 'Simulation-first robotics and fabrication', examples: 'ROS, drones, 3D printing', stage: 'research', risk: 'critical',
    authorization: 'Hardware identity, operator role, and signed capability', dataDirection: 'Read telemetry before any bounded command', approvalBoundary: 'Human supervision and physical interlocks required', firstMilestone: 'Simulation-only ROS telemetry adapter.'
  },
  {
    id: 'industrial', name: 'Industrial & OT', targetMinimum: 30, coverageGoal: 'Industrial protocols through isolated gateways', examples: 'OPC UA, Modbus gateways, SCADA exports', stage: 'research', risk: 'critical',
    authorization: 'Network isolation, asset allowlist, and operator approval', dataDirection: 'Read-only historian data first', approvalBoundary: 'No direct control of production or safety systems', firstMilestone: 'Offline analysis of a sanitized historian export.'
  },
  {
    id: 'gaming-xr', name: 'Gaming & VR/AR', targetMinimum: 25, coverageGoal: 'Games, engines, and XR platforms', examples: 'Steam, Unity, Unreal, WebXR', stage: 'research', risk: 'moderate',
    authorization: 'OAuth or local SDK capability', dataDirection: 'Read session context; provide overlays', approvalBoundary: 'Confirm purchases, social posts, and account actions', firstMilestone: 'Standards-based WebXR information panel.'
  },
  {
    id: 'web-automation', name: 'Web Services & Automation', targetMinimum: 40, coverageGoal: 'Workflow automation and API services', examples: 'Zapier, Make, n8n, webhooks', stage: 'planned', risk: 'high',
    authorization: 'OAuth, signed webhooks, and least-privilege service accounts', dataDirection: 'Event and action flow defined per workflow', approvalBoundary: 'Preview consequential multi-step workflows', firstMilestone: 'Signed outbound webhook with an action preview and audit result.'
  },
  {
    id: 'enterprise', name: 'Enterprise Systems', targetMinimum: 60, coverageGoal: 'Major CRM, ERP, HR, and support platforms', examples: 'Salesforce, SAP, ServiceNow', stage: 'research', risk: 'critical',
    authorization: 'Enterprise SSO, RBAC, tenant controls, and audit policy', dataDirection: 'Read scoped records; draft controlled updates', approvalBoundary: 'Respect organizational approvals, retention, and segregation of duties', firstMilestone: 'Read-only sandbox CRM adapter.'
  },
  {
    id: 'research-science', name: 'Research & Science', targetMinimum: 30, coverageGoal: 'Research databases and scholarly services', examples: 'Crossref, PubMed, arXiv', stage: 'planned', risk: 'moderate',
    authorization: 'Public API or institution-scoped access', dataDirection: 'Retrieve metadata and sources', approvalBoundary: 'Preserve citations and licensing restrictions', firstMilestone: 'Crossref and arXiv metadata search with source export.'
  },
  {
    id: 'iot-sensors', name: 'IoT & Sensors', targetMinimum: 80, coverageGoal: 'Sensor platforms through typed adapters', examples: 'Environmental, occupancy, energy sensors', stage: 'research', risk: 'high',
    authorization: 'Gateway credentials and sensor allowlists', dataDirection: 'Read telemetry; bounded command only when approved', approvalBoundary: 'No hidden sensing or unsafe actuator control', firstMilestone: 'Read-only MQTT telemetry in an isolated test environment.'
  },
  {
    id: 'space-satellite', name: 'Space & Satellite', targetMinimum: 15, coverageGoal: 'Public satellite and orbital datasets', examples: 'Earth observation, ephemeris, space weather', stage: 'research', risk: 'moderate',
    authorization: 'Public APIs or licensed provider credentials', dataDirection: 'Read-only data retrieval', approvalBoundary: 'Show provenance, licensing, and freshness', firstMilestone: 'Public space-weather and orbital-data briefing.'
  },
  {
    id: 'bio-medical', name: 'Bio & Medical Tech', targetMinimum: 30, coverageGoal: 'Approved health-technology data APIs', examples: 'Clinical research, labs, medical devices', stage: 'research', risk: 'critical',
    authorization: 'Explicit consent, regulated access, and purpose limitation', dataDirection: 'Read-only research support', approvalBoundary: 'No diagnosis, prescribing, or autonomous medical action', firstMilestone: 'Public clinical-trial registry research adapter.'
  },
  {
    id: 'web3', name: 'Web3 & Decentralized', targetMinimum: 30, coverageGoal: 'Read-only protocol and chain intelligence', examples: 'Public chains, IPFS, governance data', stage: 'research', risk: 'critical',
    authorization: 'Public RPC or explicitly connected wallet', dataDirection: 'Read-only by default', approvalBoundary: 'No signing, transfer, swap, bridge, or contract call without explicit review', firstMilestone: 'Read-only public address explorer with risk warnings.'
  },
  {
    id: 'government', name: 'Government & Civic', targetMinimum: 20, coverageGoal: 'Public data and civic-service APIs', examples: 'Open data, legislation, public records', stage: 'planned', risk: 'high',
    authorization: 'Public API or jurisdiction-specific account', dataDirection: 'Read public information; draft forms privately', approvalBoundary: 'Confirm submissions and protect identity data', firstMilestone: 'One public open-data catalog with source timestamps.'
  },
  {
    id: 'news', name: 'News & Information', targetMinimum: 100, coverageGoal: 'Diverse, attributable news sources', examples: 'Wire services, publishers, public feeds', stage: 'planned', risk: 'moderate',
    authorization: 'Licensed APIs, RSS, or search grounding', dataDirection: 'Retrieve and synthesize with citations', approvalBoundary: 'Label freshness, source, uncertainty, and opinion', firstMilestone: 'Grounded daily briefing with viewpoint diversity checks.'
  },
  {
    id: 'environment', name: 'Environment & Climate', targetMinimum: 20, coverageGoal: 'Environmental and climate data sources', examples: 'Weather, air quality, emissions, hazards', stage: 'planned', risk: 'moderate',
    authorization: 'Public or licensed data APIs', dataDirection: 'Read-only data retrieval', approvalBoundary: 'Display location use, freshness, and uncertainty', firstMilestone: 'Weather and air-quality briefing from cited providers.'
  },
  {
    id: 'neural-bci', name: 'Neural & BCI', targetMinimum: 15, coverageGoal: 'Consumer neural-device research adapters', examples: 'EEG research devices and exported sessions', stage: 'research', risk: 'critical',
    authorization: 'Explicit session consent and device-specific controls', dataDirection: 'Offline read-only research data first', approvalBoundary: 'No hidden inference, diagnosis, or device stimulation', firstMilestone: 'Analyze a user-selected, anonymized EEG export offline.'
  },
  {
    id: 'holographic', name: 'Holographic & Spatial', targetMinimum: 10, coverageGoal: 'Spatial and volumetric display research', examples: 'WebXR, spatial displays, volumetric viewers', stage: 'research', risk: 'moderate',
    authorization: 'Device capability and session permission', dataDirection: 'Render approved visual output', approvalBoundary: 'No claim of unsupported holographic hardware', firstMilestone: 'WebXR prototype using standard browser capabilities.'
  },
  {
    id: 'building', name: 'Building & Infrastructure', targetMinimum: 20, coverageGoal: 'Facility, energy, and building-management data', examples: 'BMS, meters, facility systems', stage: 'research', risk: 'critical',
    authorization: 'Site allowlist, operator RBAC, and isolated gateway', dataDirection: 'Read-only monitoring first', approvalBoundary: 'No control of life-safety, access, elevator, or critical energy systems', firstMilestone: 'Offline analysis of a sanitized energy export.'
  },
  {
    id: 'aerospace', name: 'Space & Aerospace', targetMinimum: 10, coverageGoal: 'Public mission and aerospace data APIs', examples: 'Mission telemetry archives and aviation data', stage: 'research', risk: 'high',
    authorization: 'Public or licensed read-only sources', dataDirection: 'Read-only analysis', approvalBoundary: 'No operational command or safety-critical guidance', firstMilestone: 'Public mission-data research dashboard.'
  },
  {
    id: 'ocean-earth', name: 'Ocean & Earth Science', targetMinimum: 15, coverageGoal: 'Earth and ocean monitoring data', examples: 'Buoys, earthquakes, ocean state, geology', stage: 'planned', risk: 'moderate',
    authorization: 'Public scientific APIs', dataDirection: 'Read-only retrieval and analysis', approvalBoundary: 'Show provenance, resolution, freshness, and model uncertainty', firstMilestone: 'Public earthquake and ocean-observation briefing.'
  }
]

export function currentConnectorCount(category: EcosystemCategory, providerConnected: boolean) {
  const local = category.localFoundation ? 1 : 0
  const provider = category.providerDependent && providerConnected ? 1 : 0
  return local + provider
}

export const minimumTargetConnectors = ecosystemCategories.reduce(
  (total, category) => total + category.targetMinimum,
  0
)
