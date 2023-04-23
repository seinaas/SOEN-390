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

  getJobPostingPreviews: protectedProcedure.query(async ({ ctx }) => {
    const userSkills = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        skills: true,
      },
    });

    const skills = new Set(userSkills?.skills ? userSkills.skills.toLowerCase().split(',') : []);

    const jobPostings = await ctx.prisma.jobPosting.findMany({
      select: {
        jobPostingId: true,
        jobTitle: true,
        company: true,
        location: true,
        jobSkills: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Sort job postings by number of matching skills
    const jobPostingsSorted = jobPostings.sort((a, b) => {
      const aSkills = new Set(a.jobSkills ? a.jobSkills.toLowerCase().split(',') : []);
      const bSkills = new Set(b.jobSkills ? b.jobSkills.toLowerCase().split(',') : []);

      const aScore = [...skills].filter((skill) => aSkills.has(skill)).length;
      const bScore = [...skills].filter((skill) => bSkills.has(skill)).length;

      return bScore - aScore;
    });

    return jobPostingsSorted;
  }),

  getJobPosting: protectedProcedure
    .input(z.object({ jobPostingId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.findUnique({
        where: {
          jobPostingId: input.jobPostingId,
        },
      });

      const isSaved = await ctx.prisma.savedJobPosting.findUnique({
        where: {
          userId_jobPostingId: {
            userId: ctx.session.user.id,
            jobPostingId: input.jobPostingId,
          },
        },
      });

      const isApplied = await ctx.prisma.appliedJobPosting.findUnique({
        where: {
          userId_jobPostingId: {
            userId: ctx.session.user.id,
            jobPostingId: input.jobPostingId,
          },
        },
      });

      const requiredDocuments: ('resume' | 'cover-letter' | 'portfolio' | 'transcript')[] = [];
      if (jobPosting?.requireResume) {
        requiredDocuments.push('resume');
      }
      if (jobPosting?.requireCoverLetter) {
        requiredDocuments.push('cover-letter');
      }
      if (jobPosting?.requirePortfolio) {
        requiredDocuments.push('portfolio');
      }
      if (jobPosting?.requireTranscript) {
        requiredDocuments.push('transcript');
      }

      return {
        ...jobPosting,
        jobSkills: jobPosting?.jobSkills ? jobPosting.jobSkills.split(',') : [],
        requiredDocuments,
        isSaved: !!isSaved,
        isApplied: !!isApplied,
      };
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

  // Toggle save a Job Posting
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

  // Get Saved Job Posting Previews
  getSavedJobPostingPreviews: protectedProcedure.query(async ({ ctx }) => {
    const savedJobPostings = await ctx.prisma.savedJobPosting.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        JobPosting: {
          select: {
            jobPostingId: true,
            jobTitle: true,
            company: true,
            location: true,
          },
        },
      },
    });
    return savedJobPostings?.map((s) => s.JobPosting);
  }),

  // Toggle apply to Job Posting
  toggleAppliedJobPosting: protectedProcedure
    .input(
      z.object({
        jobPostingId: z.string().min(1),
        applied: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.applied) {
        await ctx.prisma.appliedJobPosting.create({
          data: {
            userId: ctx.session.user.id,
            jobPostingId: input.jobPostingId,
          },
        });
      } else {
        await ctx.prisma.appliedJobPosting.delete({
          where: {
            userId_jobPostingId: {
              userId: ctx.session.user.id,
              jobPostingId: input.jobPostingId,
            },
          },
        });
      }
    }),

  // Get Applied Job Posting Previews
  getAppliedJobPostingPreviews: protectedProcedure.query(async ({ ctx }) => {
    const appliedJobPostings = await ctx.prisma.appliedJobPosting.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        JobPosting: {
          select: {
            jobPostingId: true,
            jobTitle: true,
            company: true,
            location: true,
          },
        },
      },
    });
    return appliedJobPostings?.map((s) => s.JobPosting);
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
        jobSkills: z.string().nullish(),
        applicationLink: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const jobPosting = await ctx.prisma.jobPosting.create({
        data: {
          ...input,
          jobSkills: input.jobSkills
            ?.split(',')
            .map((s) => s.trim())
            .join(','),
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
