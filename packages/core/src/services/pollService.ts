import { v4 as uuidv4 } from 'uuid';
import { PollScope, PollType } from '../common/types';
import { pollDetailsDao } from '../data/pollDetailsDao';
import { pollQueryDao } from '../data/pollQueryDao';
import { pollResultsDao } from '../data/pollResultsDao';
import { pollVotersDao } from '../data/pollVotersDao';
import { MultipleChoiceDetail, PollDetail, Poll, PollResult, MultipleChoiceResult, PollVoter } from '../models';
import { dbClient } from '../data/dbClient';
import { CreatePoll, QueryPollsRequest } from './types';
import { docBuilder } from './docBuilder';

const queryPolls = async (request: QueryPollsRequest): Promise<string[]> => {
  const result = await pollQueryDao.query(request);
  return result;
};

const getPollsByIds = async (pollIds: string[]): Promise<Poll[]> => {
  const result = await pollDetailsDao.batchGet(pollIds);
  return result.map((pollDetailDoc) => {
    const { pk, sk, gsipk1, gsipk2, gsisk2, userId, ct, scope, type, title, expireTimestamp, sharedWith, votePrivacy, ...rest } = pollDetailDoc;

    function mapDetails(): PollDetail {
      switch (type) {
        case PollType.MultipleChoice:
          const { multiSelect, choices } = rest;
          const result: MultipleChoiceDetail = { type, multiSelect, choices };
          return result;
      }
      throw new Error(`Unknown poll type: ${type}`);
    }

    const poll: Poll = {
      pollId: pk.split('#')[1],
      userId,
      ct,
      scope,
      type,
      title,
      expireTimestamp,
      votePrivacy,
      sharedWith,
      details: mapDetails(),
    };
    return poll;
  });
};

const getPollResultsByIds = async (pollIds: string[]): Promise<PollResult[]> => {
  const result = await pollResultsDao.batchGet(pollIds);
  return result.map(({ pk, sk, type, totalVotes, ...rest }) => {
    const base = { pk, sk, type, totalVotes };
    switch (type) {
      case PollType.MultipleChoice:
        const { choices } = rest;
        const result: MultipleChoiceResult = {
          pollId: pk.split('#')[1],
          type,
          totalVotes,
          choices
        };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

const getPollVotersByIds = async (pollVoterIds: string[]): Promise<PollVoter[]> => {
  const result = await pollVotersDao.batchGet(pollVoterIds);
  return result.map(({ pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp, ...rest }) => {
    const base = { pk, sk, type, gsipk1, gsipk2, gsisk1, gsisk2, voteTimestamp };
    switch (type) {
      case PollType.MultipleChoice:
        const { selectedIndex } = rest;
        const result: PollVoter = {
          pollId: pk.split('#')[1],
          userId: sk.split('#')[1],
          type,
          pollScope: gsipk1.split('#')[3] === 'Public' ? PollScope.Public : PollScope.Private,
          voted: gsisk1.split('#')[1] === 'Y',
          expireTimestamp: gsisk1.split('#')[2],
          selectedIndex,
          voteTimestamp,
        };
        return result;
    }
    throw new Error(`Unknown poll type: ${type}`);
  });
};

const createPoll = async (request: CreatePoll): Promise<string> => {
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
