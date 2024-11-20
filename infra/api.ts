import { table } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
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

api.route("POST /notes", "packages/functions/src/create.main");
api.route("GET /notes/{id}", "packages/functions/src/get.main");
api.route("GET /notes", "packages/functions/src/list.main");
api.route("PUT /notes/{id}", "packages/functions/src/update.main");
api.route("DELETE /notes/{id}", "packages/functions/src/delete.main");

// Create the GraphQL api
export const graphql = new sst.aws.ApiGatewayV2("GraphQLApi", {
  transform: {
    route: {
      handler: {
        link: [table],
      },
    }
  }
});
graphql.route("GET /graphql", "packages/functions/src/graphql-api/handler.main");
graphql.route("POST /graphql", "packages/functions/src/graphql-api/handler.main");
