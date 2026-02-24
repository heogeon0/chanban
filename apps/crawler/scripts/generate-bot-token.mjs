/**
 * 크롤러 봇 계정용 JWT 토큰 생성 스크립트
 *
 * 사용법:
 *   1. 먼저 배포 DB에 아래 SQL을 실행하여 봇 유저를 생성한다:
 *
 *      INSERT INTO users (id, "kakaoId", nickname, "profileImageUrl", "createdAt", "updatedAt")
 *      VALUES (
 *        gen_random_uuid(),
 *        'bot-crawler-001',
 *        '찬반뉴스봇',
 *        NULL,
 *        NOW(),
 *        NOW()
 *      );
 *
 *   2. 생성된 유저의 id를 확인한다:
 *      SELECT id FROM users WHERE "kakaoId" = 'bot-crawler-001';
 *
 *   3. 이 스크립트를 실행한다:
 *      node scripts/generate-bot-token.mjs <user-id> <jwt-secret>
 *
 *   4. 출력된 토큰을 apps/crawler/.env 의 CHANBAN_JWT_TOKEN에 넣는다.
 */

import { createHmac } from 'node:crypto';

const [userId, kakaoId, nickname, jwtSecret] = process.argv.slice(2);

if (!userId || !kakaoId || !nickname || !jwtSecret) {
  console.error('Usage: node scripts/generate-bot-token.mjs <user-id> <kakao-id> <nickname> <jwt-secret>');
  console.error('Example: node scripts/generate-bot-token.mjs abc-123 bot-crawler-001 찬반뉴스봇 my-secret-key');
  process.exit(1);
}

function base64url(data) {
  return Buffer.from(data).toString('base64url');
}

const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

const now = Math.floor(Date.now() / 1000);
const payload = base64url(JSON.stringify({
  sub: userId,
  kakaoId,
  nickname,
  iat: now,
  exp: now + 365 * 24 * 60 * 60, // 1년
}));

const signature = createHmac('sha256', jwtSecret)
  .update(`${header}.${payload}`)
  .digest('base64url');

const token = `${header}.${payload}.${signature}`;

console.log('\n=== 크롤러 봇 JWT 토큰 ===\n');
console.log(token);
console.log('\n이 토큰을 apps/crawler/.env 의 CHANBAN_JWT_TOKEN 에 넣으세요.');
console.log(`만료: ${new Date((now + 365 * 24 * 60 * 60) * 1000).toISOString()}\n`);
