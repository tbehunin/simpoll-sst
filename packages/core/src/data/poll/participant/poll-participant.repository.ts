import { PollType } from '@simpoll-sst/core/common';
import { dbClient, DbId } from '@simpoll-sst/core/data';
import { Repository } from '@simpoll-sst/core/data';
import { PollParticipantEntity } from '@simpoll-sst/core/common';
import { PollParticipantEntityMapper } from './poll-participant.mapper';

export const PollParticipantRepository: Repository<PollParticipantEntity<PollType>> = {
  get: async (pollParticipantId: string): Promise<PollParticipantEntity<PollType>> => {
    const idSplit = pollParticipantId.split(':');
    const rawData = await dbClient.get({ pk: `Poll#${idSplit[0]}`, sk: `Participant#${idSplit[1]}` }, 'PollParticipants');
    const [result] = PollParticipantEntityMapper.fromRaw(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollParticipantIds: string[]): Promise<PollParticipantEntity<PollType>[]> => {
    const keys: DbId[] = pollParticipantIds.map((pollParticipantId) => {
      const idSplit = pollParticipantId.split(':');
      return { pk: `Poll#${idSplit[0]}`, sk: `Participant#${idSplit[1]}` };
    });
    const rawData = await dbClient.batchGet(keys, 'PollParticipants');
    return PollParticipantEntityMapper.fromRaw(rawData);
  },
};
