import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../env/server.mjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    },
  });

  const put = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: `${req.query.userId as string}/${(req.query.file as string) || ''}`,
    }),
    {
      expiresIn: 3600,
    },
  );

  // const post = await createPresignedPost(S3, {
  //   Bucket: env.CLOUDFLARE_BUCKET_NAME,
  //   Key: (req.query.file as string) || '',

  //   Fields: {
  //     acl: 'public-read',
  //     'Content-Type': (req.query.fileType as string) || '',
  //   },

  //   Expires: 600, // seconds
  //   Conditions: [
  //     ['content-length-range', 0, 1048576 * 100], // up to 100 MB
  //   ],
  // });

  res.status(200).json(put);
}
