import { PollType } from '../common/types';
import { PollDetailDoc, PollResultDoc, PollVoterDoc } from '../data/types';
import { generateExpireTimestamp, generatePollScope } from './utils';
import { MultipleChoiceDetail, PollDetail } from '../models';
import { CreatePoll } from './types';

const buildPollDetailDoc = (pollId: string, createdTimestamp: string, request: CreatePoll): PollDetailDoc => {
  const scope = generatePollScope(request.sharedWith);
  const expireTimestamp = generateExpireTimestamp(request.expireTimestamp);
  let details: PollDetail;
  switch (request.type) {
    case PollType.MultipleChoice:
      details = request.details as MultipleChoiceDetail;
      break;
    default:
      throw new Error(`Unknown poll type: ${request.type}`);
  }
  
  return {
    ...details,
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
  };
};

const buildPollResultDoc = (pollId: string, request: CreatePoll): PollResultDoc => {
  let details: PollDetail;
  switch (request.type) {
    case PollType.MultipleChoice:
      details = request.details as MultipleChoiceDetail;
      break;
    default:
      throw new Error(`Unknown poll type: ${request.type}`);
  }
  return {
    pk: `Poll#${pollId}`,
    sk: 'Results',
    type: request.type,
    totalVotes: 0,
    choices: details.choices.map(() => ({ votes: 0, users: [] })), // todo: hardcoded for multiple choice
  };
};

const buildPollVoterDocs = (pollId: string, request: CreatePoll): PollVoterDoc[] => {
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

export const docBuilder = {
  buildPollDetailDoc,
  buildPollResultDoc,
  buildPollVoterDocs,
};
