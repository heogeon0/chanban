import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Vote } from './vote.entity';
import { VoteStatus } from './enums';

@Entity('vote_history')
@Index(['voteId'])
@Index(['voteId', 'changedAt'])
export class VoteHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  voteId: string;

  @ManyToOne(() => Vote, (vote) => vote.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voteId' })
  vote: Vote;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    nullable: true,
  })
  fromStatus: VoteStatus | null;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    nullable: false,
  })
  toStatus: VoteStatus;

  @CreateDateColumn()
  changedAt: Date;
}
