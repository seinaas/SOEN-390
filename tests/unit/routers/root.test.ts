import { trpcRequest } from '../../utils';

describe('root', () => {
  describe('search', () => {
    it('should fuzzy search for users by headline and first and last names', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const query = jest.spyOn(request.ctx.prisma, '$queryRaw').mockImplementation();

      await request.caller.search({ query: 'john doe' });
      expect(query).toHaveBeenCalledWith(
        expect.anything(),
        {
          strings: ['', ' AND lower(concat(firstName, lastName)) LIKE ', ''],
          values: ['%john%', '%doe%'],
        },
        {
          strings: ['', ' AND lower(headline) LIKE ', ''],
          values: ['%john%', '%doe%'],
        },
      );
    });
    it('should fuzzy search for jobs by title, company, job type, and workplace type', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const query = jest.spyOn(request.ctx.prisma, '$queryRaw').mockImplementation();

      await request.caller.search({ query: 'job search' });
      expect(query.mock.calls[1]).toEqual([
        expect.anything(),
        {
          strings: ['', ' AND lower(concat(jobTitle, company, jobType, workplaceType)) LIKE ', ''],
          values: ['%job%', '%search%'],
        },
      ]);
    });
    it('should return null if input is shorter than 3 characters', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const data = await request.caller.search({ query: 'jo' });
      expect(data).toBeNull();
    });
  });
});
