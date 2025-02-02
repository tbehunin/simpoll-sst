import { builder } from "../builder";
import { Choice, ChoiceResult, MediaAsset, MultipleChoicePoll, MultipleChoiceResult } from "../../../../../core/src/models";
import { mediaType } from "../common/enums";
import { poll } from "../interfaces/poll";
import { pollResult } from "../interfaces/pollResult";
import { PollType } from "../../../../../core/src/common/types";

export const multipleChoicePoll = builder.objectRef<MultipleChoicePoll>('MultipleChoicePoll').implement({
  interfaces: [poll],
  isTypeOf: (obj: any)=> obj.type === PollType.MultipleChoice,
  fields: (t) => ({
    multiSelect: t.exposeBoolean('multiSelect'),
    choices: t.expose('choices', { type: [choice] }),
    results: t.expose('results', { type: multipleChoiceResult, nullable: true }),
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

export const multipleChoiceResult = builder.objectRef<MultipleChoiceResult>('MultipleChoiceResult').implement({
  interfaces: [pollResult],
  fields: (t) => ({
    choices: t.expose('choices', { type: [choiceResult] }),
    selectedIndex: t.exposeIntList('selectedIndex'),
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
    choices: t.stringList(),
  }),
});
