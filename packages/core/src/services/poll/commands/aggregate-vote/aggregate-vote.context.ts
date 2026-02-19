import { PollResultEntity } from '@simpoll-sst/core/data';
import { pollResultRepository } from '@simpoll-sst/core/data';
import { AggregateVoteRequest } from './aggregate-vote.types';
import { PollType } from '@simpoll-sst/core/common';

export type AggregateVoteValidationContext = {
  currentTime: string;
  pollResults?: PollResultEntity<PollType>;
};

// Context creator for aggregate vote commands (needs poll results)
export const createAggregateVoteContext = async (
  request: AggregateVoteRequest
): Promise<AggregateVoteValidationContext> => {
  const currentTime = new Date().toISOString();
  const { participant } = request;
  
  // Fetch poll results for aggregation
  const pollResults = await pollResultRepository.get(participant.pollId);

  return {
    currentTime,
    pollResults,
  };
};
