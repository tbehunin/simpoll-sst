import { PollType, PollScope } from '@simpoll-sst/core/common';
import { PollDetailEntity } from '@simpoll-sst/core/data';
import { PollParticipantEntity } from '@simpoll-sst/core/common';
import { PollDetailRepository, PollParticipantRepository } from '@simpoll-sst/core/data';
import { VoteRequest } from './vote.types';
import { generatePollUserId } from '../../../utils';

export type VoteValidationContext = {
  // Common context data
  currentTime: string;
  
  // Poll-specific context (when needed)
  poll?: PollDetailEntity<PollType>;
  existingParticipant?: PollParticipantEntity<PollType>;
};

// Context creator for vote commands (needs poll + participant data)
export const createVoteContext = async (
  request: VoteRequest<PollType>
): Promise<VoteValidationContext> => {
  const currentTime = new Date().toISOString();
  
  // Fetch all required data in parallel (single round-trip)
  const [poll, existingParticipant] = await Promise.all([
    PollDetailRepository.get(request.pollId),
    PollParticipantRepository.get(generatePollUserId(request.pollId, request.userId))
  ]);

  return {
    currentTime,
    poll,
    existingParticipant,
  };
};