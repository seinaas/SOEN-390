import type { NextApiRequest, NextApiResponse } from 'next';
import { pusherServerClient } from '../../../server/pusher';
import { getServerAuthSession } from '../../../server/auth';

type PusherReq = {
  channel_name: string;
  socket_id: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { socket_id } = req.body as PusherReq;
  const data = await getServerAuthSession({ req, res });

  if (!data?.user || !socket_id) {
    res.status(404).send('Failed');
    return;
  }

  const auth = pusherServerClient.authenticateUser(socket_id, {
    id: data.user.id,
  });
  res.send(auth);
};

export default handler;
