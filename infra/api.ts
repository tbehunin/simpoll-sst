import { table } from './storage';
import { userPool, userPoolClient } from './auth';

const region = aws.getRegionOutput().name;

// Create the API
export const api = new sst.aws.ApiGatewayV2('Api', {
  transform: {
    route: {
      handler: {
        link: [table],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

// Create the GraphQL API
const stage = $app.stage;

// Shared stages require authentication, personal sandbox stages (username stages) don't
const SHARED_STAGES = ['dev', 'staging', 'production'];
const isPersonalSandbox = !SHARED_STAGES.includes(stage);

export const graphql = new sst.aws.ApiGatewayV2('GraphQL', {
  transform: {
    route: {
      handler: {
        link: [table, userPool, userPoolClient],
        environment: {
          SST_STAGE: stage,
          IS_LOCAL: isPersonalSandbox ? 'true' : 'false',
          USER_POOL_ID: userPool.id,
          USER_POOL_CLIENT_ID: userPoolClient.id,
          // Personal sandbox stages get DEV_USER_ID for easy testing
          ...(isPersonalSandbox && { DEV_USER_ID: process.env.DEV_USER_ID || 'user1' }),
        },
      },
    }
  }
});
graphql.route('POST /graphql', 'packages/functions/src/graphql/handler.main');
graphql.route('GET /graphql', 'packages/functions/src/graphql/handler.main');

// Auth test page - available in personal sandboxes and shared dev (for getting tokens)
if (isPersonalSandbox || stage === 'dev') {
  graphql.route('GET /auth-test', {
    handler: 'packages/functions/src/auth-test/handler.main',
    link: [],
    environment: {
      USER_POOL_ID: userPool.id,
      USER_POOL_CLIENT_ID: userPoolClient.id,
      AWS_REGION: region,
    },
  });
}

// Seed API - only available in personal sandboxes
if (isPersonalSandbox) {
  const seedApi = new sst.aws.ApiGatewayV2('Seed', {
    transform: {
      route: {
        handler: {
          link: [table],
        },
      }
    }
  });
  seedApi.route('POST /seed', 'packages/functions/src/seed/handler.main');
}
