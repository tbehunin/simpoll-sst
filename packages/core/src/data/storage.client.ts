import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';

// s3Client is safe to initialize at module level (no SST resource access)
const s3Client = new S3Client({});

const UPLOAD_URL_TTL = 900;    // 15 minutes
const DOWNLOAD_URL_TTL = 604800; // 7 days

export const storageClient = {
  /**
   * Generate a presigned PUT URL for uploading a file directly to S3.
   * @param key - Full S3 key (e.g., "private/user-id/media/file.jpg")
   * @param contentType - MIME type of the file
   * @param fileSize - Size of the file in bytes
   * @returns Presigned URL and TTL (seconds until expiry)
   */
  getPresignedUploadUrl: async (
    key: string,
    contentType: string,
    fileSize: number,
  ): Promise<{ url: string; expiresIn: number }> => {
    // Resource.Uploads.name accessed lazily so bundling this module into functions
    // that don't use S3 (e.g. post-auth) doesn't require linking the bucket.
    const command = new PutObjectCommand({
      Bucket: Resource.Uploads.name,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_TTL });

    return { url, expiresIn: UPLOAD_URL_TTL };
  },

  /**
   * Generate a presigned GET URL for downloading a file from S3.
   * @param key - Full S3 key (e.g., "private/user-id/media/file.jpg")
   * @returns Presigned URL valid for 7 days
   */
  getPresignedDownloadUrl: async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: Resource.Uploads.name,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: DOWNLOAD_URL_TTL });
  },
};
