/*
 *   Enviroment Variable Server Error Throwing
 *
 *
 *   This code imports two objects from separate files that define the schema and environment variables for a Next.js app.
 *   It then validates the server-side environment variables against the schema and throws an error if any are invalid. If
 *   there are no errors, it checks to ensure that no server-side variables are being exposed to the client-side by checking
 *   for any keys that start with "NEXT_PUBLIC_". Finally, it exports a merged object that contains all environment variables,
 *   both server-side and client-side, that have been validated and processed.
 */
// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { serverSchema, serverEnv } from './schema.mjs';
import { env as clientEnv, formatErrors } from './client.mjs';

const _serverEnv = serverSchema.safeParse(serverEnv);

if (!_serverEnv.success) {
  console.error('❌ Invalid environment variables:\n', ...formatErrors(_serverEnv.error.format()));
  throw new Error('Invalid environment variables');
}

for (let key of Object.keys(_serverEnv.data)) {
  if (key.startsWith('NEXT_PUBLIC_')) {
    console.warn('❌ You are exposing a server-side env-variable:', key);

    throw new Error('You are exposing a server-side env-variable');
  }
}

export const env = { ..._serverEnv.data, ...clientEnv };
