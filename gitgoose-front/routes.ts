// API Routes & Types Documentation

/**
 * HTTP Routes (REST API)
 */
export const HTTP_ROUTES = {
    AUTH: {
      REGISTER: {
        path: '/auth/register',
        method: 'POST',
        dto: {
          email: 'string',
          password: 'string',
          name: 'string'
        }
      },
      LOGIN: {
        path: '/auth/login',
        method: 'POST',
        dto: {
          email: 'string',
          password: 'string'
        }
      },
      PROFILE: {
        path: '/auth/profile',
        method: 'GET',
        auth: true
      },
      GOOGLE: {
        AUTH: {
          path: '/auth/google',
          method: 'GET'
        },
        CALLBACK: {
          path: '/auth/google/redirect',
          method: 'GET'
        }
      }
    }
  };
  
  /**
   * GraphQL Routes
   */
  export const GRAPHQL_ROUTES = {
    // Authentication
    AUTH: {
      ME: {
        type: 'Query',
        auth: true,
        returns: 'User',
        example: `
          query Me {
            me {
              id
              email
              name
            }
          }
        `
      }
    },
  
    // Repository Operations
    REPOS: {
      CREATE: {
        type: 'Mutation',
        auth: true,
        input: 'CreateRepoInput',
        returns: 'Repo',
        example: `
          mutation CreateRepo($input: CreateRepoInput!) {
            createRepo(createRepoInput: $input) {
              id
              name
              description
              isPrivate
              defaultBranch
            }
          }
        `
      },
      GET_ALL: {
        type: 'Query',
        auth: true,
        returns: '[Repo]',
        example: `
          query GetRepos {
            repos {
              id
              name
              description
              owner { id name }
            }
          }
        `
      },
      UPLOAD_FILES: {
        type: 'Mutation',
        auth: true,
        input: 'UploadFilesInput',
        returns: 'Commit',
        example: `
          mutation UploadFiles($input: UploadFilesInput!) {
            uploadFiles(input: $input) {
              sha
              message
              authorName
            }
          }
        `
      }
    },
  
    // File Operations
    FILES: {
      GET_TREE: {
        type: 'Query',
        auth: true,
        input: 'FileTreeRequestDto',
        returns: '[FileTreeItem]',
        example: `
          query GetFileTree($input: FileTreeRequestDto!) {
            getRepositoryFiles(
              repositoryId: $input.repoId,
              ref: $input.ref,
              path: $input.path
            ) {
              path
              type
              content
              size
            }
          }
        `
      },
      GET_CONTENT: {
        type: 'Query',
        auth: true,
        input: 'FileTreeRequestDto',
        returns: 'String',
        example: `
          query GetFileContent(
            $repositoryId: String!,
            $path: String!,
            $ref: String
          ) {
            getFileContent(
              repositoryId: $repositoryId,
              path: $path,
              ref: $ref
            )
          }
        `
      }
    },
  
    // Pull Request Operations
    PULL_REQUESTS: {
      CREATE: {
        type: 'Mutation',
        auth: true,
        input: 'CreatePullRequestInput',
        returns: 'PullRequest',
        example: `
          mutation CreatePR($input: CreatePullRequestInput!) {
            createPullRequest(createPullRequestInput: $input) {
              id
              title
              sourceBranch
              targetBranch
            }
          }
        `
      },
      MERGE: {
        type: 'Mutation',
        auth: true,
        returns: 'PullRequest',
        example: `
          mutation MergePR($id: ID!) {
            mergePullRequest(id: $id) {
              id
              state
              mergedAt
            }
          }
        `
      }
    }
  };
  
  /**
   * Input Types (DTOs)
   */
  export const INPUT_TYPES = {
    CreateRepoInput: {
      name: 'string',
      description: 'string?',
      isPrivate: 'boolean',
      defaultBranch: 'string'
    },
  
    FileTreeRequestDto: {
      repoId: 'string',
      ref: 'string?', // branch name or commit SHA
      path: 'string?' // optional path to get specific directory/file
    },
  
    CreatePullRequestInput: {
      title: 'string',
      body: 'string',
      sourceBranch: 'string',
      targetBranch: 'string',
      repositoryId: 'string',
      reviewerIds: 'string[]?'
    },
  
    UploadFilesInput: {
      repositoryId: 'string',
      branch: 'string',
      commitMessage: 'string',
      files: 'FileUpload[]'
    },
  
    FileUpload: {
      filename: 'string',
      mimetype: 'string',
      encoding: 'string',
      createReadStream: '() => Stream'
    }
  };
  
  /**
   * Response Types
   */
  export const RESPONSE_TYPES = {
    LoginResponse: {
      access_token: 'string',
      user: {
        id: 'string',
        email: 'string',
        name: 'string'
      }
    },
  
    FileTreeItem: {
      path: 'string',
      type: '"file" | "directory"',
      content: 'string?',
      size: 'number?'
    }
  };
  
  /**
   * Authentication
   */
  export const AUTH_INFO = {
    JWT: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      obtainedFrom: [
        '/auth/login (HTTP)',
        '/auth/google/redirect (OAuth)',
      ]
    },
    Guards: {
      HTTP: 'JwtAuthGuard',
      GraphQL: 'GqlAuthGuard',
      OAuth: 'GoogleOAuthGuard'
    }
  };