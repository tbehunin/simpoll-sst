import { v4 as uuidv4 } from 'uuid';
import { PollType } from "../../common/types";
import { dbClient } from "../../data/dbClient";
import { docBuilder } from "../docBuilder";
import { CreatePollRequest } from "../types";

export const createPoll = async (request: CreatePollRequest<PollType>): Promise<string> => {
  const pollId = uuidv4();
  const now = new Date().toISOString();
  const pollDetailDoc = docBuilder.buildPollDetailDoc(pollId, now, request);
  const pollResultDoc = docBuilder.buildPollResultDoc(pollId, request);
  const pollVoterDocs = docBuilder.buildPollVoterDocs(pollId, request);
  await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollVoterDocs]);
  return pollId;
};
