/*
 *   API TRPC Handler
 *
 *
 *   This is a Next.js API route handler that uses the createNextApiHandler function from the @trpc/server/adapters/next package
 *   to create an API handler for tRPC. The createTRPCContext function is used to create a context object for tRPC, which is passed
 *   to the createNextApiHandler function along with the appRouter router instance. If an error occurs in development mode, an error
 *   message is logged to the console. The env object is imported from the server.mjs file in the env folder and contains environment
 *   variables specific to the server environment.
 */
/* istanbul ignore file */

import { createNextApiHandler } from '@trpc/server/adapters/next';

import { env } from '../../../env/server.mjs';
import { createTRPCContext } from '../../../server/api/trpc';
import { appRouter } from '../../../server/api/root';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
      : undefined,
});
