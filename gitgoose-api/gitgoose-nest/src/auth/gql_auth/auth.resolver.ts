import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../dto/create-user.input';
import { LoginInput } from '../dto/login.input';
import { LoginResponse } from '../dto/login-response';
import { GqlAuthGuard } from './gql_auth.guard';
import { UpdateUserProfileInput } from '../dto/update-user-profile.input';
import { CurrentUser } from '../decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.authService.register(createUserInput);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput.email, loginInput.password);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@Context() context) {
    return context.req.user;
  }

  @Query(() => User, { nullable: true })
  async userByUsername(@Args('username') username: string) {
    return this.authService.findByUsername(username);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUserProfile(
    @Args('input') input: UpdateUserProfileInput,
    @CurrentUser() user: User,
  ) {
    return this.authService.updateProfile(user.id, input);
  }
}
