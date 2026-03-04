import { createBatchQuery } from '../queries/query-builder';
import { PollParticipantRepository } from '@simpoll-sst/core/data';
import { PollParticipantMapper } from './poll-participant';

export const getPollParticipantsByIds = createBatchQuery(
  PollParticipantRepository,
  PollParticipantMapper
);