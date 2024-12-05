// src/repos/language-analyzer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GitClientService } from '../git-client/git-client.service';
import * as path from 'path';

@Injectable()
export class LanguageAnalyzerService {
  private readonly logger = new Logger(LanguageAnalyzerService.name);

  // Language extensions mapping
  private readonly languageExtensions = {
    js: 'JavaScript',
    jsx: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    py: 'Python',
    java: 'Java',
    rb: 'Ruby',
    php: 'PHP',
    go: 'Go',
    rs: 'Rust',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    md: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    // Add more languages as needed
  };

  constructor(private readonly gitClientService: GitClientService) {}

  async analyzeRepository(
    repoId: string,
    branch?: string,
  ): Promise<{ [key: string]: number }> {
    try {
      const files = await this.gitClientService.getFileTree({
        repoId,
        ref: branch,
      });

      const languageBytes: { [key: string]: number } = {};

      // Process each file
      for (const file of files) {
        if (file.type === 'file') {
          try {
            // Get file content to calculate size
            const content = await this.gitClientService.getFileContent({
              repoId,
              path: file.path,
              ref: branch,
            });

            const extension = path.extname(file.path).toLowerCase().slice(1);
            const language = this.languageExtensions[extension];

            // Calculate size from content length in bytes
            const sizeInBytes = Math.floor(Buffer.from(content).length);

            if (language && sizeInBytes) {
              languageBytes[language] =
                (languageBytes[language] || 0) + sizeInBytes;
            }
          } catch (error) {
            this.logger.warn(
              `Failed to get content for file ${file.path}: ${error.message}`,
            );
            continue; // Skip this file and continue with others
          }
        }
      }

      // If no files with recognized languages were found, return empty stats
      const totalBytes = Object.values(languageBytes).reduce(
        (a, b) => a + b,
        0,
      );
      if (totalBytes === 0) {
        return {};
      }

      // Convert bytes to percentages
      const languageStats: { [key: string]: number } = {};
      for (const [language, bytes] of Object.entries(languageBytes)) {
        languageStats[language] = Number(
          ((bytes / totalBytes) * 100).toFixed(1),
        );
      }

      return languageStats;
    } catch (error) {
      this.logger.error(
        `Failed to analyze repository languages: ${error.message}`,
      );
      throw error;
    }
  }
}
