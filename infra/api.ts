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

api.route('POST /notes', 'packages/functions/src/create.main');
api.route('GET /notes/{id}', 'packages/functions/src/get.main');
api.route('GET /notes', 'packages/functions/src/list.main');
api.route('PUT /notes/{id}', 'packages/functions/src/update.main');
api.route('DELETE /notes/{id}', 'packages/functions/src/delete.main');

// Create the GraphQL API
const stage = $app.stage;
const isLocal = !!process.env.IS_LOCAL;

// Validate required environment variables based on stage
if (stage === 'dev') {
  if (!process.env.DEV_USER_ID) {
    throw new Error('DEV_USER_ID environment variable is required for dev stage');
  }
}

export const graphql = new sst.aws.ApiGatewayV2('GraphQL', {
  transform: {
    route: {
      handler: {
        link: [table],
        environment: {
          SST_STAGE: stage,
          IS_LOCAL: isLocal ? 'true' : 'false',
          ...(stage === 'dev' && process.env.DEV_USER_ID
            ? { DEV_USER_ID: process.env.DEV_USER_ID }
            : {}),
          ...(stage === 'production'
            ? {
                COGNITO_USER_POOL_ID: userPool.id,
                COGNITO_CLIENT_ID: userPoolClient.id,
              }
            : {}),
        },
      },
    }
  }
});
graphql.route('POST /graphql', 'packages/functions/src/graphql/handler.main');
graphql.route('GET /graphql', 'packages/functions/src/graphql/handler.main');

// Auth test page - only available in dev stage
if (stage === 'dev') {
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


// Seed the table for local development
export const seedApi = new sst.aws.ApiGatewayV2('Seed', {
  transform: {
    route: {
      handler: {
        link: [table],
      },
    }
  }
});
seedApi.route('POST /seed', 'packages/functions/src/seed/handler.main');
