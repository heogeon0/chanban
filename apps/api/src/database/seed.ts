import { AppDataSource } from '../data-source';
import { runSeeders } from 'typeorm-extension';

AppDataSource.initialize()
  .then(async () => {
    console.log('데이터베이스 연결 성공');

    await runSeeders(AppDataSource);

    console.log('시딩 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('시딩 실패:', error);
    process.exit(1);
  });
