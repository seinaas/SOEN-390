import { z } from 'zod';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../../env/server.mjs';

export const uploadRouter = createTRPCRouter({});
