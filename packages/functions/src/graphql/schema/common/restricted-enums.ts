import { builder } from '../builder';

/**
 * Restricted PollScope enum for published polls
 * Excludes Draft since participants can never query draft polls
 */
export const publishedPollScope = builder.enumType('PublishedPollScope', {
  values: {
    Public: { value: 'Public', description: 'Polls visible to everyone' },
    Private: { value: 'Private', description: 'Polls shared with specific users' },
  },
});
