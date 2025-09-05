import { PollType, PollScope } from '../../../../common/types';
import { PollDetailEntity } from '../../../../data/poll/detail/poll-detail.entity';
import { PollParticipantEntity } from '../../../../common/poll-participant.entity';
import { PollDetailRepository } from '../../../../data/poll/detail/poll-detail.repository';
import { PollParticipantRepository } from '../../../../data/poll/participant/poll-participant.repository';
import { VoteRequest } from './types';
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