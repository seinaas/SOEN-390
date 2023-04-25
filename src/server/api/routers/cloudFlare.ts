/*
 *		CloudFlare Bucket Router
 *
 *
 *		This file defines a router that exposes three endpoints for generating pre-signed URLs to interact with an AWS S3 bucket. The endpoints are getPresignedPUTUrl, getPresignedLISTUrl, and
 *    getPresignedGETUrl. The router uses the createTRPCRouter function and imports the necessary AWS SDK client libraries. It also defines a protected procedure to handle input validation 
 *    and user authentication. Finally, the router generates the pre-signed URLs and returns them to the client.
 */
/* istanbul ignore file */
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

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
    .input(
      z.object({
        fileName: z.string(),
        pathPrefixes: z.string().array().optional(),
        userId: z.string().default(''),
        containerType: z.string().default(''),
        postId: z.string().default(''),
      }),
    )
    .mutation(async ({ input }) => {
      const { fileName, pathPrefixes, userId, containerType, postId } = input;

      const putUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Key: pathPrefixes
            ? `${pathPrefixes.join('/')}/${fileName}`
            : `${userId}/${containerType}/${postId}/${fileName}`,
        }),
        {
          expiresIn: 30,
        },
      );

      return putUrl;
    }),

  getPresignedLISTUrl: protectedProcedure
    .input(
      z.object({
        pathPrefixes: z.string().array().optional(),
        userId: z.string().default(''),
        containerType: z.string().default(''),
        postId: z.string().default(''),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { pathPrefixes, userId, containerType, postId } = input;
      const putUrl = await getSignedUrl(
        S3,
        new ListObjectsV2Command({
          Bucket: env.CLOUDFLARE_BUCKET_NAME,
          Prefix: pathPrefixes ? `${pathPrefixes.join('/')}/` : `${userId}/${containerType}/${postId}/`,
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
