import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';
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

  res.status(200).json(put);
}
