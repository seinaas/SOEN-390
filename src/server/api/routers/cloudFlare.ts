import { z } from 'zod';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../../env/server.mjs';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export const cloudFlareRouter = createTRPCRouter({
  getPresignedPUTUrl: protectedProcedure
    .input(z.object({ fileName: z.string(), userId: z.string(), containerType: z.string(), postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { fileName, userId, containerType, postId } = input;

      const putUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: `${userId}/${containerType}/${postId}/${fileName}`,
        }),
        {
          expiresIn: 30,
        },
      );

      return putUrl;
    }),

  getPresignedLISTUrl: protectedProcedure
    .input(z.object({ userId: z.string(), containerType: z.string(), postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, containerType, postId } = input;
      const putUrl = await getSignedUrl(
        S3,
        new ListObjectsV2Command({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Prefix: `${userId}/${containerType}/${postId}/`,
          Delimiter: '/',
        }),
        {
          expiresIn: 30,
        },
      );

      return putUrl;
    }),
  getPresignedGETUrl: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ input, ctx }) => {
    const { key } = input;
    const putUrl = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        ResponseContentDisposition: 'attachment',
      }),
      {
        expiresIn: 3600,
      },
    );

    return putUrl;
  }),
});