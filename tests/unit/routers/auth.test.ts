import { type TRPCError } from '@trpc/server';
import { trpcRequest } from '../../utils';

describe('auth', () => {
  describe('register', () => {
    it('should throw an error if passwords do not match', async () => {
      try {
        await trpcRequest().caller.auth.register({
          email: 'test@test.com',
          password: 'test',
          confirmPassword: 'test2',
        });
      } catch (e) {
        expect((e as TRPCError).message).toEqual('Passwords do not match');
      }
    });
    it('should throw an error if user already exists', async () => {
      const request = trpcRequest();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({} as any);
      try {
        await request.caller.auth.register({
          email: 'test@test.com',
          password: 'test',
          confirmPassword: 'test',
        });
      } catch (e) {
        expect((e as TRPCError).message).toEqual('User already exists');
      }
    });
    it('should throw an error if user or account creation fails', async () => {
      const request = trpcRequest();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);
      request.ctx.prisma.user.create.mockResolvedValueOnce({ id: '1' } as any);
      request.ctx.prisma.account.create.mockResolvedValueOnce(null as any);

      try {
        await request.caller.auth.register({
          email: 'test@test.com',
          password: 'test',
          confirmPassword: 'test',
        });
      } catch (e) {
        expect((e as TRPCError).message).toEqual('Something went wrong');
      }
    });
    it('should create user and account', async () => {
      const request = trpcRequest();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      const createUser = jest.spyOn(request.ctx.prisma.user, 'create').mockImplementation((() => {
        return Promise.resolve({
          id: '1',
        } as any);
      }) as any);
      const createAccount = jest.spyOn(request.ctx.prisma.account, 'create').mockImplementation((() => {
        return {};
      }) as any);

      await request.caller.auth.register({
        email: 'test@test.com',
        password: 'test',
        confirmPassword: 'test',
      });

      expect(createUser).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@test.com',
        }),
      });
      expect(createAccount).toHaveBeenCalled();
    });
  });
});
