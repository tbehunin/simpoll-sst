import { PollType } from '../../../common/poll.types';
import { DbId, dbClient } from '../../db.client';
import { Repository } from '../../repository.interface';
import { PollResultEntity } from './poll-result.entity';
import { PollResultMapper } from './poll-result.mapper';

export const pollResultRepository: Repository<PollResultEntity<PollType>> = {
  get: async (pollId: string): Promise<PollResultEntity<PollType>> => {
    const rawData = await dbClient.get({ pk: `Poll#${pollId}`, sk: 'Results' }, 'Results');
    const [result] = PollResultMapper.toPollResultEntity(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollIds: string[]): Promise<PollResultEntity<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');
    return PollResultMapper.toPollResultEntity(rawData);
  },
};
