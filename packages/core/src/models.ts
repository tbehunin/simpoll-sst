import { MediaType, PollScope, PollType, VotePrivacy } from "./common/types";

export type Poll = {
  pollId: string
  userId: string
  ct: string
  scope: PollScope
  type: PollType
  title: string
  expireTimestamp: string
  votePrivacy: VotePrivacy
  sharedWith: string[]
  details: PollDetail
  results?: PollResult
};

export type MediaAsset = {
  type: MediaType
  value: string
};

export type Choice = {
  text: string
  media?: MediaAsset
};

export type PollDetailBase = {
  type: PollType
};

export type MultipleChoiceDetail = PollDetailBase & {
  multiSelect: boolean
  choices: Choice[]
};


export type RankDetail = PollDetailBase & {
  foo: string
};

export type PollDetail = MultipleChoiceDetail | RankDetail; // | RatePoll | OpenTextPoll | StreetPoll;

export type User = {
  userId: string
  username: string
  fullName: string
  email: string
  bio: string
};

export type PollResultBase = {
  pollId: string
  type: PollType
  totalVotes: number
};

export interface ChoiceResult {
  votes: number
  users: string[]
};

export type MultipleChoiceResult = PollResultBase & {
  choices: ChoiceResult[]
};

export type RankResult = PollResultBase & {
  foo: string
};

export type PollResult = MultipleChoiceResult | RankResult; // | RateResult | OpenTextResult | StreetResult;

export type VoteBase = {
  pollId: string
  userId: string
  type: PollType
  pollScope: PollScope
  voted: boolean
  expireTimestamp: string
  voteTimestamp?: string
};

export type MultipleChoiceVote = VoteBase & {
  selectedIndex?: number[]
};

export type RankVote = VoteBase & {
  // TBD
};

export type Vote = MultipleChoiceVote | RankVote; // | RateVote | OpenTextVote | StreetVote;

export type CreatePollBase = {
  userId: string
  title: string
  sharedWith: string[]
  votePrivacy: VotePrivacy
  expireTimestamp?: string
};

export type CreateMultipleChoicePoll = CreatePollBase & {
  multiSelect: boolean
  choices: string[]
};
