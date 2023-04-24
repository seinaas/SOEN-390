import { trpcRequest } from '../../utils';

describe('postings', () => {
  describe('getJobPostings', () => {
    it('should return all job postings', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.jobPosting.findMany.mockResolvedValueOnce([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ] as any);
      const jobPostings = await request.caller.jobPosting.getJobPostings();
      expect(jobPostings).toEqual([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('getJobPostingPreviews', () => {
    it('should return all job posting previews', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.jobPosting.findMany.mockResolvedValueOnce([
        {
          jobPostingId: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ] as any);
      const jobPostings = await request.caller.jobPosting.getJobPostingPreviews();
      expect(jobPostings).toEqual([
        {
          jobPostingId: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('getJobPosting', () => {
    it('should return a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.jobPosting.findUnique.mockResolvedValueOnce({
        jobPostingId: '1',
        jobTitle: 'test',
        company: 'test',
        location: 'test',
        description: 'test',
        jobType: 'FullTime',
        workplaceType: 'Remote',
        jobSkills: 'test,test2',
        requireResume: true,
        createdAt: date,
        updatedAt: date,
      } as any);
      request.ctx.prisma.savedJobPosting.findUnique.mockResolvedValueOnce({
        userId: '1',
        jobPostingId: '1',
      } as any);
      request.ctx.prisma.appliedJobPosting.findUnique.mockResolvedValueOnce(null);

      const jobPosting = await request.caller.jobPosting.getJobPosting({
        jobPostingId: '1',
      });

      expect(jobPosting).toEqual({
        jobPostingId: '1',
        jobTitle: 'test',
        company: 'test',
        location: 'test',
        description: 'test',
        jobType: 'FullTime',
        workplaceType: 'Remote',
        jobSkills: ['test', 'test2'],
        requireResume: true,
        createdAt: date,
        updatedAt: date,
        isSaved: true,
        isApplied: false,
        requiredDocuments: ['resume'],
      });
    });
  });

  describe('getRecruiterJobPostings', () => {
    it('should return all job postings created by a recruiter', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.jobPosting.findMany.mockResolvedValueOnce([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ] as any);
      const jobPostings = await request.caller.jobPosting.getRecruiterJobPostings();
      expect(jobPostings).toEqual([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('toggleSavedJobPosting', () => {
    it('should save a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      request.ctx.prisma.savedJobPosting.create.mockResolvedValueOnce({
        userId: '1',
        jobPostingId: '1',
      } as any);
      const result = await request.caller.jobPosting.toggleSavedJobPosting({
        jobPostingId: '1',
        saved: true,
      });
      expect(result).toBeUndefined();
    });

    it('should unsave a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      request.ctx.prisma.savedJobPosting.delete.mockResolvedValueOnce({
        userId: '1',
        jobPostingId: '1',
      } as any);
      const result = await request.caller.jobPosting.toggleSavedJobPosting({
        jobPostingId: '1',
        saved: false,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getSavedJobPostingPreviews', () => {
    it('should return all saved job postings', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.savedJobPosting.findMany.mockResolvedValueOnce([
        {
          id: '1',
          JobPosting: {
            id: '1',
            title: 'test',
            description: 'test',
            jobType: 'FullTime',
            workplaceType: 'Remote',
            createdAt: date,
            updatedAt: date,
          },
        },
      ] as any);
      const jobPostings = await request.caller.jobPosting.getSavedJobPostingPreviews();
      expect(jobPostings).toEqual([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('toggleAppliedJobPosting', () => {
    it('should apply to a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      request.ctx.prisma.appliedJobPosting.create.mockResolvedValueOnce({
        userId: '1',
        jobPostingId: '1',
      } as any);
      const result = await request.caller.jobPosting.toggleAppliedJobPosting({
        jobPostingId: '1',
        applied: true,
      });
      expect(result).toBeUndefined();
    });

    it('should unapply to a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      request.ctx.prisma.appliedJobPosting.delete.mockResolvedValueOnce({
        userId: '1',
        jobPostingId: '1',
      } as any);
      const result = await request.caller.jobPosting.toggleAppliedJobPosting({
        jobPostingId: '1',
        applied: false,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getAppliedJobPostingPreviews', () => {
    it('should return all applied job postings', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.appliedJobPosting.findMany.mockResolvedValueOnce([
        {
          id: '1',
          JobPosting: {
            id: '1',
            title: 'test',
            description: 'test',
            jobType: 'FullTime',
            workplaceType: 'Remote',
            createdAt: date,
            updatedAt: date,
          },
        },
      ] as any);
      const jobPostings = await request.caller.jobPosting.getAppliedJobPostingPreviews();
      expect(jobPostings).toEqual([
        {
          id: '1',
          title: 'test',
          description: 'test',
          jobType: 'FullTime',
          workplaceType: 'Remote',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('createJobPosting', () => {
    it('should create a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.jobPosting.create.mockResolvedValueOnce({
        id: '1',
        title: 'test',
        description: 'test',
        jobType: 'FullTime',
        workplaceType: 'Remote',
        createdAt: date,
        updatedAt: date,
      } as any);
      const jobPosting = await request.caller.jobPosting.createJobPosting({
        jobTitle: 'test',
        description: 'test',
        company: 'test',
        jobType: 'FullTime',
        workplaceType: 'Remote',
      });
      expect(jobPosting).toEqual({
        id: '1',
        title: 'test',
        description: 'test',
        jobType: 'FullTime',
        workplaceType: 'Remote',
        createdAt: date,
        updatedAt: date,
      });
    });
  });

  describe('editJobPosting', () => {
    it('should edit a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const edit = jest.spyOn(request.ctx.prisma.jobPosting, 'update').mockImplementation();

      await request.caller.jobPosting.editJobPosting({
        jobPostingId: '1',
        jobTitle: 'test',
      });

      expect(edit).toHaveBeenCalledWith({
        where: {
          jobPostingId: '1',
        },
        data: {
          jobTitle: 'test',
        },
      });
    });
  });

  describe('deleteJobPosting', () => {
    it('should delete a job posting', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const deleteJobPosting = jest.spyOn(request.ctx.prisma.jobPosting, 'deleteMany').mockImplementation();

      await request.caller.jobPosting.deleteJobPosting({
        jobPostingId: '1',
      });

      expect(deleteJobPosting).toHaveBeenCalledWith({
        where: {
          jobPostingId: '1',
          recruiterId: '1',
        },
      });
    });
  });

  describe('createApplication', () => {
    it('should create an application', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.application.create.mockResolvedValueOnce({
        id: '1',
        userId: '1',
        jobPostingId: '1',
        createdAt: date,
        updatedAt: date,
      } as any);
      const application = await request.caller.jobPosting.createApplication({
        jobPostingId: '1',
      });
      expect(application).toEqual({
        id: '1',
        userId: '1',
        jobPostingId: '1',
        createdAt: date,
        updatedAt: date,
      });
    });
  });

  describe('getApplications', () => {
    it('should return all user applications', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const date = new Date();
      request.ctx.prisma.application.findMany.mockResolvedValueOnce([
        {
          id: '1',
          userId: '1',
          jobPostingId: '1',
          createdAt: date,
          updatedAt: date,
        },
      ] as any);
      const applications = await request.caller.jobPosting.getApplications();
      expect(applications).toEqual([
        {
          id: '1',
          userId: '1',
          jobPostingId: '1',
          createdAt: date,
          updatedAt: date,
        },
      ]);
    });
  });

  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const deleteApplication = jest.spyOn(request.ctx.prisma.application, 'deleteMany').mockImplementation();

      await request.caller.jobPosting.deleteApplication({
        applicationId: '1',
      });

      expect(deleteApplication).toHaveBeenCalledWith({
        where: {
          applicationId: '1',
          userId: '1',
        },
      });
    });
  });
});
