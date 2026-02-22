import { MediaService } from '@simpoll-sst/core/services/media/media.service';
import { builder } from '../builder';

const uploadUrlResponse = builder
  .objectRef<{ uploadUrl: string; assetId: string; expiresIn: number }>('UploadUrlResponse')
  .implement({
    fields: (t) => ({
      uploadUrl: t.exposeString('uploadUrl', {
        description: 'Presigned URL for uploading the file directly to S3',
      }),
      assetId: t.exposeString('assetId', {
        description: 'Asset identifier to store in media.value field',
      }),
      expiresIn: t.exposeInt('expiresIn', {
        description: 'Seconds until the upload URL expires',
      }),
    }),
  });

export const requestUploadUrl = builder.mutationField('requestUploadUrl', (t) =>
  t.field({
    type: uploadUrlResponse,
    description: 'Request a presigned URL for uploading media (images/videos) to S3',
    args: {
      contentType: t.arg.string({
        required: true,
        description: 'MIME type of the file (e.g., "image/jpeg", "video/mp4")',
      }),
      fileSize: t.arg.int({
        required: true,
        description: 'Size of the file in bytes',
      }),
    },
    resolve: async (_parent, args, context) => {
      return MediaService.requestUploadUrl({
        userId: context.currentUserId,
        contentType: args.contentType,
        fileSize: args.fileSize,
      });
    },
  })
);
