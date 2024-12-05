import { Controller, All, Param, Req, Res, Get, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GitClientService } from '../git-client/git-client.service';
import { ReposService } from '../repos/repos.service';
import * as gitBackend from 'git-http-backend';

@Controller()
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
      this.logger.debug(`Git request received for ${owner}/${repo}`);

      // Set Git protocol headers
      res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');

      if (!this.gitClientService.isConnected()) {
        this.logger.error('Git service unavailable');
        return res.status(503).send('Git service unavailable');
      }

      const repoPath = `${owner}/${repo}`;
      const repository = await this.reposService.findByPath(repoPath);

      if (!repository) {
        this.logger.error(`Repository not found: ${repoPath}`);
        return res.status(404).send('Repository not found');
      }

      // Handle Git info/discovery phase
      if (req.url.includes('/info/refs')) {
        const service = req.query.service as string;
        this.logger.debug(`Git service requested: ${service}`);

        if (!service) {
          return res.status(400).send('Service parameter required');
        }

        if (service === 'git-upload-pack') {
          try {
            const branches = await this.gitClientService.getBranches(
              repository.id,
            );

            // Find the default branch (usually 'main')
            const defaultBranch = Array.isArray(branches)
              ? branches.find((branch) => branch.name === 'main') || branches[0]
              : undefined;

            if (!defaultBranch) {
              throw new Error('No branches found in repository');
            }

            // Format packets
            const packets: string[] = [];
            packets.push('# service=git-upload-pack\n');
            packets.push('');

            // First, send HEAD symbolic ref
            packets.push(
              `${defaultBranch.sha} HEAD\0multi_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed allow-tip-sha1-in-want allow-reachable-sha1-in-want no-done symref=HEAD:refs/heads/${defaultBranch.name}\n`,
            );

            // Then send all branch refs
            if (Array.isArray(branches)) {
              for (const branch of branches) {
                packets.push(`${branch.sha} refs/heads/${branch.name}\n`);
              }
            }

            // Format and send packets
            const formattedResponse = packets
              .map((packet) => {
                if (packet === '') return '0000';
                const length = (packet.length + 4)
                  .toString(16)
                  .padStart(4, '0');
                return `${length}${packet}`;
              })
              .join('');

            this.logger.debug(
              `Sending formatted response: ${formattedResponse}`,
            );

            // Set content type for service advertisement
            res.setHeader(
              'Content-Type',
              `application/x-${service}-advertisement`,
            );
            res.write(formattedResponse);
            res.write('0000');
            return res.end();
          } catch (error) {
            this.logger.error(
              `Failed to handle git-upload-pack: ${error.message}`,
            );
            return res
              .status(500)
              .send(`Git operation failed: ${error.message}`);
          }
        }
      } else if (req.url.split('/').pop() === 'git-upload-pack') {
        // Handle the actual clone/fetch operation
        this.logger.debug('Handling git-upload-pack');

        const body = await new Promise<string>((resolve) => {
          let data = '';
          req.on('data', (chunk) => {
            data += chunk.toString();
            this.logger.debug(`Received chunk: ${chunk.toString()}`);
          });
          req.on('end', () => resolve(data));
        });

        // Parse wants and verify objects exist
        const wants = body
          .split('\n')
          .filter((line) => line.startsWith('0032want '))
          .map((line) => line.substring(9, 49));

        this.logger.debug(`Parsed wants: ${JSON.stringify(wants)}`);

        try {
          const packData = await this.gitClientService.generatePackFile(
            repository.id,
            wants,
          );

          // Set response headers
          res.setHeader('Content-Type', 'application/x-git-upload-pack-result');
          res.setHeader('Cache-Control', 'no-cache');

          // Write NAK
          res.write(Buffer.from('0008NAK\n'));

          // Write packfile with side-band
          const sideband = Buffer.from([1]); // 0x01 for packfile data
          const length = (packData.length + 5).toString(16).padStart(4, '0');
          res.write(Buffer.from(length));
          res.write(Buffer.concat([sideband, packData]));

          // End response
          res.write(Buffer.from('0000'));
          return res.end();
        } catch (error) {
          this.logger.error(`Failed to generate packfile: ${error.message}`);
          return res.status(500).send(`Git operation failed: ${error.message}`);
        }
      }

      return res.status(400).send('Invalid Git operation');
    } catch (error) {
      this.logger.error(`Git operation failed: ${error.message}`, error.stack);
      return res.status(500).send(`Git operation failed: ${error.message}`);
    }
  }

  @Get('health')
  async checkHealth() {
    const status = this.gitClientService.isConnected() ? 'up' : 'down';
    this.logger.log(`Health check: ${status}`);
    return {
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
