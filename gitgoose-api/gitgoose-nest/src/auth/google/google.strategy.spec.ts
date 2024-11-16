import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google-oauth.strategy';
import { AuthService } from '../auth.service';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'GOOGLE_CLIENT_ID':
          return 'test-client-id';
        case 'GOOGLE_CLIENT_SECRET':
          return 'test-client-secret';
        case 'GOOGLE_CALLBACK_URL':
          return 'http://localhost:3000/auth/google/callback';
        default:
          return null;
      }
    }),
  };

  const mockAuthService = {
    validateOAuthLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should call validateOAuthLogin with Google profile', async () => {
      const mockProfile = {
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
      };

      mockAuthService.validateOAuthLogin.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
      });

      const result = await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
      );

      expect(mockAuthService.validateOAuthLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        displayName: 'Test User',
      });
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });
  });
});
