import { PollScope, PollType, VotePrivacy } from "../common/types";

export type PollDetailDocBase = {
  pk: string
  sk: string
  gsipk1: string
  gsipk2: string
  gsisk2: string
  userId: string
  ct: string
  scope: PollScope
  type: PollType
  title: string
  expireTimestamp: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
};

export type MultipleChoiceDetail = {
  multiSelect: boolean
  choices: { text: string }[]
};

export type MultipleChoiceDetailDoc = PollDetailDocBase & MultipleChoiceDetail;

export type PollDetailDoc = MultipleChoiceDetailDoc; // | RankDetailDoc | etc;

export type PollDetail = MultipleChoiceDetail; //| RankDetail; // | etc;

export type UserDoc = {
  pk: string
  sk: string
  username: string
  fullName: string
  email: string
  bio: string
};

export type PollResultDocBase = {
  pk: string
  sk: string
  type: PollType
  totalVotes: number
};

export type ChoiceResultDoc = {
  votes: number
  users: string[]
};

export type MultipleChoiceResultDoc = PollResultDocBase & {
  choices: ChoiceResultDoc[]
};

export type PollResultDoc = MultipleChoiceResultDoc; // | RankResultDoc | etc;

export type PollVoterDocBase = {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};

export type MultipleChoiceVoterDoc = PollVoterDocBase & {
  selectedIndex?: number[]
};

export type PollVoterDoc = MultipleChoiceVoterDoc; // | RankVoterDoc | etc;
