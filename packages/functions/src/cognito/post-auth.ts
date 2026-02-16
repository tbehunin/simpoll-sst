import { PostAuthenticationTriggerHandler } from 'aws-lambda';
import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

/**
 * Cognito Post Authentication Trigger
 * Syncs user profile to DynamoDB on every successful login
 * This ensures username/email changes in Cognito are reflected in our database
 */
export const main: PostAuthenticationTriggerHandler = async (event) => {
  console.log('Post Auth Trigger fired:', JSON.stringify(event, null, 2));

  try {
    const userId = event.request.userAttributes.sub;
    const username = event.userName;
    const email = event.request.userAttributes.email;
    const emailVerified = event.request.userAttributes.email_verified === 'true';

    // Upsert user profile in DynamoDB
    await dynamoDb.send(
      new PutCommand({
        TableName: Resource.PollsTable.name,
        Item: {
          odType: 'User',
          pk: `User#${userId}`,
          sk: 'Profile',
          userId,
          username,
          email,
          emailVerified,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );

    console.log(`✅ Successfully synced user profile for userId: ${userId}`);
  } catch (error) {
    console.error('❌ Error syncing user profile:', error);
    // Don't throw - we don't want to block user authentication if profile sync fails
    // Consider adding a dead letter queue or retry mechanism for production
  }

  // Return event unchanged (required by Cognito)
  return event;
};
