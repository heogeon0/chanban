import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import databaseConfig from './config/database.config';
import supabaseConfig from './config/supabase.config';
import { PostModule } from './post/post.module';
import { SummaryModule } from './summary/summary.module';
import { UserModule } from './user/user.module';
import { VoteModule } from './vote/vote.module';
import { FollowModule } from './follow/follow.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, supabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
    }),
    PostModule,
    CommentModule,
    VoteModule,
    AuthModule,
    UserModule,
    FollowModule,
    SummaryModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
