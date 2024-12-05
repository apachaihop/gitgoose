import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Repo } from '../../repos/entities/repo.entity';

@ObjectType()
@Entity()
export class Issue {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  body: string;

  @Field()
  @Column()
  number: number;

  @Field()
  @Column({ default: 'open' })
  state: string;

  @Field(() => User)
  @ManyToOne(() => User)
  author: User;

  @Field()
  @Column()
  authorId: string;

  @Field(() => Repo)
  @ManyToOne(() => Repo, (repo) => repo.issues)
  repository: Repo;

  @Field()
  @Column()
  repositoryId: string;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: 'issue_assignees',
    joinColumn: { name: 'issue_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignees: User[];

  @Field(() => [String])
  @Column('simple-array', { default: '' })
  labels: string[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  closedAt: Date;
}
