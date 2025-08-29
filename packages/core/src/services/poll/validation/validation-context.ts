import { PollType } from "../../../common/types";
import { PollDetailEntity } from "../../../data/poll/detail/poll-detail.entity";
import { PollParticipantEntity } from "../../../data/poll/participant/poll-participant.entity";
import { PollDetailRepository } from "../../../data/poll/detail/poll-detail.repository";
import { PollParticipantRepository } from "../../../data/poll/participant/poll-participant.repository";
import { VoteRequest } from "../types";
import { generatePollUserId } from "../../utils";

export type ValidationContext = {
  poll?: PollDetailEntity<PollType>;
  existingParticipant?: PollParticipantEntity<PollType>;
  currentTime: string;
};

// Data fetcher - single responsibility for gathering all needed data
export const createValidationContext = async (
  request: VoteRequest<PollType>
): Promise<ValidationContext> => {
  const currentTime = new Date().toISOString();
  
  // Fetch all required data in parallel (single round-trip)
  const [poll, existingParticipant] = await Promise.all([
    PollDetailRepository.get(request.pollId),
    PollParticipantRepository.get(generatePollUserId(request.pollId, request.userId))
  ]);

  return {
    poll,
    existingParticipant: existingParticipant,
    currentTime,
  };
};