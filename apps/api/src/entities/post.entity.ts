import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PostTag, VoteStatus } from '@chanban/shared-types';
import { User } from './user.entity';
import { Vote } from './vote.entity';
import { Comment } from './comment.entity';

@Entity('posts')
@Index(['createdAt'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PostTag,
    nullable: false,
  })
  tag: PostTag;

  @Column({ type: 'boolean', default: false })
  showCreatorOpinion: boolean;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    nullable: true,
  })
  creatorOpinion: VoteStatus | null;

  @Column({ type: 'integer', default: 0 })
  agreeCount: number;

  @Column({ type: 'integer', default: 0 })
  disagreeCount: number;

  @Column({ type: 'integer', default: 0 })
  neutralCount: number;

  @Column({ type: 'integer', default: 0 })
  commentCount: number;

  @Index()
  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Index()
  @Column({ type: 'float', default: 0 })
  popularityScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relations
  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
