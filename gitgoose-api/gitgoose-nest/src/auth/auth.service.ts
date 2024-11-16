import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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
    const { email, firstName, lastName, picture } = profile;
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = await this.userRepository.save({
        email,
        username: email.split('@')[0],
        name: `${firstName} ${lastName}`,
        password: crypto.randomBytes(16).toString('hex'),
        avatarUrl: picture,
        roles: ['user'],
        emailNotificationsEnabled: true,
        isActive: true,
        googleId: profile.id,
        publicReposCount: 0,
        privateReposCount: 0,
        followersCount: 0,
        followingCount: 0,
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      user.avatarUrl = user.avatarUrl || picture;
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
}
