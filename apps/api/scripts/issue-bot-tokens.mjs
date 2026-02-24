/**
 * 봇 계정 JWT 토큰 발급 스크립트
 * 사용법: node scripts/issue-bot-tokens.mjs
 *
 * DB에서 bot-crawler-* 유저를 조회하고 JWT 토큰을 발급합니다.
 */

import { createHmac } from 'crypto';
import pg from 'pg';

// ── 설정 ──────────────────────────────────────────────
const DB_CONFIG = {
  host: 'metro.proxy.rlwy.net',
  port: 33510,
  user: 'postgres',
  password: 'UOFaXzxMGBJOGGDDyqmjvoKAVIwzEApo',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
};

const JWT_SECRET = 'your-jwt-secret-key-change-this-in-production';
const EXPIRES_IN_SECONDS = 365 * 24 * 60 * 60; // 1년

// 봇 카카오 ID 목록 (DB에 이미 생성된 것들)
const BOT_KAKAO_IDS = [
  'bot-crawler-001',
  'bot-crawler-002',
  'bot-crawler-003',
  'bot-crawler-004',
  'bot-crawler-005',
];

// ── JWT 유틸 ──────────────────────────────────────────
function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function signJWT(payload) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body = base64url(payload);
  const sig = createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${header}.${body}.${sig}`;
}

// ── 메인 ──────────────────────────────────────────────
const { Client } = pg;
const client = new Client(DB_CONFIG);

await client.connect();

const now = Math.floor(Date.now() / 1000);

console.log('=== 봇 계정 JWT 토큰 발급 ===\n');

for (const kakaoId of BOT_KAKAO_IDS) {
  const res = await client.query(
    'SELECT id, "kakaoId", nickname FROM users WHERE "kakaoId" = $1',
    [kakaoId],
  );

  if (res.rows.length === 0) {
    console.log(`[SKIP] ${kakaoId} — DB에 없음`);
    continue;
  }

  const user = res.rows[0];
  const token = signJWT({
    sub: user.id,
    kakaoId: user.kakaoId,
    nickname: user.nickname,
    iat: now,
    exp: now + EXPIRES_IN_SECONDS,
  });

  console.log(`[${kakaoId}] nickname: ${user.nickname}`);
  console.log(`  UUID  : ${user.id}`);
  console.log(`  TOKEN : ${token}`);
  console.log();
}

await client.end();
