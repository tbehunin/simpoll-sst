import { PollType, PollScope } from "../../common/types";
import { dbClient } from "../../data/dbClient";
import { PollDetailRepository } from "../../data/poll/detail/poll-detail.repository";
import { PollVoteRepository } from "../../data/poll/vote/poll-vote.repository";
import { PollVoter } from "../../models";
import { VoteRequest } from "../types";
import { generatePollVoterId } from "../utils";
import { PollVoterMapper } from "./mappers";

export const getPollVotersByIds = async (pollVoterIds: string[]): Promise<PollVoter<PollType>[]> => {
  const entities = await PollVoteRepository.batchGet(pollVoterIds);
  return PollVoterMapper.toDomainList(entities);
};

export const vote = async (request: VoteRequest<PollType>): Promise<void> => {
  const now = new Date().toISOString();
  const poll = await PollDetailRepository.get(request.pollId);

  // Validate:
  // - Poll exists
  // - Poll was not authored by the user
  // - Poll has not expired
  // - Poll is public or privately shared with the user
  // - When multiple choice:
  //   - selected index value(s) are provided
  //   - single selected poll does not have multiple selected indexes
  // - User has not already voted
  if (!poll) {
    throw new Error(`Poll with id ${request.pollId} not found`);
  }
  if (poll.userId === request.userId) {
    throw new Error('User cannot vote on their own poll');
  }
  if (poll.expireTimestamp < now) {
    throw new Error('Poll has expired');
  }
  if (poll.scope === PollScope.Private && !poll.sharedWith.includes(request.userId)) {
    throw new Error('Poll has not been shared with the user');
  }
  switch (poll.type) {
    case PollType.MultipleChoice:
      
      break;
    default:
      throw new Error(`Unknown poll type: ${poll.type}`);
  }
  const voter = await PollVoteRepository.get(generatePollVoterId(request.pollId, request.userId));
  if (voter && voter.voteTimestamp) {
    throw new Error('User has already voted on this poll');
  }

  // Save vote
  const pollVoterDoc = PollVoterMapper.fromVoteRequest(poll, request);
  await dbClient.put(pollVoterDoc);
};
