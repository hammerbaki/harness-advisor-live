# Client Source Request Protocol

Policy version: 2026-05-01

## Purpose

This protocol defines how to request documents from a client when building an
investor-advisor knowledge system. The goal is to avoid the project-damaging
request pattern:

```text
Please send all related documents.
```

That request is too broad. It creates duplicate files, privacy risk,
redistribution ambiguity, unbounded ingestion work, and unverifiable model
context. Instead, every request must map to a use case, claim class, evaluation
scenario, or runtime feature.

Machine-readable template:

`configs/client-source-request-template.json`

## Request Rule

Ask for source packages, not everything.

The client should receive a bounded request such as:

```text
For the first reference slice, please provide only the documents in packages
PKG-01 to PKG-05 below, limited to the latest fiscal year, latest four quarters,
  current strategic event, and current governance baseline. For each source,
include source provenance, rights, and confidentiality labels. A direct document
URL or DART receipt URL is preferred, but an official IR source page is
acceptable when the exact download URL is dynamic or session-based.
```

## Required Packages

| Package | What to request | Why it is needed |
| --- | --- | --- |
| PKG-01 company identity and market identifiers | Listed entities, KRX tickers, DART corp codes, official IR URLs, scoped subsidiaries | Routing DART/KRX/news tools and group selector |
| PKG-02 financial disclosure baseline | Latest annual report, latest four quarterly/semiannual reports, corrected reports, DART receipt numbers | Financial, segment, and risk claims |
| PKG-03 earnings and investor presentation baseline | Latest four earnings decks, latest investor presentation, public transcripts, value-up/shareholder-return decks | Briefings, demos, and investor thesis |
| PKG-04 shareholder value and capital actions | Value-up plans, dividend policy, buybacks, preferred-share actions, spin-off/merger/restructuring materials | Capital allocation and shareholder-value claims |
| PKG-05 governance and disclosure baseline | Articles, governance charter, board rules, committee rules, disclosure policy, shareholder meeting materials | Governance-sensitive answers |
| PKG-06 market-view comparison | Analyst metadata, public report links, licensed report titles if rights are clear | External view and contradiction checks |
| PKG-07 commercial operating context | Allowed users, answer scope, prohibited topics, retention policy, source verification contact | Production deployment and compliance |

## Default Time Scope

Default request scope:

- latest fiscal year;
- latest four quarters;
- current strategic event;
- current value-up/shareholder-return documents;
- current governance baseline;
- older documents only when a named claim or longitudinal evaluation requires
  them.

This is the same logic used for Hanwha: the project did not mirror the full
official archive. It added only sources needed for the current reference slice.

## Do Not Request By Default

Do not request these unless a specific workflow has been approved:

- all emails;
- all contracts;
- all board meeting minutes;
- all shared-drive folders;
- all press clippings;
- all analyst report PDFs;
- all historical IR archives;
- employee or customer personal data;
- audio/video files without transcripts;
- duplicate scanned PDFs when public URLs exist.

## Intake Metadata

Each source must include:

| Field | Required |
| --- | --- |
| requestPackageId | yes |
| sourceTitle | yes |
| issuerOrPublisher | yes |
| sourceDateOrPeriod | yes |
| sourceType | yes |
| sourcePageUrl | yes for public issuer sources |
| publicDocumentUrl | preferred when stable |
| dartReceiptUrlOrFilingId | preferred for DART-backed documents |
| fileNameIfUploaded | when uploaded |
| localChecksumIfKnown | preferred after download |
| rightsLevel | yes |
| confidentialityLevel | yes |
| intendedClaimOrUseCase | yes |
| sourceOwner | yes for non-public sources |
| notes | optional |

Recommended `source_index.md` columns for each group folder:

```text
company | company_id | local_file | source_page_url | direct_document_url | dart_receipt_url | title | date_or_period | document_type | request_package | selection_reason | rights_level | access_date | checksum | note
```

Use `direct_document_url` only when a stable file-level URL is available. For
SPA or session-based IR sites, leave it blank and fill `source_page_url`,
`local_file`, `title`, `date_or_period`, `access_date`, and `checksum`.

## Rights Labels

Use one of these labels:

- `public-official`
- `public-third-party`
- `client-confidential-approved`
- `licensed-third-party-metadata-only`
- `restricted-do-not-ingest`

Only `public-official` and approved `client-confidential-approved` sources can
be candidates for claim-level source-backed runtime answers. Third-party
licensed materials should normally stay metadata-only.

## Client-Facing Request Text

```text
We are building a traceable investor-advisor knowledge system. Please do not
send all related documents. For the first reference slice, please provide only
the source packages listed below.

1. Company identity and market identifiers
2. Latest financial disclosure baseline
3. Latest earnings and investor presentation baseline
4. Shareholder value and capital action materials
5. Governance and disclosure baseline

Optional packages:
6. Market-view comparison materials
7. Commercial operating context

For each source, please provide title, issuer/publisher, date or covered
period, official source-page URL, direct document URL or DART filing ID when
available, local file name if uploaded, rights/confidentiality label, intended
use case, and source owner. If the issuer site uses dynamic downloads, the
official IR page plus exact document title, period, local file name, checksum,
and access date is sufficient. Older archives, emails, contracts, meeting
minutes, raw shared-drive folders, and licensed third-party PDFs should not be
sent unless we request them for a specific claim or workflow.
```

## Acceptance Criteria

A client source batch is accepted only when:

1. every source maps to a request package;
2. every source has a date or covered period;
3. every source has rights and confidentiality labels;
4. every non-public source has a source owner;
5. every public source has source provenance: direct document URL, DART filing
   URL, official source-page URL, or an explicit dynamic-download note;
6. no restricted source is ingested;
7. no source is promoted to wiki/runtime context before claim-level traceability
   is recorded.

## Research And Commercial Use

For the paper, this protocol supports reproducibility because document
selection is rule-bound rather than ad hoc. For commercialization, it prevents
scope creep and creates a professional client onboarding process.
