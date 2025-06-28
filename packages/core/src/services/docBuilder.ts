import { PollDetailDoc, PollResultDoc, PollVoterDoc } from '../data/types';
import { generateExpireTimestamp, generatePollScope } from './utils';
import { CreatePollRequest, VoteRequest } from './types';
import { PollType } from '../common/types';
import { getPollTypeHandler } from '../handlers/pollRegistry';

const buildPollDetailDoc = (pollId: string, createdTimestamp: string, request: CreatePollRequest<PollType>): PollDetailDoc<PollType> => {
  const scope = generatePollScope(request.sharedWith);
  const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
  
  return {
    pk: `Poll#${pollId}`,
    sk: 'Details',
    gsipk1: `User#${request.userId}#Author#${scope}`,
    gsipk2: `User#${request.userId}#Author`,
    gsisk2: expireTimestamp,
    userId: request.userId,
    ct: createdTimestamp,
    scope,
    type: request.type,
    title: request.title,
    expireTimestamp,
    sharedWith: request.sharedWith,
    votePrivacy: request.votePrivacy,
    details: request.details,
  };
};

const buildPollResultDoc = (pollId: string, request: CreatePollRequest<PollType>): PollResultDoc<PollType> => {
  const handler = getPollTypeHandler(request.type);
  return {
    pk: `Poll#${pollId}`,
    sk: 'Results',
    type: request.type,
    totalVotes: 0,
    results: handler.buildResults(request),
  };
};

const buildPollVoterDocs = (pollId: string, request: CreatePollRequest<PollType>): PollVoterDoc<PollType>[] => {
  if (request.sharedWith.length === 0) {
    return [];
  }
  const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
  return request.sharedWith.map((userId) => ({
    pk: `Poll#${pollId}`,
    sk: `Voter#${userId}`,
    type: request.type,
    gsipk1: `User#${userId}#Voter#Private`,
    gsipk2: `User#${userId}#Voter`,
    gsisk1: `Voted:N#${expireTimestamp}`,
    gsisk2: expireTimestamp,
  }));
};

const buildPollVoterDoc = (poll: PollDetailDoc<PollType>, voteRequest: VoteRequest<PollType>): PollVoterDoc<PollType> => {
  const expireTimestamp = generateExpireTimestamp(poll.expireTimestamp);
  return {
    pk: poll.pk,
    sk: `Voter#${voteRequest.userId}`,
    type: poll.type,
    gsipk1: `User#${voteRequest.userId}#Voter#${poll.scope}`,
    gsipk2: `Poll#${voteRequest.userId}#Voter`,
    gsisk1: `Voted#Y#${expireTimestamp}`,
    gsisk2: expireTimestamp,
    voteTimestamp: new Date().toISOString(),
    vote: voteRequest.vote,
  };
};

export const docBuilder = {
  buildPollDetailDoc,
  buildPollResultDoc,
  buildPollVoterDocs,
  buildPollVoterDoc,
};
