import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';

const BucketName = Resource.Uploads.name;
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
    const command = new PutObjectCommand({
      Bucket: BucketName,
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
      Bucket: BucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: DOWNLOAD_URL_TTL });
  },
};
