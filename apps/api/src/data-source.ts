import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Vote } from './entities/vote.entity';
import { VoteHistory } from './entities/vote-history.entity';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { MainSeeder } from './database/seeds/main.seeder';

// .env 파일 로드
config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'chanban',
  entities: [User, Post, Vote, VoteHistory, Comment, CommentLike],
  synchronize: true, // 테이블 자동 생성
  logging: true,

  // Seeding 설정
  seeds: [MainSeeder],
  factories: [],
};

export const AppDataSource = new DataSource(options);
