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

export const pollService = {
  queryPolls,
  getPollsByIds,
  getPollResultsByIds,
  getPollVotersByIds,
  createPoll,
};
