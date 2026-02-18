import { PostAuthenticationTriggerHandler } from 'aws-lambda';
import { UserService } from '@simpoll-sst/core/services/user/user.service';

/**
 * Cognito Post Authentication Trigger
 * Syncs user profile to DynamoDB on every successful login
 * This ensures username/email/phone changes in Cognito are reflected in our database
 */
export const main: PostAuthenticationTriggerHandler = async (event) => {
  console.log('Post Auth Trigger fired:', JSON.stringify(event, null, 2));

  try {
    const userId = event.request.userAttributes.sub;
    const username = event.request.userAttributes.preferred_username;
    const email = event.request.userAttributes.email;
    const phoneNumber = event.request.userAttributes.phone_number;
    const emailVerified = event.request.userAttributes.email_verified === 'true';
    const phoneVerified = event.request.userAttributes.phone_number_verified === 'true';

    if (!username) {
      throw new Error('Username (preferred_username) is required');
    }

    // Delegate to service layer (maintains proper layering)
    await UserService.syncUserProfile({
      userId,
      username,
      email,
      phoneNumber,
      emailVerified,
      phoneVerified,
    });

    console.log(`✅ Successfully synced user profile for userId: ${userId}`);
  } catch (error) {
    console.error('❌ Error syncing user profile:', error);
    // Don't throw - we don't want to block user authentication if profile sync fails
    // Consider adding a dead letter queue or retry mechanism for production
  }

  // Return event unchanged (required by Cognito)
  return event;
};
