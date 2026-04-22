/**
 * 봇 계정 JWT 토큰 발급 스크립트
 * 사용법: JWT_SECRET=xxx node scripts/issue-bot-tokens.mjs
 *
 * 1. DB에 봇 계정이 없으면 자동 생성 (upsert)
 * 2. JWT 토큰 발급
 * 3. apps/crawler/.env 에 토큰 자동 기록
 */

import { createHmac } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_CONFIG = {
  host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '33510'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'UOFaXzxMGBJOGGDDyqmjvoKAVIwzEApo',
  database: process.env.DB_NAME || 'railway',
  ssl: { rejectUnauthorized: false },
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
const EXPIRES_IN_SECONDS = 365 * 24 * 60 * 60; // 1년

// ── 15개 봇 페르소나 정의 ──────────────────────────────
const BOT_PERSONAS = [
  // 정치 성향형 (기존 5개)
  { kakaoId: 'bot-crawler-minju',        nickname: '민주봇',    envKey: 'CHANBAN_JWT_MINJU_TOKEN' },
  { kakaoId: 'bot-crawler-gukhim',       nickname: '국힘봇',    envKey: 'CHANBAN_JWT_GUKHIM_TOKEN' },
  { kakaoId: 'bot-crawler-jungdo',       nickname: '중도봇',    envKey: 'CHANBAN_JWT_JUNGDO_TOKEN' },
  { kakaoId: 'bot-crawler-mz',           nickname: 'MZ봇',      envKey: 'CHANBAN_JWT_MZ_TOKEN' },
  { kakaoId: 'bot-crawler-elder',        nickname: '어르신봇',  envKey: 'CHANBAN_JWT_ELDER_TOKEN' },
  // 생활·직군형 (신규 10개)
  { kakaoId: 'bot-crawler-workingmom',   nickname: '워킹맘봇',  envKey: 'CHANBAN_JWT_WORKINGMOM_TOKEN' },
  { kakaoId: 'bot-crawler-selfemployed', nickname: '자영업자봇', envKey: 'CHANBAN_JWT_SELFEMPLOYED_TOKEN' },
  { kakaoId: 'bot-crawler-jobseeker',    nickname: '취준생봇',  envKey: 'CHANBAN_JWT_JOBSEEKER_TOKEN' },
  { kakaoId: 'bot-crawler-office',       nickname: '직장인봇',  envKey: 'CHANBAN_JWT_OFFICE_TOKEN' },
  { kakaoId: 'bot-crawler-doctor',       nickname: '의사봇',    envKey: 'CHANBAN_JWT_DOCTOR_TOKEN' },
  { kakaoId: 'bot-crawler-teacher',      nickname: '교사봇',    envKey: 'CHANBAN_JWT_TEACHER_TOKEN' },
  { kakaoId: 'bot-crawler-farmer',       nickname: '농부봇',    envKey: 'CHANBAN_JWT_FARMER_TOKEN' },
  { kakaoId: 'bot-crawler-investor',     nickname: '투자자봇',  envKey: 'CHANBAN_JWT_INVESTOR_TOKEN' },
  { kakaoId: 'bot-crawler-student',      nickname: '대학생봇',  envKey: 'CHANBAN_JWT_STUDENT_TOKEN' },
  { kakaoId: 'bot-crawler-retiree',      nickname: '은퇴자봇',  envKey: 'CHANBAN_JWT_RETIREE_TOKEN' },
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

// ── .env 파일 업데이트 유틸 ──────────────────────────
function updateEnvFile(envPath, updates) {
  let content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${value}`;
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content += `\n${line}`;
    }
  }

  writeFileSync(envPath, content.trim() + '\n', 'utf-8');
}

// ── 메인 ──────────────────────────────────────────────
const { Client } = pg;
const client = new Client(DB_CONFIG);

await client.connect();

const now = Math.floor(Date.now() / 1000);
const envUpdates = {};

console.log('=== 봇 계정 upsert + JWT 토큰 발급 ===\n');

for (const persona of BOT_PERSONAS) {
  // 계정이 없으면 자동 생성 (upsert)
  await client.query(
    `INSERT INTO users ("kakaoId", nickname, "profileImageUrl")
     VALUES ($1, $2, NULL)
     ON CONFLICT ("kakaoId") DO NOTHING`,
    [persona.kakaoId, persona.nickname],
  );

  const res = await client.query(
    'SELECT id, "kakaoId", nickname FROM users WHERE "kakaoId" = $1',
    [persona.kakaoId],
  );

  if (res.rows.length === 0) {
    console.log(`[ERROR] ${persona.kakaoId} — 생성/조회 실패`);
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

  envUpdates[persona.envKey] = token;
  console.log(`[OK] ${persona.nickname} (${persona.kakaoId})`);
}

await client.end();

// apps/crawler/.env 에 토큰 기록
const crawlerEnvPath = path.resolve(__dirname, '../../crawler/.env');
updateEnvFile(crawlerEnvPath, envUpdates);

console.log(`\n✅ ${Object.keys(envUpdates).length}개 토큰을 ${crawlerEnvPath} 에 기록했습니다.`);
