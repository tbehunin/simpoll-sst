import { v4 as uuidv4 } from 'uuid';
import { PollType } from "../../common/types";
import { dbClient } from "../../data/dbClient";
import { CreatePollRequest } from "../types";
import { PollDetailMapper, PollResultMapper, PollVoterMapper } from "./mappers";

export const createPoll = async (request: CreatePollRequest<PollType>): Promise<string> => {
  const pollId = uuidv4();
  const now = new Date().toISOString();
  const pollDetailDoc = PollDetailMapper.fromCreateRequest(pollId, now, request);
  const pollResultDoc = PollResultMapper.fromCreateRequest(pollId, request);
  const pollVoterDocs = PollVoterMapper.fromCreateRequest(pollId, request);
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollVoterDocs]);
  return pollId;
};
