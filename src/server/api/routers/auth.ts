/*
 *		Authentication Router
 *
 *
 *		This is a Node.js module that defines an authentication router for a TRPC server. It exposes a single procedure, which handles email/password registration using bcrypt for password hashing.
 *		The procedure takes in an email, password, and confirmPassword as input and returns the user ID and email upon successful registration. It also performs input validation to ensure the password
 *		and confirmPassword match, and that the user doesn't already exist. The authentication router is created using the createTRPCRouter function from the trpc library.
 */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import bcrypt from 'bcryptjs';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string(), confirmPassword: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const userExists = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (userExists) {
        throw new Error('User already exists');
      }

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: bcrypt.hashSync(input.password, 10),
        },
      });

      const account = await ctx.prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
        },
      });

      if (!user || !account) {
        throw new Error('Something went wrong');
      }

      return {
        id: user.id,
        email: user.email,
      };
    }),
});
