import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { jobType, workplaceType } from '@prisma/client';

/**
 * This Job Posting Router contains all the API routes that need to be implemented for the Job Posting Feature.
 * It contains all the procedures related to job postings.
 * This includes getting all job postings, creating/updating/deleting job postings.
 */

export const jobPostingRouter = createTRPCRouter({
  // Get all Job Postings (for the user's feed)
  getJobPostings: protectedProcedure.query(async ({ ctx }) => {
    const jobPostings = await ctx.prisma.jobPosting.findMany({});
    return jobPostings;
  }),

  // Get all Job Postings created by a user and the associated applications (in this case a recruiter)
  getRecruiterJobPostings: protectedProcedure.query(async ({ ctx }) => {
    const jobPostings = await ctx.prisma.jobPosting.findMany({
      where: {
        recruiterId: ctx.session.user.id,
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
  getSavedJobPostings: protectedProcedure.query(async ({ ctx }) => {
    const savedJobPostings = await ctx.prisma.savedJobPosting.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        JobPosting: true,
      },
    });
    return savedJobPostings?.map((s) => s.JobPosting);
  }),

  // Create a Job Posting (By a Recruiter)
  createJobPosting: protectedProcedure
    .input(
      z.object({
        jobTitle: z.string().min(1),
        company: z.string().min(1),
        location: z.string().min(1).nullish(),
        jobType: z.nativeEnum(jobType),
        workplaceType: z.nativeEnum(workplaceType),
        description: z.string().min(1).nullish(),
        requireResume: z.boolean().default(false),
        requireCoverLetter: z.boolean().default(false),
        requirePortfolio: z.boolean().default(false),
        requireTranscript: z.boolean().default(false),
        jobSkills: z.string().min(1).nullish(),
        applicationLink: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.create({
        data: {
          ...input,
          recruiterId: ctx.session.user.id,
        },
      });
      return jobPosting;
    }),

  // Update a Job Posting (By a Recruiter)
  editJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        jobTitle: z.string().min(1).optional(),
        company: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        jobType: z.nativeEnum(jobType).optional(),
        workplaceType: z.nativeEnum(workplaceType).optional(),
        description: z.string().min(1).optional(),
        requireResume: z.boolean().optional(),
        requireCoverLetter: z.boolean().optional(),
        requirePortfolio: z.boolean().optional(),
        requireTranscript: z.boolean().optional(),
        jobSkills: z.string().min(1).optional(),
        applicationLink: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'jobPostingId'> & Pick<Partial<typeof input>, 'jobPostingId'> = {
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
        jobPostingId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const JobPosting = await ctx.prisma.jobPosting.deleteMany({
        where: {
          recruiterId: ctx.session.user.id,
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
        },
      });
      return application;
    }),

  // Get all Job Applications (By a Candidate)
  getApplications: protectedProcedure.query(async ({ ctx }) => {
    const applications = await ctx.prisma.application.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        JobPosting: true,
      },
    });
    return applications;
  }),

  // Delete a Job Application (By a Candidate)
  deleteApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const application = await ctx.prisma.application.deleteMany({
        where: {
          userId: ctx.session.user.id,
          applicationId: input.applicationId,
        },
      });
      return application;
    }),
});