import { CreatePollRequest } from './types';
import { PollType } from '../../../../common/types';

export type CreatePollValidationContext = {
  currentTime: string;
};

// Context creator for create poll commands (minimal context needed)
export const createCreatePollContext = async (
  request: CreatePollRequest<PollType>
): Promise<CreatePollValidationContext> => {
  return {
    currentTime: new Date().toISOString(),
  };
};