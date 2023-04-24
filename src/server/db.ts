/*
 *		Prisma Client Initializer
 *
 *
 *		This file exports a Prisma client instance for communicating with the database. It sets the log level to "query", "error", and "warn"
 *		in development mode and "error" in other modes. It also declares a global variable prisma, which can be used to access the Prisma client
 *		from anywhere in the application. If prisma has already been initialized in the global scope, it uses the existing instance; otherwise, it
 *		creates a new instance. Finally, if the current environment is not production, it assigns the Prisma client instance to the global prisma variable.
 */
import { PrismaClient } from '@prisma/client';

import { env } from '../env/server.mjs';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Instantiate Prisma Client for communicating with the database
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
