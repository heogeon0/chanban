import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { VoteHistory } from './vote-history.entity';
import { VoteStatus } from './enums';

@Entity('votes')
@Unique(['postId', 'userId'])
@Index(['postId'])
@Index(['userId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  postId: string;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    nullable: false,
  })
  currentStatus: VoteStatus;

  @Column({ type: 'integer', default: 0 })
  changeCount: number;

  @CreateDateColumn()
  firstVotedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastChangedAt: Date | null;

  // Relations
  @OneToMany(() => VoteHistory, (history) => history.vote)
  history: VoteHistory[];
}
