import { table } from './storage';

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

// Create the API
export const graphql = new sst.aws.ApiGatewayV2('GraphQL', {
  transform: {
    route: {
      handler: {
        link: [table],
      },
    }
  }
});
graphql.route('POST /graphql', 'packages/functions/src/graphql/handler.main');
graphql.route('GET /graphql', 'packages/functions/src/graphql/handler.main');


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
