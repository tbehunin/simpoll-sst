import { builder } from '../builder';

/**
 * Restricted PollScope enum for participant queries
 * Excludes Draft since participants can never query draft polls
 */
export const participantPollScope = builder.enumType('ParticipantPollScope', {
  values: {
    Public: { value: 'Public', description: 'Polls visible to everyone' },
    Private: { value: 'Private', description: 'Polls shared with specific users' },
  },
});
