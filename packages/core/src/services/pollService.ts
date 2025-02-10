import { v4 as uuidv4 } from 'uuid';
import { PollScope, PollType } from '../common/types';
import { pollDetailsDao } from '../data/pollDetailsDao';
import { pollQueryDao } from '../data/pollQueryDao';
import { pollResultsDao } from '../data/pollResultsDao';
import { pollVotersDao } from '../data/pollVotersDao';
import { MultipleChoiceDetail, Poll, PollResult, PollVoter, MultipleChoiceVote } from '../models';
import { dbClient } from '../data/dbClient';
import { CreatePollRequest, QueryPollsRequest, VoteRequest } from './types';
import { docBuilder } from './docBuilder';
import { generatePollVoterId } from './utils';
import { mapper } from './mapper';

const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await pollQueryDao.query(request);
  return result;
};

const getPollsByIds = async (pollIds: string[]): Promise<Poll[]> => {
  const result = await pollDetailsDao.batchGet(pollIds);
  return result.map((pollDetailDoc) => mapper.mapToPoll(pollDetailDoc));
};

const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult[]> => {
  const result = await pollResultsDao.batchGet(pollIds);
  return result.map((pollResultDoc) => mapper.mapToPollResult(pollResultDoc));
};

const getPollVotersByIds = async (pollVoterIds: string[]): Promise<PollVoter[]> => {
  const result = await pollVotersDao.batchGet(pollVoterIds);
  return result.map((pollVoterDoc) => mapper.mapToPollVoter(pollVoterDoc));
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

export const pollService = {
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  createPoll,
};
