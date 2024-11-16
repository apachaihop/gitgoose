import { Test, TestingModule } from '@nestjs/testing';
import { GitClientService } from './git-client.service';

describe('GitClientService', () => {
  let service: GitClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitClientService],
    }).compile();

    service = module.get<GitClientService>(GitClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
