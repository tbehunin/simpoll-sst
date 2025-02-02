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
export type MultipleChoiceDetailDoc = PollDetailDocBase & {
  multiSelect: boolean
  choices: { text: string }[]
};
export type PollDetailDoc = MultipleChoiceDetailDoc; // | RankDetailDoc | etc;

export type PollVoteDoc = {
  pk: string
  sk: string
  type: PollType
  gsipk1: string
  gsipk2: string
  gsisk1: string
  gsisk2: string
  voteTimestamp?: string
};
