import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'chanban',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // TODO: 프로덕션 테이블 생성 후 process.env.NODE_ENV !== 'production'으로 복원
    logging: process.env.NODE_ENV === 'development',
  }),
);
