/*
*		Server Authentication Wrapper
*
*
*		This file exports a function named getServerAuthSession that wraps the getServerSession function from the next-auth library. It is used to get the user's 
*		session information on the server-side, for use in creating a trpc context or a restricted API route. The function takes an object ctx as an argument, 
*		which contains the req (request) and res (response) objects. The getAuthOptions function is called with the req and res objects to get the configuration 
*		options for NextAuth.js. The getServerSession function then returns the user's session information.
*/
import { type NextApiRequest, type NextApiResponse, type GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';

import { getAuthOptions } from '../pages/api/auth/[...nextauth]';

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return await getServerSession(
    ctx.req,
    ctx.res,
    getAuthOptions(ctx.req as NextApiRequest, ctx.res as NextApiResponse),
  );
};
