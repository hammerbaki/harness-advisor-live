# Claim Promotion Review Packet

Generated: 2026-05-07T01:56:09.619Z

## Purpose

This packet is the human-review gate between official source ingestion and runtime source-backed claims. It makes the next promotion step reproducible without allowing raw PDFs or LLM-generated summaries to enter the product automatically.

## Current Scope

- Groups: 5
- First-slice companies: 25
- Priority candidates: 25
- Alternate candidates: 50
- Missing first-slice priority candidates: 0
- Blocked/non-ready items summarized: 83

## Reviewer Workflow

1. Start from priorityCandidates. One candidate per first-slice company is enough for the first promotion pass.
2. For each candidate, open markdownPath or the official URL, then draft one atomic factual claim only.
3. Fill reviewerDecision, approvedClaimText, evidenceLocator, claimType, forwardLooking, stalenessPolicy, and reviewerNote.
4. Only after review, move approved rows into a group-specific narrative seed config and run the existing promote script.
5. Keep rejected or ambiguous rows in this packet; do not delete source records.

## Priority Candidates

| Group | Company | Source | Type | Period | Review task | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `samsung` | 삼성전자<br><code>samsung-electronics</code> | 삼성전자_2026_1Q_실적발표<br><code>samsung-local-629eb49c47b4</code> | `earnings_presentation` | 2026Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `samsung` | 삼성SDI<br><code>samsung-sdi</code> | 삼성SDI_2026_1Q_실적발표<br><code>samsung-local-3fbe76fb3e6d</code> | `earnings_presentation` | 2026Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `samsung` | 삼성물산<br><code>samsung-ct</code> | 삼성물산_2025_3Q_검토보고서_별도<br><code>samsung-local-d59eae497f33</code> | `quarterly_report` | 2025Q3 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `samsung` | 삼성바이오로직스<br><code>samsung-biologics</code> | 삼성바이오로직스_2026_1Q_실적발표<br><code>samsung-local-0c3e655da338</code> | `earnings_presentation` | 2026Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `samsung` | 삼성전기<br><code>samsung-electro-mechanics</code> | 2025_사업보고서<br><code>samsung-local-d9c2c0fbf645</code> | `business_report` | 2025 | DART/사업보고서 본문에서 재무제표 계정명, 사업부 구조, 주요 위험요인을 근거 locator와 함께 확인 | document URL |
| `sk` | SK하이닉스<br><code>sk-hynix</code> | 2025_3Q_Review_Report<br><code>sk-local-d92b4fd12117</code> | `review_report` | 2025Q3 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `sk` | SK이노베이션<br><code>sk-innovation</code> | 2025_4Q_Earnings_Release<br><code>sk-local-e4f0fa5ef4ed</code> | `earnings_presentation` | 2025Q4 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `sk` | SK<br><code>sk-inc</code> | 2026-03-182025_4Q_SK주식회사_Earnings_Briefing<br><code>sk-local-5b7e15dc9476</code> | `earnings_presentation` | 2025Q4 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `sk` | SK텔레콤<br><code>sk-telecom</code> | 2025_4Q_PressRelease_Kor<br><code>sk-local-77570239f18d</code> | `earnings_presentation` | 2025Q4 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `sk` | SK스퀘어<br><code>sk-square</code> | 2025-11-24_SK스퀘어_기업가치제고계획_2025<br><code>sk-local-a8520c7b2b32</code> | `value_up_plan` | 2025 | 주주환원, 자본배분, 포트폴리오 정책은 계획/목표/시행 여부를 구분하고 forward-looking label 부여 | document URL |
| `hyundai-motor` | 현대자동차<br><code>hyundai-motor</code> | 2025년 4분기 실적발표 자료<br><code>hyundai-local-8a594d025684</code> | `earnings_presentation` | 2026-01-23 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `hyundai-motor` | 기아<br><code>kia</code> | 2026년 1분기 경영실적<br><code>hyundai-local-3e0392d5ac42</code> | `earnings_presentation` | 2026Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | source page |
| `hyundai-motor` | 현대모비스<br><code>hyundai-mobis</code> | 2026년 1분기 경영실적<br><code>hyundai-local-14aca26a0371</code> | `earnings_presentation` | 2026-04 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `hyundai-motor` | 현대글로비스<br><code>hyundai-glovis</code> | 2026 1Q Business Result<br><code>hyundai-local-debc793368dd</code> | `earnings_presentation` | 2026-04-23 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `hyundai-motor` | 현대로템<br><code>hyundai-rotem</code> | 2025년 4분기 실적발표<br><code>hyundai-local-52e6ad6af43c</code> | `earnings_presentation` | 2026-01-30 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `lg` | LG전자<br><code>lg-electronics</code> | 2026_Q1_실적발표자료_KR<br><code>lg-local-a1e7cd3cc841</code> | `earnings_presentation` | 2026-04-29 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `lg` | LG화학<br><code>lg-chem</code> | 2026_Q1_실적발표_KR<br><code>lg-local-310be2f77733</code> | `earnings_presentation` | 2026-04-30 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `lg` | LG에너지솔루션<br><code>lg-energy-solution</code> | 2026_Q1_실적발표자료_KR<br><code>lg-local-429a8992830d</code> | `earnings_presentation` | 2026-04-30 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `lg` | LG이노텍<br><code>lg-innotek</code> | 2025_4Q Earnings Release<br><code>lg-local-41b3c43eb3a3</code> | `earnings_presentation` | 2026-01 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `lg` | LG유플러스<br><code>lg-uplus</code> | 2025_Q4_실적보고서<br><code>lg-local-a75cbda10689</code> | `earnings_presentation` | 2026-01-28 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | source page |
| `hanwha` | 한화<br><code>hanwha</code> | 2025년 4분기 실적 발표<br><code>hanwha-local-70253ef29b11</code> | `earnings_presentation` | 2025 Q4 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `hanwha` | 한화에어로스페이스<br><code>hanwha-aerospace</code> | 2026 1Q IR Presentation (국문)<br><code>hanwha-local-6340a4d368a9</code> | `earnings_presentation` | 2026 Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | source page |
| `hanwha` | 한화솔루션<br><code>hanwha-solutions</code> | 2026 1Q 실적발표<br><code>hanwha-local-4ea5a5c64929</code> | `earnings_presentation` | 2026 Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | document URL |
| `hanwha` | 한화시스템<br><code>hanwha-systems</code> | 2025 3Q 실적발표<br><code>hanwha-local-becc0f32f9b8</code> | `earnings_presentation` | 2025 Q3 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | source page |
| `hanwha` | 한화오션<br><code>hanwha-ocean</code> | 2026년 1분기 실적발표 (대본)<br><code>hanwha-local-cb1391385895</code> | `earnings_presentation` | 2026 Q1 | 기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리 | source page |

