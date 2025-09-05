import { MultipleChoiceDetail, MultipleChoiceResult, MultipleChoiceParticipant } from "../handlers/multipleChoiceHandler";

export enum PollType {
  MultipleChoice = 'MultipleChoice',
  // Rank = 'Rank',
  // Rate = 'Rate',
  // OpenText = 'OpenText',
  // Street = 'Street',
};

export enum RoleType {
  Author = 'Author',
  Participant = 'Participant',
};

export enum PollScope {
  Public = 'Public',
  Private = 'Private',
};

export enum PollStatus {
  Open = 'Open',
  Closed = 'Closed',
};

export enum VotePrivacy {
  Anonymous = 'Anonymous',
  Open = 'Open',
  Private = 'Private',
};

export enum MediaType {
  Video = 'Video',
  Image = 'Image',
  Giphy = 'Giphy',
};

export type MediaAsset = {
  type: MediaType
  value: string
};

export type PollDetailMap = {
  [PollType.MultipleChoice]: MultipleChoiceDetail
};

export type PollResultMap = {
  [PollType.MultipleChoice]: MultipleChoiceResult
};

export interface PollParticipantMap {
  [PollType.MultipleChoice]: MultipleChoiceParticipant
};

export const parsePollType = (typeStr?: string) => {
  const pollType = Object.values(PollType).find(type => type === typeStr);
  if (!pollType) throw new Error(`Unknown poll type: ${typeStr}`);

  return pollType;
};
