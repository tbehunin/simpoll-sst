import { MediaAsset, PollType } from "../common/types";
import { CreatePollRequest } from "../services/types";
import { PollTypeHandler } from "./pollRegistry";

export interface Choice {
  text: string
  media?: MediaAsset
};
export interface MultipleChoiceDetail {
  multiSelect: boolean
  choices: Choice[]
};
export interface ChoiceResult {
  votes: number
  users: string[]
};
export interface MultipleChoiceResult {
  choices: ChoiceResult[]
};
export interface MultipleChoiceVoter {
  selectedIndex?: number[]
};

export const multipleChoiceHandler: PollTypeHandler<PollType.MultipleChoice> = {
  parseDetails: (details: any): MultipleChoiceDetail => ({
    multiSelect: details.multiSelect,
    choices: details.choices.map((choice: any) => ({
      text: choice.text,
      ...(choice.media && { media: choice.media }) // Handle optional property
    }))
  }),
  parseResults: (results: any): MultipleChoiceResult => ({
    choices: results.choices.map((choice: any) => ({
      votes: choice.votes,
      users: choice.users
    }))
  }),
  parseVoter: (voter: any): MultipleChoiceVoter => ({
    selectedIndex: voter.selectedIndex,
  }),
  buildResults: (request: CreatePollRequest<PollType>): MultipleChoiceResult => ({
    choices: request.details.choices.map(() => ({
      votes: 0,
      users: []
    }))
  }),
  parseVoteStream: (voteImage: any): MultipleChoiceVoter => ({
    selectedIndex: (voteImage?.M?.selectedIndex?.L || []).map((item: any) => parseInt(item.N, 10)),
  }),
};
