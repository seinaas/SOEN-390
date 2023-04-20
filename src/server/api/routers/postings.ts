import { join } from 'path';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * This Job Posting Router contains all the API routes that need to be implemented for the Job Posting Feature.
 * It contains all the procedures related to job postings.
 * This includes getting all job postings, creating/updating/deleting job postings.
 */

export const JobPostingRouter = createTRPCRouter({
  // Get all Job Postings (for the user's feed)
  getJobPostings: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const jobPostings = await ctx.prisma.jobPosting.findMany({});
      return jobPostings;
    }),

  // Get all Job Postings created by a user and the associated applications (in this case a recruiter)
  getRecruiterJobPostings: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const jobPostings = await ctx.prisma.jobPosting.findMany({
        where: {
          recruiterId: input.userId,
        },
        include: {
          applications: true,
        },
      });
      return jobPostings;
    }),

  //save a Job Posting
  toggleSavedJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        saved: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.saved) {
        await ctx.prisma.savedJobPosting.create({
          data: {
            userId: ctx.session.user.id,
            jobPostingId: input.jobPostingId,
          },
        });
      } else {
        await ctx.prisma.savedJobPosting.delete({
          where: {
            userId_jobPostingId: {
              userId: ctx.session.user.id,
              jobPostingId: input.jobPostingId,
            },
          },
        });
      }
    }),

  // Get Saved Job Postings
  getSavedJobPostings: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const savedJobPostings = await ctx.prisma.savedJobPosting.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          JobPosting: true,
        },
      });
      return savedJobPostings.map((s) => s.JobPosting);
    }),

  // Create a Job Posting (By a Recruiter)
  createJobPosting: protectedProcedure
    .input(
      z.object({
        jobTitle: z.string().min(1),
        company: z.string().min(1),
        location: z.string().min(1).nullish(),
        jobType: z.string().min(1),
        workplaceType: z.string().min(1),
        description: z.string().min(1).nullish(),
        requiredDocuments: z.string().min(1).nullish(),
        jobSkills: z.string().min(1).nullish(),
        applicationLink: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.create({
        data: {
          ...input,
          recruiterId: ctx.session.user.id,
          jobTitle: input.jobTitle,
          company: input.company,
          location: input.location,
          jobType: input.jobType,
          workplaceType: input.workplaceType,
          description: input.description,
          requiredDocuments: input.requiredDocuments,
          jobSkills: input.jobSkills,
          applicationLink: input.applicationLink,
        },
      });
      return jobPosting;
    }),

  // Update a Job Posting (By a Recruiter)
  editJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        jobTitle: z.string().min(1),
        company: z.string().min(1),
        location: z.string().min(1).nullish(),
        jobType: z.string().min(1),
        workplaceType: z.string().min(1),
        description: z.string().min(1).nullish(),
        requiredDocuments: z.string().min(1).nullish(),
        jobSkills: z.string().min(1).nullish(),
        applicationLink: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'jobPostingId'> & Partial<Pick<typeof input, 'jobPostingId'>> = {
        ...input,
      };
      delete updateInput.jobPostingId;

      const jobPosting = await ctx.prisma.jobPosting.update({
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
        recruiterId: z.string().min(1),
        jobPostingId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const JobPosting = await ctx.prisma.jobPosting.deleteMany({
        where: {
          recruiterId: input.jobPostingId,
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
        resumeUpload: z.string().min(1).nullish(),
        coverLetter: z.string().min(1).nullish(),
        portfolio: z.string().min(1).nullish(),
        transcript: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await ctx.prisma.application.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          jobPostingId: input.jobPostingId,
          resumeUpload: input.resumeUpload,
          portfolio: input.portfolio,
          transcript: input.transcript,
          coverLetter: input.coverLetter,
        },
      });
      return application;
    }),

  // Delete a Job Application (By a Candidate)
  deleteApplication: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        applicationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await ctx.prisma.application.deleteMany({
        where: {
          userId: input.userId,
          applicationId: input.applicationId,
        },
      });
      return application;
    }),
});
