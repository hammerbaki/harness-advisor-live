export interface ParentRouting {
  displayName: string;
  dartCode: string;
}

export interface CompanyProfile {
  id: string;
  displayName: string;
  koreanName: string;
  listed: boolean;
  krxCode: string;
  yahooTicker: string;
  dartCode: string;
  aliases: string[];
  parentRouting?: ParentRouting;
}

export interface GroupMigration {
  reuseAsIs: string[];
  reuseWithRefactor: string[];
  rewrite: string[];
  archive: string[];
}

export interface WikiSeed {
  overview: string;
  openQuestions: string[];
  stalenessPolicy: string;
}

export interface LogoAsset {
  src: string;
  label: string;
  slot: "wide" | "compact" | "square";
  source: string;
  licenseNote: string;
}

export interface GroupProfile {
  id: string;
  displayName: string;
  koreanName: string;
  displayOrder: number;
  ftcAssetRank2025: number;
  selectorNote: string;
  logoAsset: LogoAsset;
  country: string;
  wikiNamespace: string;
  status: "reference-slice" | "source-ready" | "planned";
  sourceStatus: string;
  researchRole: string;
  advisorPositioning: string;
  defaultCompanyId: string;
  companies: CompanyProfile[];
  migration?: GroupMigration;
  wikiSeed?: WikiSeed;
}

export interface GroupsConfig {
  schemaVersion: string;
  notes: string[];
  groups: GroupProfile[];
}

export interface ValidationResult {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface AdvisorLink {
  label: string;
  href: string;
  source: string;
}

export interface AdvisorTrace {
  label: string;
  status: "live" | "fixture" | "fallback" | "local" | "error";
  source?: string;
  elapsedMs: number;
  summary: string;
}

export interface AdvisorAssemblyStep {
  id: string;
  title: string;
  owner: "code" | "source" | "wiki" | "llm";
  status: "pass" | "warn" | "fail";
  summary: string;
  inputs: string[];
  outputs: string[];
}

export interface AdvisorTraceEnvelope {
  schemaVersion: string;
  runId: string;
  generatedAt: string;
  runtimeMode: "live" | "fixture" | "fallback" | "mixed" | "degraded";
  presentationMode: "text" | "briefing";
  groupId: string;
  representativeCompanyId?: string;
  questionHash: string;
  promptPolicyHash: string;
  promptPolicyVersion: string;
  llmMode: string;
  llmOutputContractVersion: string;
  llmOutputContractStatus: "validated" | "fallback" | "code" | "unknown";
  statusCounts: Record<string, number>;
  elapsedMs: number;
  reproducibility: {
    configSchemaVersion: string;
    wikiNamespace: string;
    wikiContextVersion: string;
    sourceStatus: string;
    toolOrder: string[];
  };
}

export interface AdvisorSourceClaim {
  id: string;
  claimText: string;
  claimType: string;
  sourceManifestId: string;
  sourceTitle: string;
  runtimeUsePolicy: string;
  verificationState: string;
  officialSourceUrl?: string;
  officialDownloadUrl?: string;
}

export interface AdvisorResponse {
  groupId: string;
  representativeCompanyId?: string;
  question: string;
  mode: string;
  trace: AdvisorTraceEnvelope;
  answer: string;
  links: AdvisorLink[];
  followUps: string[];
  sourceClaims: AdvisorSourceClaim[];
  processTrace: AdvisorTrace[];
  answerAssembly: AdvisorAssemblyStep[];
  traceExportUrl?: string;
  traceArtifactPath?: string;
  elapsedMs: number;
}
