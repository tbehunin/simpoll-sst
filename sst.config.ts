/// <reference path='./.sst/platform/config.d.ts' />

export default $config({
  app(input) {
    return {
      name: 'simpoll-sst',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          profile: 'simpoll-sst',
        },
      },
    };
  },
  async run() {
    await import('./infra/storage');
    const apiModule = await import('./infra/api');
    const auth = await import('./infra/auth');

    const outputs: Record<string, any> = {
      UserPool: auth.userPool.id,
      Region: aws.getRegionOutput().name,
      IdentityPool: auth.identityPool.id,
      UserPoolClient: auth.userPoolClient.id,
      GraphQLEndpoint: apiModule.graphql.url,
    };

    // Only include AuthTestPage in dev stage
    if ($app.stage === 'dev') {
      outputs.AuthTestPage = $interpolate`${apiModule.graphql.url}/auth-test`;
    }

    return outputs;
  },
});
