import { Controller, All, Param, Req, Res, Get, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GitClientService } from '../git-client/git-client.service';
import { ReposService } from '../repos/repos.service';

@Controller('git')
export class GitController {
  private readonly logger = new Logger(GitController.name);

  constructor(
    private readonly gitClientService: GitClientService,
    private readonly reposService: ReposService,
  ) {}

  @All(':owner/:repo.git/*')
  async handleGitRequest(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!this.gitClientService.isConnected()) {
        return res.status(503).send('Git service unavailable');
      }

      // Find repository by path
      const repoPath = `${owner}/${repo}`.toLowerCase();
      const repository = await this.reposService.findByPath(repoPath);

      if (!repository) {
        return res.status(404).send('Repository not found');
      }

      // For Git operations, we'll use the GitClientService which communicates via WebSocket
      const gitOperation = req.url.split('/').pop(); // Get the operation type from URL

      switch (gitOperation) {
        case 'info/refs':
          // Handle Git handshake
          const service = req.query.service as string;
          if (service === 'git-upload-pack') {
            await this.gitClientService.pull({
              repoId: repository.id,
              branch: 'main', // You might want to make this dynamic
            });
          } else if (service === 'git-receive-pack') {
            await this.gitClientService.push({
              repoId: repository.id,
              branch: 'main',
            });
          }
          break;

        case 'git-upload-pack':
        case 'git-receive-pack':
          // These would be handled by the actual Git server implementation
          // For now, we'll return a not implemented response
          return res.status(501).send('Git server implementation pending');

        default:
          return res.status(400).send('Invalid Git operation');
      }

      return res.status(200).send('Operation completed');
    } catch (error) {
      this.logger.error(`Git operation failed: ${error.message}`, error.stack);
      return res.status(500).send(`Git operation failed: ${error.message}`);
    }
  }

  @Get('health')
  async checkHealth() {
    return {
      status: this.gitClientService.isConnected() ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
