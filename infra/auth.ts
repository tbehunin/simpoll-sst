import { bucket, table } from './storage';

const region = aws.getRegionOutput().name;

// Create SNS role for SMS (required for phone verification and SMS MFA)
const snsRole = new aws.iam.Role('CognitoSNSRole', {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'cognito-idp.amazonaws.com',
  }),
});

new aws.iam.RolePolicyAttachment('CognitoSNSPolicy', {
  role: snsRole.name,
  policyArn: 'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
});

// Create the post-authentication Lambda trigger
const postAuthFunction = new sst.aws.Function('PostAuthTrigger', {
  handler: 'packages/functions/src/cognito/post-auth.main',
  link: [table],
});

export const userPool = new sst.aws.CognitoUserPool('UserPool', {
  // Users can log in with email or phone
  usernames: ['email', 'phone'],
  triggers: {
    postAuthentication: postAuthFunction.arn,
  },
  transform: {
    userPool: (args) => {
      // Configure MFA and user attributes
      args.mfaConfiguration = 'OPTIONAL'; // Users can choose to enable MFA
      args.smsConfiguration = {
        externalId: 'simpoll-sms',
        snsCallerArn: snsRole.arn,
      };
      
      // Auto-verify email only (phone verification happens when user adds phone)
      args.autoVerifiedAttributes = ['email'];
      
      // Configure required and mutable attributes
      args.schemas = [
        {
          name: 'email',
          attributeDataType: 'String',
          required: true,
          mutable: true,
        },
        {
          name: 'phone_number',
          attributeDataType: 'String',
          required: false, // Optional - users can add later
          mutable: true,
        },
        {
          name: 'preferred_username',
          attributeDataType: 'String',
          required: false, // Optional custom attribute
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
        actions: ['s3:PutObject', 's3:GetObject'],
        resources: [
          $concat(bucket.arn, '/private/${cognito-identity.amazonaws.com:sub}/*'),
        ],
      },
    ],
  },
});
