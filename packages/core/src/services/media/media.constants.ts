/**
 * S3 path constants for media assets
 * All media assets are stored under: private/{userId}/media/{assetId}
 */

/**
 * Path template for S3 media storage
 * Format: private/{userId}/media/{assetId}
 */
export const S3_MEDIA_PATH_PREFIX = 'private';
export const S3_MEDIA_FOLDER = 'media';

/**
 * Build the full S3 key for a media asset
 * @param userId - Owner of the media asset
 * @param assetId - Asset identifier (filename with extension)
 * @returns Full S3 key path
 * @example buildS3MediaPath('user-123', 'abc.jpg') => 'private/user-123/media/abc.jpg'
 */
export function buildS3MediaPath(userId: string, assetId: string): string {
  return `${S3_MEDIA_PATH_PREFIX}/${userId}/${S3_MEDIA_FOLDER}/${assetId}`;
}
