# Traceable Demo Architecture

Implementation date: 2026-04-30

## Purpose

The demo must serve three roles at once:

- paper artifact for arXiv and later SCI submission;
- sales demo for real clients;
- operational prototype whose future client usage can become empirical evidence.

For that reason, every answer must carry a machine-readable trace envelope. The
UI may remain simple, but the API response must preserve enough metadata to
distinguish fixture, fallback, and live execution.

## Response Contract

`POST /api/advisor` returns:

```json
{
  "groupId": "hanwha",
  "question": "한화 최근 투자 포인트를 공시와 뉴스 기준으로 요약해줘",
  "mode": "fixture",
  "trace": {
    "schemaVersion": "advisor-trace.v0.1",
    "runId": "run_<uuid>",
    "generatedAt": "2026-04-30T00:00:00.000Z",
    "runtimeMode": "mixed",
    "presentationMode": "text",
    "groupId": "hanwha",
    "representativeCompanyId": "hanwha",
    "questionHash": "<sha256>",
    "promptPolicyHash": "<sha256>",
    "promptPolicyVersion": "prompt-policy.v0.1",
    "llmMode": "fixture",
    "llmOutputContractVersion": "advisor-llm-output-contract.v0.1",
    "llmOutputContractStatus": "code",
    "statusCounts": {
      "fixture": 3,
      "fallback": 1,
      "local": 2
    },
    "elapsedMs": 320,
    "reproducibility": {
      "configSchemaVersion": "0.2.0",
      "wikiNamespace": "groups/hanwha",
      "wikiContextVersion": "wiki-context.v0.1",
      "sourceStatus": "poc-extracted",
      "toolOrder": [
        "dart.disclosures",
        "krx.market",
        "news.search",
        "wiki.context",
        "claims.sourceBacked",
        "llm.compose"
      ]
    }
  },
  "sourceClaims": [
    {
      "id": "hanwha-sbc-001",
      "claimText": "2025년 연결 기준 매출액은...",
      "claimType": "financial_metric",
      "sourceManifestId": "hanwha-local-70253ef29b11",
      "sourceTitle": "(주)한화_4Q25 Earnings(연결)",
      "runtimeUsePolicy": "eligible_for_bounded_context",
      "verificationState": "source_backed_seed",
      "officialSourceUrl": "https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do",
      "officialDownloadUrl": "https://www.hanwhacorp.co.kr/common/fileDownload.do?..."
    }
  ],
  "processTrace": []
}
```

The neutral UI default is Samsung because it is the first selected target in
the investor-facing order. Hanwha is still the reference slice: its source
manifests, wiki pages, validators, and short prompt policies are the complete
vertical slice used to prove the reconstruction method before Samsung, SK,
Hyundai Motor, and LG are fully populated.

## Runtime Modes

```text
live      All external tools and LLM path are live.
fallback  No fixture is used, but at least one substitute source is used.
mixed     At least one live/fallback path and at least one fixture path are used.
fixture   All paths are deterministic fixtures.
degraded  At least one step returned an error fallback.
```

## Why Hashes Are Used

The trace stores `questionHash` and `promptPolicyHash`, not raw private prompt
internals. The raw question is already present in the response for the active
demo turn, but the hash makes future persisted logs easier to anonymize.

## UI Rule

The mobile UI must visibly show the runtime mode and compact run metadata after
an answer. This prevents screenshots from accidentally implying that a fixture
run was a fully live production run.

The commercial default is `presentationMode: text`. Voice is treated as a
meeting/demo presentation layer, exposed through `presentationMode: briefing`,
not as the default advisor interaction.

## Source-Backed Claim Rule

For the Hanwha reference slice, `claims.sourceBacked` loads
`raw/manifests/hanwha.source-backed-claims.json` and selects only relevant
claims for the current question. These claims are shown separately from generic
links because they are the first paper-grade bridge between raw official IR
sources, the LLM Wiki, and runtime answers.

Groups without a source-backed claim manifest should return an empty
`sourceClaims` array. That is acceptable for seed-unverified profiles, but not
for paper-ready coverage.

## Next Hardening Steps

- persist trace envelopes to an append-only evaluation log;
- add downloadable JSON trace export for paper artifacts;
- add input/output redaction before any client operation logs are retained;
- add provider/version fields for Replit LLM, Anthropic/OpenAI fallback, and
  ElevenLabs TTS;
- add latency/cost fields once live credentials are connected.
