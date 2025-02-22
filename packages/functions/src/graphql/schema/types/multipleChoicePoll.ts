import { Choice, ChoiceResult } from '@simpoll-sst/core/handlers/multipleChoiceHandler';
import { builder } from '../builder';
import { mediaType } from '../common/enums';
import { MediaAsset, PollType } from '@simpoll-sst/core/common/types';
import { PollResult, PollVoter } from '@simpoll-sst/core/models';
import { PollDetailWithType } from '../unions/pollDetail';

export const multipleChoiceDetail = builder.objectRef<PollDetailWithType<PollType.MultipleChoice>>('MultipleChoiceDetail').implement({
  fields: (t) => ({
    multiSelect: t.field({
      type: 'Boolean',
      resolve: (source) => source.details.multiSelect,
    }),
    choices: t.field({
      type: [choice],
      resolve: (source) => source.details.choices,
    }),
  }),
});

export const choice = builder.objectRef<Choice>('Choice').implement({
  fields: (t) => ({
    text: t.exposeString('text'),
    media: t.expose('media', { type: mediaAsset, nullable: true }),
  }),
});

export const mediaAsset = builder.objectRef<MediaAsset>('MediaAsset').implement({
  fields: (t) => ({
    type: t.expose('type', { type: mediaType }),
    value: t.exposeString('value'),
  }),
});

export const multipleChoiceResult = builder.objectRef<PollResult<PollType.MultipleChoice>>('MultipleChoiceResult').implement({
  fields: (t) => ({
    choices: t.field({
      type: [choiceResult],
      resolve: (source) => source.results.choices,
    }),
  }),
});

export const choiceResult = builder.objectRef<ChoiceResult>('ChoiceResult').implement({
  fields: (t) => ({
    votes: t.exposeFloat('votes'),
    users: t.exposeStringList('users', { nullable: true }),
  }),
});

export const multipleChoiceInput = builder.inputType('MultipleChoiceInput', {
  fields: (t) => ({
    multiSelect: t.boolean(),
    choices: t.field({
      type: [choiceInput],
      required: true,
    }),
  }),
});
export const choiceInput = builder.inputType('ChoiceInput', {
  fields: (t) => ({
    text: t.string(),
    media: t.field({ type: mediaAssetInput, required: false }),
  }),
});
export const mediaAssetInput = builder.inputType('MediaAssetInput', {
  fields: (t) => ({
    type: t.field({ type: mediaType }),
    value: t.string(),
  }),
});

export const multipleChoiceVoteInput = builder.inputType('MultipleChoiceVoteInput', {
  fields: (t) => ({
    selectedIndex: t.intList(),
  }),
});

export const multipleChoiceVoter = builder.objectRef<PollVoter<PollType.MultipleChoice>>('MultipleChoiceVoter').implement({
  fields: (t) => ({
    selectedIndex: t.field({
      type: ['Int'],
      nullable: true,
      resolve: (source) => source.vote?.selectedIndex,
    }),
    voteTimestamp: t.exposeString('voteTimestamp', { nullable: true }),
  }),
});
