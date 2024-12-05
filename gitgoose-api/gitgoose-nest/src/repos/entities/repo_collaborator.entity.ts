import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Repo } from './repo.entity';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
@Entity()
export class RepoCollaborator {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  permission: 'read' | 'write' | 'admin';

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Repo, (repo) => repo.collaborators)
  repository: Repo;

  @Column()
  repositoryId: string;
}
