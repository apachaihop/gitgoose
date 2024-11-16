import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql_auth.guard';

describe('GqlAuthGuard', () => {
  let guard: GqlAuthGuard;

  beforeEach(() => {
    guard = new GqlAuthGuard();
  });

  describe('getRequest', () => {
    it('should get request from GQL context', () => {
      const mockRequest = { headers: {} };
      const mockContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        getArgs: jest.fn().mockReturnValue([]),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };

      const gqlContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(gqlContext as any);

      const result = guard.getRequest(
        mockContext as unknown as ExecutionContext,
      );

      expect(result).toBe(mockRequest);
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(mockContext);
    });
  });
});
