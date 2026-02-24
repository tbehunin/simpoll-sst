import { SaveDraftRequest } from './save-draft.types';
import { PollType } from '@simpoll-sst/core/common';

export interface SaveDraftValidationContext {
  currentTime: string;
}

export const createSaveDraftContext = async (
  request: SaveDraftRequest<PollType>
): Promise<SaveDraftValidationContext> => {
  return {
    currentTime: new Date().toISOString(),
  };
};
