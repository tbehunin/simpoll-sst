import { z } from 'zod';
import { MediaType } from './poll.types';

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
  value: z.string().min(1, 'Media value is required').refine((value, ctx) => {
    const mediaType = (ctx.parent as any).type;
    
    if (mediaType === MediaType.Giphy) {
      // Validate Giphy URL - must be from giphy.com or any subdomain
      try {
        const url = new URL(value);
        const isGiphyDomain = url.hostname === 'giphy.com' || url.hostname.endsWith('.giphy.com');
        if (!isGiphyDomain) {
          return false;
        }
      } catch {
        return false;
      }
    } else {
      // Validate assetId format for Image/Video
      if (!ASSET_ID_REGEX.test(value)) {
        return false;
      }
    }
    
    return true;
  }, {
    message: 'Invalid media value: Giphy URLs must be from giphy.com domain, Image/Video must be valid assetId (UUID.extension)'
  })
});
