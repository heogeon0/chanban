import { AppDataSource } from '../data-source';
import { TestDataSeeder } from './seeds/test-data.seeder';

/**
 * 테스트용 대량 데이터 생성 스크립트
 * 실행: npx ts-node src/database/seed-test-data.ts
 */
AppDataSource.initialize()
  .then(async () => {
    console.log('데이터베이스 연결 성공');

    const seeder = new TestDataSeeder();
    await seeder.run(AppDataSource);

    console.log('테스트 데이터 시딩 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('테스트 데이터 시딩 실패:', error);
    process.exit(1);
  });
