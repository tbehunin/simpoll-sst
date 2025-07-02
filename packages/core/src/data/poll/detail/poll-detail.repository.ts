import { PollType } from "../../../common/types";
import { dbClient, DbId } from "../../dbClient";
import { PollDetailEntity } from "./poll-detail.entity";
import { PollDetailMapper } from "./poll-detail.mapper";

export const PollDetailRepository = {
  get: async (pollId: string): Promise<PollDetailEntity<PollType>> => {
    const rawData = await dbClient.get({ pk: `Poll#${pollId}`, sk: 'Details' }, 'Details');
    const [result] = PollDetailMapper.toPollDetailEntity(rawData ? [rawData] : undefined);
    return result;
  },
  batchGet: async (pollIds: string[]): Promise<PollDetailEntity<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Details' }));
    const rawData = await dbClient.batchGet(keys, 'PollDetails');
    return PollDetailMapper.toPollDetailEntity(rawData);
  },
};
