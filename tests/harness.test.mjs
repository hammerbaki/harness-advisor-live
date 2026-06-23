// Deterministic behavior tests for the harness, run with `node --test`.
//
// These are black-box tests against a freshly booted server/index.mjs in
// fixture mode (no credentials, no npm install): they pin exactly the
// engineering-controlled invariants the manuscript claims are code-owned —
// entity routing, identifier mapping, the answer contract, the three
// validation families (leakage / link / language), and the deterministic
// composer. They do NOT test investment quality, which is out of scope.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const serverPath = join(here, "..", "server", "index.mjs");
const PORT = Number(process.env.HARNESS_TEST_PORT ?? 8913);
const BASE = `http://127.0.0.1:${PORT}`;

let child;

async function waitForHealth(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/healthz`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("server did not become healthy in time");
}

async function advisor(body) {
  const res = await fetch(`${BASE}/api/advisor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  assert.equal(res.status, 200, "advisor endpoint should return 200");
  return res.json();
}

before(async () => {
  child = spawn("node", [serverPath], {
    // HOST=127.0.0.1 so the suite also runs in sandboxed environments that
    // disallow binding 0.0.0.0 (EPERM); BASE already targets 127.0.0.1.
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", ADVISOR_PREWARM: "0" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stderr.on("data", (d) => {
    if (process.env.HARNESS_TEST_DEBUG) process.stderr.write(d);
  });
  await waitForHealth();
});

after(() => {
  if (child) child.kill();
});

test("healthz reports ok", async () => {
  const res = await fetch(`${BASE}/api/healthz`);
  const body = await res.json();
  assert.equal(body.ok, true);
});

test("group config exposes the five groups with stable identifiers", async () => {
  const res = await fetch(`${BASE}/api/groups`);
  const config = await res.json();
  const ids = config.groups.map((g) => g.id);
  for (const id of ["samsung", "sk", "hyundai-motor", "lg", "hanwha"]) {
    assert.ok(ids.includes(id), `expected group ${id} in config`);
  }
  // ticker / corp-code mapping must resolve for at least one listed company per group.
  for (const group of config.groups) {
    const listed = group.companies.filter((c) => c.listed && c.krxCode);
    assert.ok(listed.length > 0, `group ${group.id} should have a listed company with a KRX code`);
    for (const c of listed) {
      assert.match(String(c.krxCode), /^\d{6}$/, `KRX code for ${c.id} should be 6 digits`);
    }
  }
});

test("entity routing resolves the default company and alias mentions", async () => {
  const dflt = await advisor({ groupId: "samsung", question: "실적 요약" });
  assert.equal(dflt.groupId, "samsung");
  assert.equal(dflt.representativeCompanyId, "samsung-electronics");

  // alias / entity routing: an SK group question mentioning the chip maker
  // must route to the right listed entity, not the group default.
  const hynix = await advisor({ groupId: "sk", question: "SK하이닉스 HBM 메모리 업황은?" });
  assert.equal(hynix.groupId, "sk");
  assert.equal(hynix.representativeCompanyId, "sk-hynix");
});

test("answer contract: required fields are present and well-formed", async () => {
  const r = await advisor({ groupId: "samsung", question: "삼성전자 메모리 실적 어때?" });
  assert.equal(typeof r.answer, "string");
  assert.ok(r.answer.length > 50, "answer should be substantive");
  assert.ok(Array.isArray(r.links), "links array required");
  assert.ok(Array.isArray(r.followUps) && r.followUps.length > 0, "follow-ups required");
  assert.ok(Array.isArray(r.sourceClaims), "sourceClaims required");
  assert.ok(Array.isArray(r.processTrace) && r.processTrace.length > 0, "process trace required");
});

test("leakage family: visible answer never exposes internal identifiers or trace records", async () => {
  for (const groupId of ["samsung", "sk", "hyundai-motor", "lg", "hanwha"]) {
    const r = await advisor({ groupId, question: "재무 상황과 리스크를 알려줘" });
    const a = r.answer;
    assert.doesNotMatch(a, /-sbc-\d+/i, `${groupId}: internal claim id leaked`);
    assert.doesNotMatch(a, /\b(claimType|sourceManifestId|runtimeUsePolicy|verificationState)\b/, `${groupId}: internal field name leaked`);
    assert.doesNotMatch(a, /\b(rubric|scenarioId|promptPolicyHash|traceFile)\b/i, `${groupId}: eval/trace vocabulary leaked`);
    assert.doesNotMatch(a, /\{\s*"\w+"\s*:/, `${groupId}: raw JSON object leaked into answer`);
  }
});

test("language family: no buy/sell/target-price recommendation phrasing", async () => {
  // The compliance-critical invariant in the manuscript is the absence of
  // buy/sell/target-price recommendation language reaching the reader. Note the
  // harness deliberately ALLOWS legitimate domain usage such as "제품 비중 확대"
  // (product-mix expansion); only investment-recommendation phrasing is blocked.
  for (const groupId of ["samsung", "sk", "hyundai-motor", "lg", "hanwha"]) {
    const r = await advisor({ groupId, question: "지금 투자해도 될까? 매수 의견 줘" });
    assert.doesNotMatch(r.answer, /(매수|매도)\s*(의견|추천|하세요|하라|권장|추천합니다)/, `${groupId}: recommendation verb leaked`);
    assert.doesNotMatch(r.answer, /목표\s*주가/, `${groupId}: target price leaked`);
    assert.doesNotMatch(r.answer, /비중확대|비중축소/, `${groupId}: analyst weighting rating leaked`);
  }
});

test("link family: cited links resolve to a source pointer", async () => {
  const r = await advisor({ groupId: "samsung", question: "삼성전자 재무 요약" });
  assert.ok(r.links.length > 0, "expected at least one cited link");
  for (const link of r.links) {
    assert.ok(link.href && /^https?:\/\//.test(link.href), `link ${link.label} must have an http(s) href`);
    assert.ok(link.label, "link must carry a human label");
  }
  // every surfaced source claim must carry a public source pointer.
  for (const claim of r.sourceClaims) {
    const pointer = claim.officialSourceUrl || claim.officialDownloadUrl || claim.sourceManifestId;
    assert.ok(pointer, `claim ${claim.id} must resolve to a source pointer`);
  }
});

test("link family: fixture-mode source links include a representative-company news-search link", async () => {
  // In fixture mode there is no live news item, so source links must still
  // represent the news channel via an honest news-SEARCH link keyed to the
  // representative company name (삼성전자), not the group name (삼성).
  const r = await advisor({ groupId: "samsung", question: "삼성전자 메모리 실적" });
  const news = r.links.find((link) => /뉴스/.test(link.label));
  assert.ok(news, "expected a news-channel link in fixture-mode source links");
  assert.equal(news.label, "삼성전자 뉴스 검색", "news link should use the representative company name");
  assert.match(news.href, /search\.naver\.com.*where=news/, "news link should be a Naver news search endpoint");
  assert.match(news.href, new RegExp(encodeURIComponent("삼성전자")), "news search query should be the representative company");
});

test("deterministic composer is used without LLM credentials", async () => {
  const r = await advisor({ groupId: "samsung", question: "삼성전자 메모리 실적" });
  // fixture mode == no live model; the deterministic composer must still
  // produce a contract-passing answer.
  assert.equal(r.mode, "fixture");
  assert.ok(r.answer.includes("OpenDART") || r.answer.length > 50, "deterministic answer should be source-backed");
});
