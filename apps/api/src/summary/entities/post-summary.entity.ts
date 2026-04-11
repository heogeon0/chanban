import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Post } from '../../entities/post.entity';

@Entity('post_summaries')
export class PostSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', unique: true, nullable: false })
  postId: string;

  @OneToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'text', nullable: true })
  contentSummary: string | null;

  @Column({ type: 'text', nullable: true })
  voteSummary: string | null;

  @Column({ type: 'text', nullable: true })
  agreeSummary: string | null;

  @Column({ type: 'text', nullable: true })
  disagreeSummary: string | null;

  /** 마지막 commentSummary/voteSummary 생성 시점의 댓글 수 */
  @Column({ type: 'integer', default: 0 })
  commentCountAtGeneration: number;

  @UpdateDateColumn()
  generatedAt: Date;
}
