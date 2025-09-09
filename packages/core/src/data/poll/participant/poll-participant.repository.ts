import { PollType } from '../../../common/poll.types';
import { dbClient, DbId } from '../../db.client';
import { Repository } from '../../repository.interface';
import { PollParticipantEntity } from '../../../common/poll-participant.entity';
import { PollParticipantMapper } from './poll-participant.mapper';

export const PollParticipantRepository: Repository<PollParticipantEntity<PollType>> = {
  get: async (pollParticipantId: string): Promise<PollParticipantEntity<PollType>> => {
    const idSplit = pollParticipantId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Participant#${idSplit[1]}` }, 'PollParticipants');
    const [result] = PollParticipantMapper.toPollParticipantEntity(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollParticipantIds: string[]): Promise<PollParticipantEntity<PollType>[]> => {
    const keys: DbId[] = pollParticipantIds.map((pollParticipantId) => {
      const idSplit = pollParticipantId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Participant#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollParticipants');
    return PollParticipantMapper.toPollParticipantEntity(rawData);
  },
};
