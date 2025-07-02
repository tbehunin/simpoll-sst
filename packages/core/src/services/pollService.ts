import { v4 as uuidv4 } from 'uuid';
import { QueryRepository } from '../data/query/query-repository';
import { Poll, PollResult, PollVoter } from '../models';
import { dbClient } from '../data/dbClient';
import { CreatePollRequest, QueryPollsRequest, VoteRequest } from './types';
import { docBuilder } from './docBuilder';
import { PollScope, PollType } from '../common/types';
import { generatePollVoterId } from './utils';
import { PollDetailRepository } from '../data/poll-detail/poll-detail.repository';
import { pollResultRepository } from '../data/poll-result/poll-result.repository';
import { PollVoteRepository } from '../data/poll-vote/poll-vote.repository';

const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await QueryRepository.query(request);
  return result;
};

const getPollsByIds = async (pollIds: string[]): Promise<Poll<PollType>[]> => {
  const result = await PollDetailRepository.batchGet(pollIds);
  return result.map((pollDetailDoc) => {
    const { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details } = pollDetailDoc;
    const base = { pk, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, details };
    return {
      ...base,
      pollId: pk.split('#')[1],
    };
  });
};

const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult<PollType>[]> => {
  const result = await pollResultRepository.batchGet(pollIds);
  return result.map((pollResultDoc) => {
    const { pk, type, totalVotes, results } = pollResultDoc;
    return {
      pollId: pk.split('#')[1],
      type,
      totalVotes,
      results
    };
  });
};

const getPollVotersByIds = async (pollVoterIds: string[]): Promise<PollVoter<PollType>[]> => {
  const result = await PollVoteRepository.batchGet(pollVoterIds);
  return result.map((pollVoterDoc) => {
    const { pk, sk, type, gsipk1, gsisk1, voteTimestamp, vote } = pollVoterDoc;
    return {
      pollId: pk.split('#')[1],
      userId: sk.split('#')[1],
      type,
      scope: gsipk1.split('#')[3] === 'Public' ? PollScope.Public : PollScope.Private,
      voted: gsisk1.split('#')[1] === 'Y',
      expireTimestamp: gsisk1.split('#')[2],
      voteTimestamp,
      vote,
    };
  });
};

const createPoll = async (request: CreatePollRequest<PollType>): Promise<string> => {
  const pollId = uuidv4();
  const now = new Date().toISOString();
  const pollDetailDoc = docBuilder.buildPollDetailDoc(pollId, now, request);
  const pollResultDoc = docBuilder.buildPollResultDoc(pollId, request);
  const pollVoterDocs = docBuilder.buildPollVoterDocs(pollId, request);
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollVoterDocs]);
  return pollId;
};

const vote = async (request: VoteRequest<PollType>): Promise<void> => {
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
  const pollVoterDoc = docBuilder.buildPollVoterDoc(poll, request);
  await dbClient.put(pollVoterDoc);
};

export const pollService = {
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  createPoll,
  vote,
};
