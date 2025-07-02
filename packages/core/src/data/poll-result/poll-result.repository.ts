import { PollType } from "../../common/types";
import { DbId, dbClient } from "../dbClient";
import { PollResultEntity } from "./poll-result.entity";
import { PollResultMapper } from "./poll-result.mapper";

export const pollResultRepository = {
  batchGet: async (pollIds: string[]): Promise<PollResultEntity<PollType>[]> => {
    const keys: DbId[] = pollIds.map((pollId) => ({ pk: `Poll#${pollId}`, sk: 'Results' }));
    const rawData = await dbClient.batchGet(keys, 'PollResults');
    return PollResultMapper.toPollResultEntity(rawData);
  },
};
