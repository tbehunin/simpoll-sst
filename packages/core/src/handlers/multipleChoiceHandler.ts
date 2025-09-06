import { MediaAsset, PollType, PollScope } from "../common/types";
import { CreatePollRequest } from '../services/poll/commands/create-poll/types';
import { PollTypeHandler } from "./pollRegistry";
import { UpdateRequest } from "../data/dbClient";

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
export interface MultipleChoiceParticipant {
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
  parseParticipant: (participant: any): MultipleChoiceParticipant => ({
    selectedIndex: participant.selectedIndex,
  }),
  buildResults: (request: CreatePollRequest<PollType>): MultipleChoiceResult => ({
    choices: request.details.choices.map(() => ({
      votes: 0,
      users: []
    }))
  }),
  parseVoteStream: (voteStream: any): MultipleChoiceParticipant => ({
    selectedIndex: (voteStream?.M?.selectedIndex?.L || []).map((item: any) => parseInt(item.N, 10)),
  }),
  buildAggregateVoteUpdateRequest: (pollId: string, userId: string, scope: PollScope, vote: MultipleChoiceParticipant): UpdateRequest => {
    if (!vote?.selectedIndex || vote.selectedIndex.length === 0) {
      throw new Error('No choices selected for vote aggregation');
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    // ADD operation for totalVotes increment
    updateExpressions.push('ADD totalVotes :inc');
    expressionAttributeValues[':inc'] = 1;

    // Process each selected choice
    vote.selectedIndex.forEach((choiceIndex, i) => {
      // ADD operation for vote count (atomic increment)
      updateExpressions.push(`ADD #choice${i}_votes :inc`);
      expressionAttributeNames[`#choice${i}_votes`] = `results.choices[${choiceIndex}].votes`;
      
      // list_append for users array (only for private polls)
      if (scope === PollScope.Private) {
        updateExpressions.push(`SET #choice${i}_users = list_append(if_not_exists(#choice${i}_users, :empty_list), :user${i})`);
        expressionAttributeNames[`#choice${i}_users`] = `results.choices[${choiceIndex}].users`;
        expressionAttributeValues[`:user${i}`] = [userId];
      }
    });

    // Add empty list for list_append operations
    if (scope === PollScope.Private) {
      expressionAttributeValues[':empty_list'] = [];
    }

    return {
      Key: { pk: `Poll#${pollId}`, sk: 'Results' },
      UpdateExpression: updateExpressions.join(', '),
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    };
  }
};
