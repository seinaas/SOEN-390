/*
 *		Pusher Environment Initializer
 *
 *
 *		This code imports the PusherServer library and the env object. It creates a new pusherServerClient object using the PusherServer constructor
 * 		and passes in the env object to configure it. The pusherServerClient is used as a WebSocket server-side client responsible for triggering events from the API.
 */
import PusherServer from 'pusher';
import { env } from '../env/server.mjs';

// WebSocket server-side client responsible for triggering events from the API
export const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});