## Group Status

| Group | Candidates | Priority | Alternates | Missing priority | Blocked summary |
| --- | --- | --- | --- | --- | --- |
| `samsung` | 38 | 5 | 10 | none | none |
| `sk` | 71 | 5 | 10 | none | SK스퀘어: local_source_fallback_not_review_ready (30)<br>SK텔레콤: duplicate_local_file (10)<br>SK텔레콤: low_text_or_image_pdf (9)<br>SK: extraction_error (5)<br>SK하이닉스: duplicate_local_file (3)<br>SK하이닉스: low_text_or_image_pdf (2)<br>SK: document_url_pending (1)<br>SK: low_text_or_image_pdf (1) |
| `hyundai-motor` | 73 | 5 | 10 | none | 기아: low_text_or_image_like_pdf_requires_ocr_or_manual_review (10)<br>현대모비스: low_text_or_image_like_pdf_requires_ocr_or_manual_review (3)<br>현대자동차: low_text_or_image_like_pdf_requires_ocr_or_manual_review (2)<br>현대로템: low_text_or_image_like_pdf_requires_ocr_or_manual_review (2)<br>기아: extraction_error (1) |
| `lg` | 58 | 5 | 10 | none | LG에너지솔루션: low_text_or_image_like_pdf_requires_ocr_or_manual_review (4) |
| `hanwha` | 95 | 5 | 10 | none | none |

## Missing First-Slice Priority Candidates

All first-slice companies have at least one priority review candidate.

## Promotion Boundary

This document is not customer-facing runtime knowledge. The reviewer must turn each selected source into atomic claim text and evidence locators before a group-specific promotion script can add it to `raw/manifests/*.source-backed-claims.json`.

## Machine Artifact

- `raw/manifests/claim-promotion-review-packet.json`
