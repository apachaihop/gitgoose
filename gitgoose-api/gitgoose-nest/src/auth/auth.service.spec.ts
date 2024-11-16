import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        name: 'Test User',
      };

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const mockUser: Partial<User> = {
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        name: createUserDto.name,
        password: hashedPassword,
        repositories: [],
        starredRepositories: [],
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result).not.toHaveProperty('password');
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        name: 'Test User',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        email: createUserDto.email,
      });

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser: Partial<User> = {
        id: '1',
        email: loginDto.email,
        username: 'testuser',
        password: hashedPassword,
        repositories: [],
        starredRepositories: [],
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock.jwt.token');

      const result = await service.login(loginDto.email, loginDto.password);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser: Partial<User> = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
