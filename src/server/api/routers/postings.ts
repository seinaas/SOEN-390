import { join } from 'path';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * This Job Posting Router contains all the API routes that need to be implemented for the Job Posting Feature.
 * It contains all the procedures related to job postings.
 * This includes getting all job postings, creating/updating/deleting job postings.
 */

export const JobPostingRouter = createTRPCRouter({
  // Get all Job Postings created by a user and the associated applications (in this case a recruiter)
  getJobPostings: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const jobPostings = await ctx.prisma.jobPosting.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          application: true,
        },
      });
      return jobPostings;
    }),

  //save a Job Posting
  saveJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        saved: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.update({
        where: {
          jobPostingId: input.jobPostingId,
        },
        data: {
          saved: input.saved,
        },
      });
      return jobPosting;
    }),

  // Get Saved Job Postings
  getSavedJobPostings: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const jobPostings = await ctx.prisma.jobPosting.findMany({
        where: {
          userId: input.userId,
          saved: true,
        },
      });
      return jobPostings;
    }),

  // Create a Job Posting (By a Recruiter)
  createJobPosting: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return jobPosting;
    }),

  // Update a Job Posting (By a Recruiter)
  editJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'jobPostingId '> & Partial<Pick<typeof input, 'jobPostingId '>> = {
        ...input,
      };
      delete updateInput.jobPostingId;

      const jobPosting = await ctx.prisma.jobPosting.update({
        select: {
          jobPostingId: true,
          userId: true,
          content: true,
          createdAt: true,
          application: true,
        },
        where: {
          jobPostingId: input.jobPostingId,
        },
        data: updateInput,
      });

      return jobPosting;
    }),

  // Delete a Job Posting (Only By a Recruiter)
  deleteJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const JobPosting = await ctx.prisma.jobPosting.delete({
        where: {
          jobPostingId: input.jobPostingId,
        },
      });

      return JobPosting;
    }),

  /////////////////////////////////////////////////////

  // Create a Job Application (By a Candidate)
  createApplication: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        content: z.string().min(1).nullish(), //need to discuss this with the team
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await ctx.prisma.application.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          jobPostingId: input.jobPostingId,
        },
      });
      return application;
    }),

  // Delete a Job Application (By a Candidate)
  deleteApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await ctx.prisma.application.delete({
        where: {
          applicationId: input.applicationId,
        },
      });
      return application;
    }),
});
