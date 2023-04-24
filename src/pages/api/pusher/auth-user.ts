/*
*   User Authorization Check
*
*
*   This is a Next.js API route that authorizes a user for Pusher. It takes in a socket ID from the request body 
*   and uses it to authenticate the user with Pusher. The user's ID is retrieved from the server session. If the user or socket 
*   ID is not found, a 404 error response is returned. Finally, the authentication data is sent as the response.
*/
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
