import { MediaType, PollScope, PollType, VotePrivacy } from "./common/types";

export type PollBase = {
  pollId: string
  userId: string
  ct: string
  scope: PollScope
  type: PollType
  title: string
  expireTimestamp: string
  votePrivacy: VotePrivacy
  sharedWith: string[]
};

export type MediaAsset = {
  type: MediaType
  value: string
};

export type Choice = {
  text: string
  media?: MediaAsset
};

export type MultipleChoicePoll = PollBase & {
  multiSelect: boolean
  choices: Choice[]
  results?: MultipleChoiceResult
};


export type RankPoll = PollBase & {
  // TBD
  foo: string
  results?: RankResult
};

export type Poll = MultipleChoicePoll | RankPoll; // | RatePoll | OpenTextPoll | StreetPoll;

export type User = {
  userId: string
  username: string
  fullName: string
  email: string
  bio: string
};

export type PollResultBase = {
  totalVotes: number
};

export interface ChoiceResult {
  votes: number
  users: string[]
};

export type MultipleChoiceResult = PollResultBase & {
  choices: ChoiceResult[]
  selectedIndex: number[]
};

export type RankResult = PollResultBase & {
  foo: string
};

export type Result = MultipleChoiceResult | RankResult; // | RateResult | OpenTextResult | StreetResult;

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
