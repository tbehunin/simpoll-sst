import { v4 as uuidv4 } from 'uuid';
import { pollDetailsDao } from '../data/pollDetailsDao';
import { pollQueryDao } from '../data/pollQueryDao';
import { pollResultsDao } from '../data/pollResultsDao';
import { pollVotersDao } from '../data/pollVotersDao';
import { Poll, PollResult, PollVoter } from '../models';
import { dbClient } from '../data/dbClient';
import { CreatePollRequest, QueryPollsRequest } from './types';
import { docBuilder } from './docBuilder';
import { pollTypeMapper } from '../mappers/pollTypeMapper';

const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await pollQueryDao.query(request);
  return result;
};

const getPollsByIds = async (pollIds: string[]): Promise<Poll[]> => {
  const result = await pollDetailsDao.batchGet(pollIds);
  return result.map((pollDetailDoc) => pollTypeMapper.get(pollDetailDoc.type).mapToPoll(pollDetailDoc));
};

const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult[]> => {
  const result = await pollResultsDao.batchGet(pollIds);
  return result.map((pollResultDoc) => pollTypeMapper.get(pollResultDoc.type).mapToPollResult(pollResultDoc));
};

const getPollVotersByIds = async (pollVoterIds: string[]): Promise<PollVoter[]> => {
  const result = await pollVotersDao.batchGet(pollVoterIds);
  return result.map((pollVoterDoc) => pollTypeMapper.get(pollVoterDoc.type).mapToPollVoter(pollVoterDoc));
};

const createPoll = async (request: CreatePollRequest): Promise<string> => {
  const pollId = uuidv4();
  const now = new Date().toISOString();
  const pollDetailDoc = docBuilder.buildPollDetailDoc(pollId, now, request);
  const pollResultDoc = docBuilder.buildPollResultDoc(pollId, request);
  const pollVoterDocs = docBuilder.buildPollVoterDocs(pollId, request);
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollVoterDocs]);
  return pollId;
};

const vote = async (request: VoteRequest): Promise<void> => {
  const now = new Date().toISOString();
  const doc = await pollDetailsDao.get(request.pollId);
  const poll = mapper.mapToPoll(doc);

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
      if (!(poll.details as MultipleChoiceDetail).multiSelect && (request.vote as MultipleChoiceVote).selectedIndex.length > 1) {
        throw new Error('Multiple choice poll is not multi-select');
      }
      break;
    default:
      throw new Error(`Unknown poll type: ${poll.type}`);
  }
  const voter = await pollVotersDao.get(generatePollVoterId(request.pollId, request.userId));
  if (voter && voter.voteTimestamp) {
    throw new Error('User has already voted on this poll');
  }

  // Save vote
  const pollVoterDoc = docBuilder.buildPollVoterDoc(poll, request);
  await dbClient.write(pollVoterDoc);
};

export const pollService = {
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  createPoll,
  vote,
};
