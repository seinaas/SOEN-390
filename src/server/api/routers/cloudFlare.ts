import { z } from 'zod';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../../env/server.mjs';

export const cloudFlareRouter = createTRPCRouter({
  getPresignedPUTUrl: protectedProcedure
    .input(z.object({ fileName: z.string(), userId: z.string(), containerType: z.string(), postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { fileName, userId, containerType, postId } = input;
      const S3 = new S3Client({
        region: 'auto',
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
          secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
        },
      });

      const putUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: `${userId}/${containerType}/${postId}/${fileName}`,
        }),
        {
          expiresIn: 3600,
        },
      );

      return putUrl;
    }),
});
