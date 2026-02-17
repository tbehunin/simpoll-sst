import { api } from './api';
import { bucket, table } from './storage';

const region = aws.getRegionOutput().name;

// Create the post-authentication Lambda trigger
const postAuthFunction = new sst.aws.Function('PostAuthTrigger', {
  handler: 'packages/functions/src/cognito/post-auth.main',
  link: [table],
});

export const userPool = new sst.aws.CognitoUserPool('UserPool', {
  // Users can log in with email, phone, or username
  usernames: ['email', 'phone', 'preferred_username'],
  triggers: {
    postAuthentication: postAuthFunction.arn,
  },
  transform: {
    userPool: (args) => {
      // Configure MFA and user attributes
      args.mfaConfiguration = 'OPTIONAL'; // Users can choose to enable MFA
      args.enabledMfas = ['SMS_MFA', 'SOFTWARE_TOKEN_MFA']; // Support SMS and TOTP
      args.autoVerifiedAttributes = ['email', 'phone_number']; // Auto-verify both
      
      // Configure required and mutable attributes
      args.schema = [
        {
          name: 'email',
          attributeDataType: 'String',
          required: true,
          mutable: true,
        },
        {
          name: 'phone_number',
          attributeDataType: 'String',
          required: true,
          mutable: true,
        },
        {
          name: 'preferred_username',
          attributeDataType: 'String',
          required: true,
          mutable: true,
        },
      ];
    },
  },
});

export const userPoolClient = userPool.addClient('UserPoolClient'); // Web client. Add another for mobile later.

export const identityPool = new sst.aws.CognitoIdentityPool('IdentityPool', {
  userPools: [
    {
      userPool: userPool.id,
      client: userPoolClient.id,
    },
  ],
  permissions: {
    authenticated: [
      {
        actions: ['s3:*'],
        resources: [
          $concat(bucket.arn, '/private/${cognito-identity.amazonaws.com:sub}/*'),
        ],
      },
      {
        actions: [
          'execute-api:*',
        ],
        resources: [
          $concat(
            'arn:aws:execute-api:',
            region,
            ':',
            aws.getCallerIdentityOutput({}).accountId,
            ':',
            api.nodes.api.id,
            '/*/*/*'
          ),
        ],
      },
    ],
  },
});
