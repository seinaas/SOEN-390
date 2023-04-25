/*
 *   Channel Authorization Check
 *
 *
 *   This is a Next.js API route that authorizes a user to access a Pusher channel. The handler function extracts the channel
 *   name and socket ID from the request body, and then retrieves the user's authentication session using the getServerAuthSession
 *   function. The function checks if the user is allowed to access the channel and sends a 404 status code if they are not.
 *   If the user is allowed, the function generates an authorization object using the pusherServerClient and returns it as a response.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../server/auth';
import { pusherServerClient } from '../../../server/pusher';

type PusherReq = {
  channel_name: string;
  socket_id: string;
};

// This is the API route that Pusher will call to authorize the user
// https://pusher.com/docs/channels/server_api/authorizing-users/
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { channel_name, socket_id } = req.body as PusherReq;
  const data = await getServerAuthSession({ req, res });

  // TODO: Check if user is allowed to access channel
  if (!data?.user || !socket_id) {
    res.status(404).send('Failed');
    return;
  }

  const auth = pusherServerClient.authorizeChannel(socket_id, channel_name, {
    user_id: data.user.id,
    user_info: {
      name: `${data.user.firstName as string} ${data.user.lastName as string}`,
    },
  });
  res.send(auth);
};

export default handler;
