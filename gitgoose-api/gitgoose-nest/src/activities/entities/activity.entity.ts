import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Repo } from '../../repos/entities/repo.entity';
import { ActivityType } from '../enums/activity-type.enum';

@ObjectType()
@Entity()
export class Activity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ActivityType)
  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Field()
  @Column()
  description: string;

  @Field()
  @CreateDateColumn()
  timestamp: Date;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: string;

  @Field(() => Repo)
  @ManyToOne(() => Repo, { nullable: false })
  @JoinColumn({ name: 'repositoryId' })
  repository: Repo;

  @Column({ nullable: false })
  repositoryId: string;
}
