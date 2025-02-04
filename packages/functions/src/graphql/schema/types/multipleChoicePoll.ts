import { builder } from "../builder";
import { Choice, ChoiceResult, MediaAsset, MultipleChoiceDetail, MultipleChoiceResult } from "../../../../../core/src/models";
import { mediaType, pollType } from "../common/enums";

export const multipleChoiceDetail = builder.objectRef<MultipleChoiceDetail>('MultipleChoiceDetail').implement({
  fields: (t) => ({
    type: t.expose('type', { type: pollType }),
    multiSelect: t.exposeBoolean('multiSelect'),
    choices: t.expose('choices', { type: [choice] }),
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
  fields: (t) => ({
    choices: t.expose('choices', { type: [choiceResult] }),
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
