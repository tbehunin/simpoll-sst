import { z } from 'zod';
import { MediaType, PollType } from '../../common/poll.types';
import { storageClient } from '../../data/storage.client';
import { buildS3MediaPath } from './media.constants';
import { getPollTypeHandler } from '../../poll-types/poll-type.registry';

/**
 * Shared media validation schemas
 * Used across all poll types that support media attachments
 */

// Validate assetId format: UUID.extension (e.g., "550e8400-e29b-41d4-a716-446655440000.jpg")
const ASSET_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;

const MediaTypeSchema = z.nativeEnum(MediaType, {
  message: 'Invalid media type'
});

/**
 * Validates MediaAsset based on type:
 * - Giphy: Must be a URL ending with .giphy.com
 * - Image/Video: Must be a valid assetId (UUID.extension)
 */
export const MediaAssetSchema = z.object({
  type: MediaTypeSchema,
  value: z.string().min(1, 'Media value is required'),
}).superRefine((data, ctx) => {
  if (data.type === MediaType.Giphy) {
    // Validate Giphy URL - must be from giphy.com or any subdomain
    try {
      const url = new URL(data.value);
      const isGiphyDomain = url.hostname === 'giphy.com' || url.hostname.endsWith('.giphy.com');
      if (!isGiphyDomain) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Invalid media value: Giphy URLs must be from giphy.com domain' });
      }
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Invalid media value: Giphy URLs must be from giphy.com domain' });
    }
  } else {
    // Validate assetId format for Image/Video
    if (!ASSET_ID_REGEX.test(data.value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Invalid media value: Image/Video must be valid assetId (UUID.extension)' });
    }
  }
});
/**
 * Verify that every uploaded (non-Giphy) media asset referenced in poll details
 * actually exists as an S3 object. Intended to run at publish time only — not on
 * every draft autosave — to avoid paying the HeadObject cost unnecessarily.
 *
 * @param details - Raw poll details from the client request (assetId values, not S3 keys)
 * @param type    - Poll type, used to extract media assets via the registered handler
 * @param userId  - Requesting user; used to construct the expected S3 key path
 * @returns Array of validation error messages (empty if all assets exist)
 */
export async function validateMediaAssetsExist(
  details: any,
  type: PollType,
  userId: string,
): Promise<string[]> {
  const handler = getPollTypeHandler(type);
  const assetIds = handler.getUploadedMediaAssets(details);

  if (assetIds.length === 0) return [];

  const results = await Promise.all(
    assetIds.map(async (assetId) => {
      const key = buildS3MediaPath(userId, assetId);
      const exists = await storageClient.checkObjectExists(key);
      return exists ? null : `Media asset '${assetId}' has not been uploaded`;
    }),
  );

  return results.filter((err): err is string => err !== null);
}