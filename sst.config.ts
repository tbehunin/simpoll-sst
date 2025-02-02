/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "simpoll-sst",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile: "simpoll-sst",
        },
      },
    };
  },
  async run() {
    await import("./infra/storage");
    await import("./infra/api");
    const auth = await import("./infra/auth");

    return {
      UserPool: auth.userPool.id,
      Region: aws.getRegionOutput().name,
      IdentityPool: auth.identityPool.id,
      UserPoolClient: auth.userPoolClient.id,
    };
  },
});
