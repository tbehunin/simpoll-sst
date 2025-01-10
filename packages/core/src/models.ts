export enum PollType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  Rank = 'RANK',
  Rate = 'RATE',
  OpenText = 'OPEN_TEXT',
  Street = 'STREET',
};

export enum AuthorType {
  Self = 'SELF',
  Friend = 'FRIEND'
};

export enum PollScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
};

export enum VoteStatus {
  Voted = 'VOTED',
  Unvoted = 'UNVOTED'
};

export enum PollStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
};

export enum VotePrivacy {
  Anonymous = 'ANONYMOUS',
  Open = 'OPEN',
  Private = 'PRIVATE',
};

export enum MediaType {
  Video = 'VIDEO',
  Image = 'IMAGE',
  Giphy = 'GIPHY',
};

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
  voteStatus: VoteStatus
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
