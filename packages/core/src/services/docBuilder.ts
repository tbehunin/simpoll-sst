import { PollDetailDoc, PollResultDoc, PollVoterDoc } from '../data/types';
import { generateExpireTimestamp, generatePollScope } from './utils';
import { Poll } from '../models';
import { CreatePollRequest, VoteRequest } from './types';
import { pollTypeMapper } from '../mappers/pollTypeMapper';

const buildPollDetailDoc = <T>(pollId: string, createdTimestamp: string, request: CreatePollRequest<T>): PollDetailDoc<T> => {
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
    details: pollTypeMapper.get(request.type).parseDetails(request) as T,
  };
};

const buildPollResultDoc = <T>(pollId: string, request: CreatePollRequest<T>): PollResultDoc<T> => {
  return {
    pk: `Poll#${pollId}`,
    sk: 'Results',
    type: request.type,
    totalVotes: 0,
    results: pollTypeMapper.get(request.type).buildResults(request) as T,
  };
};

const buildPollVoterDocs = <T>(pollId: string, request: CreatePollRequest<T>): PollVoterDoc<T>[] => {
  if (request.sharedWith.length === 0) {
    return [];
  }
  const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
  return request.sharedWith.map((userId) => ({
    pk: `Poll#${pollId}`,
    sk: `Voter#${userId}`,
    type: request.type,
    gsipk1: `User#${userId}#Voter#Private`,
    gsipk2: `Poll#${userId}#Voter`,
    gsisk1: `Voted:N#${expireTimestamp}`,
    gsisk2: expireTimestamp,
  }));
};

const buildPollVoterDoc = <Detail, Voter>(poll: Poll<Detail>, voteRequest: VoteRequest<Voter>): PollVoterDoc<Voter> => {
  const expireTimestamp = generateExpireTimestamp(poll.expireTimestamp);
  const pollVoterDoc = {
    pk: `Poll#${poll.pollId}`,
    sk: `Voter#${voteRequest.userId}`,
    type: poll.type,
    gsipk1: `User#${voteRequest.userId}#Voter#${poll.scope}`,
    gsipk2: `Poll#${voteRequest.userId}#Voter`,
    gsisk1: `Voted:Y#${expireTimestamp}`,
    gsisk2: expireTimestamp,
    voteTimestamp: new Date().toISOString(),
  };
  return {
    ...pollVoterDoc,
    vote: pollTypeMapper.get(poll.type).parseVote(voteRequest) as Voter,
  };
};

export const docBuilder = {
  buildPollDetailDoc,
  buildPollResultDoc,
  buildPollVoterDocs,
  buildPollVoterDoc,
};
