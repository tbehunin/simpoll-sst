import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../../errors';

const s3Client = new S3Client({});

const CONTENT_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

function getExtensionFromContentType(contentType: string): string {
  const extension = CONTENT_TYPE_TO_EXTENSION[contentType.toLowerCase()];
  if (!extension) {
    throw new ValidationError(`Unsupported content type: ${contentType}`);
  }
  return extension;
}

export class MediaService {
  /**
   * Generate a presigned PUT URL for uploading media to S3
   * @returns uploadUrl - Presigned URL for PUT request, assetId - Asset identifier to store in media.value, expiresIn - Seconds until URL expires
   */
  static async requestUploadUrl(params: {
    userId: string;
    contentType: string;
    fileSize: number;
  }): Promise<{ uploadUrl: string; assetId: string; expiresIn: number }> {
    const extension = getExtensionFromContentType(params.contentType);
    const assetId = `${uuidv4()}.${extension}`;
    const s3Key = `private/${params.userId}/media/${assetId}`;

    const command = new PutObjectCommand({
      Bucket: Resource.Uploads.name,
      Key: s3Key,
      ContentType: params.contentType,
      ContentLength: params.fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    return {
      uploadUrl,
      assetId,
      expiresIn: 900,
    };
  }

  /**
   * Generate a presigned GET URL for downloading media from S3
   * @param userId - Owner of the media asset
   * @param assetId - Asset identifier (filename)
   * @returns Presigned URL for GET request
   */
  static async generateDownloadUrl(userId: string, assetId: string): Promise<string> {
    const s3Key = `private/${userId}/media/${assetId}`;
    return this.generateDownloadUrlFromS3Key(s3Key);
  }

  /**
   * Generate a presigned GET URL from a full S3 key
   * @param s3Key - Full S3 key path (e.g., "private/user-id/media/file.jpg")
   * @returns Presigned URL for GET request
   */
  static async generateDownloadUrlFromS3Key(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: Resource.Uploads.name,
      Key: s3Key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 604800 }); // 7 days
  }
}
