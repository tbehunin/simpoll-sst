import { PollType } from "../../../common/types";
import { PollDetailEntity } from "../../../data/poll/detail/poll-detail.entity";
import { PollVoteEntity } from "../../../data/poll/vote/poll-vote.entity";
import { PollDetailRepository } from "../../../data/poll/detail/poll-detail.repository";
import { PollVoteRepository } from "../../../data/poll/vote/poll-vote.repository";
import { VoteRequest } from "../../types";
import { generatePollVoterId } from "../../utils";

export type ValidationContext = {
  poll?: PollDetailEntity<PollType>;
  existingVoter?: PollVoteEntity<PollType>;
  currentTime: string;
};

// Data fetcher - single responsibility for gathering all needed data
export const createValidationContext = async (
  request: VoteRequest<PollType>
): Promise<ValidationContext> => {
  const currentTime = new Date().toISOString();
  
  // Fetch all required data in parallel (single round-trip)
  const [poll, existingVoter] = await Promise.all([
    PollDetailRepository.get(request.pollId),
    PollVoteRepository.get(generatePollVoterId(request.pollId, request.userId))
  ]);

  return {
    poll,
    existingVoter,
    currentTime,
  };
};