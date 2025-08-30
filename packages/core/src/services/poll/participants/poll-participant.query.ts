import { createBatchQuery } from '../queries/query-builder';
import { PollParticipantRepository } from '../../../data/poll/participant/poll-participant.repository';
import { PollParticipantMapper } from './poll-participant.mapper';

export const getPollParticipantsByIds = createBatchQuery(
  PollParticipantRepository,
  PollParticipantMapper
);