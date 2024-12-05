import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UpdateUserProfileInput } from './dto/update-user-profile.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto | CreateUserInput) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        {
          username: 'username' in createUserDto ? createUserDto.username : null,
        },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: ['user'],
      emailNotificationsEnabled: true,
      isActive: true,
      publicReposCount: 0,
      privateReposCount: 0,
      followersCount: 0,
      followingCount: 0,
    });
    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: [
        'repositories',
        'starredRepositories',
        'followers',
        'following',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateOAuthLogin(profile: any) {
    const { email, firstName, lastName, picture, id: googleId } = profile;

    // First try to find user by googleId
    let user = await this.userRepository.findOne({
      where: [
        { googleId },
        { email }, // Only check email if no user found by googleId
      ],
      relations: [
        'repositories',
        'starredRepositories',
        'followers',
        'following',
      ],
    });

    if (!user) {
      // Create new user if none exists
      user = await this.userRepository.save({
        email,
        username: email.split('@')[0],
        name: `${firstName} ${lastName}`.trim(),
        password: crypto.randomBytes(16).toString('hex'),
        avatarUrl: picture,
        roles: ['user'],
        emailNotificationsEnabled: true,
        isActive: true,
        googleId,
        publicReposCount: 0,
        privateReposCount: 0,
        followersCount: 0,
        followingCount: 0,
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID if they don't have one
      user.googleId = googleId;
      user.avatarUrl = user.avatarUrl || picture;
      user.name = user.name || `${firstName} ${lastName}`.trim();
      await this.userRepository.save(user);
    }

    const payload = { sub: user.id, email: user.email };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'repositories',
        'starredRepositories',
        'followers',
        'following',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['repositories', 'followers', 'following'],
    });
  }
  async getUserIdByEmail(email: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? user.id : null;
  }

  async updateProfile(
    userId: string,
    input: UpdateUserProfileInput,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, input);
    return await this.userRepository.save(user);
  }
}
