import { createUser, trpcRequest } from '../../utils';

describe('user', () => {
  describe('search', () => {
    it('should fuzzy search for users', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const query = jest.spyOn(request.ctx.prisma, '$queryRaw').mockImplementation();

      await request.caller.user.search({ query: 'john doe' });
      expect(query).toHaveBeenCalledWith(expect.anything(), {
        strings: ['', ' AND lower(concat(firstName, lastName)) LIKE ', ''],
        values: ['%john%', '%doe%'],
      });
    });
    it('should return null if input is shorter than 3 characters', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const data = await request.caller.user.search({ query: 'jo' });
      expect(data).toBeNull();
    });
  });
  describe('getByEmail', () => {
    it('should return user by email', async () => {
      const request = trpcRequest();

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '1',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };
      const expectedUser = {
        ...userBase,
        languages: [],
        skills: [],
        numConnections: 0,
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      const data = await request.caller.user.getByEmail({ email: 'john@doe.com' });
      expect(data).toEqual(expectedUser);
    });
    it('should return user by id', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '1',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };
      const expectedUser = {
        ...userBase,
        languages: [],
        skills: [],
        numConnections: 0,
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      const data = await request.caller.user.getByID({ id: '1' });
      expect(data).toEqual(expectedUser);
    });
    it('should update a user', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const update = jest.spyOn(request.ctx.prisma.user, 'update');

      await request.caller.user.update({ firstName: 'Test' });
      expect(update).toHaveBeenCalledWith({
        data: {
          firstName: 'Test',
        },
        where: {
          id: '1',
        },
      });
    });
  });
  describe('addJob', () => {
    it('should add a job to a user', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const create = jest.spyOn(request.ctx.prisma.job, 'create');
      const date = new Date('2021-01-01');
      await request.caller.user.addJob({
        company: 'Test',
        startDate: date,
        endDate: date,
        title: 'Test',
      });
      expect(create).toHaveBeenCalledWith({
        data: {
          company: 'Test',
          startDate: date,
          endDate: date,
          title: 'Test',
          userId: '1',
        },
      });
    });
  });
  describe('updateJob', () => {
    it('should update a job', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const update = jest.spyOn(request.ctx.prisma.job, 'update');
      const date = new Date('2021-01-01');
      await request.caller.user.updateJob({
        jobId: '1',
        company: 'Test',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-01-01'),
        title: 'Test',
      });
      expect(update).toHaveBeenCalledWith({
        data: {
          company: 'Test',
          startDate: date,
          endDate: date,
          title: 'Test',
        },
        where: {
          jobId: '1',
        },
      });
    });
  });
  describe('addEducation', () => {
    it('should add an education to a user', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const create = jest.spyOn(request.ctx.prisma.education, 'create');
      const date = new Date('2021-01-01');
      await request.caller.user.addEducation({
        school: 'Test',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-01-01'),
        degree: 'Test',
      });
      expect(create).toHaveBeenCalledWith({
        data: {
          school: 'Test',
          degree: 'Test',
          startDate: date,
          endDate: date,
          userId: '1',
        },
      });
    });
  });
  describe('updateEducation', () => {
    it('should update an education', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const update = jest.spyOn(request.ctx.prisma.education, 'update');
      const date = new Date('2021-01-01');
      await request.caller.user.updateEducation({
        educationId: '1',
        school: 'Test',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-01-01'),
        degree: 'Test',
      });
      expect(update).toHaveBeenCalledWith({
        data: {
          school: 'Test',
          startDate: date,
          endDate: date,
          degree: 'Test',
        },
        where: {
          educationId: '1',
        },
      });
    });
  });
});
