import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateOAuthLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const expectedResult = {
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should login a user and return token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const expectedResult = {
        access_token: 'mock.jwt.token',
        user: {
          id: '1',
          email: loginDto.email,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });
  });
});
