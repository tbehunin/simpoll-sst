import { Choice, ChoiceResult } from '@simpoll-sst/core/poll-types/multiple-choice.handler';
import { MediaAsset, MediaType, PollType } from '@simpoll-sst/core/common';
import { PollResult } from '@simpoll-sst/core/services/poll/results/poll-result.domain';
import { PollParticipant } from '@simpoll-sst/core/services/poll/participants/poll-participant.domain';
import { PollDetail } from '@simpoll-sst/core/services/poll/details/poll-detail.domain';
import { MediaService } from '@simpoll-sst/core/services/media/media.service';
import { builder } from '../builder';
import { mediaType } from '../common/enums';
import { PollDetailWithType, registerGraphQLPollType } from './registry';

// ─── Output types ───────────────────────────────────────────────────────────

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
    value: t.field({
      type: 'String',
      description: 'Accessible URL - presigned GET URL for Image/Video, or Giphy URL',
      resolve: async (parent) => {
        if (parent.type === MediaType.Giphy) {
          return parent.value; // Giphy URLs are returned as-is
        }
        // value contains full S3 path from DDB (e.g., "private/userId/media/file.jpg")
        // Generate presigned GET URL
        return MediaService.generateDownloadUrlFromS3Key(parent.value);
      },
    }),
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

export const multipleChoiceParticipant = builder.objectRef<PollParticipant<PollType.MultipleChoice>>('MultipleChoiceParticipant').implement({
  fields: (t) => ({
    selectedIndex: t.field({
      type: ['Int'],
      nullable: true,
      resolve: (source) => source.vote?.selectedIndex,
    }),
    voteTimestamp: t.exposeString('voteTimestamp', { nullable: true }),
  }),
});

// ─── Input types ────────────────────────────────────────────────────────────

export const multipleChoiceInput = builder.inputType('MultipleChoiceInput', {
  fields: (t) => ({
    multiSelect: t.boolean(),
    choices: t.field({ type: [choiceInput], required: true }),
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

// ─── Registration ────────────────────────────────────────────────────────────

registerGraphQLPollType(PollType.MultipleChoice, {
  fieldName: 'multipleChoice',
  detailRef: multipleChoiceDetail,
  resultRef: multipleChoiceResult,
  participantRef: multipleChoiceParticipant,
  detailInput: multipleChoiceInput,
  voteInput: multipleChoiceVoteInput,
});
