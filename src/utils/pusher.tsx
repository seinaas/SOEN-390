import type { Channel, PresenceChannel } from 'pusher-js';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { env } from '../env/client.mjs';

type PusherZustandStore = {
  pusherClient: Pusher;
  channel?: Channel;
  members: Map<string, string>;
};

// Initializes a store containing a Pusher client and channel to be accessed by any component
const createPusherStore = () => {
  let pusherClient: Pusher;
  if (Pusher.instances.length) {
    pusherClient = Pusher.instances[0] as Pusher;
    if (pusherClient.connection.state === 'disconnected') {
      pusherClient.connect();
    }
  } else {
    pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth-channel',
      userAuthentication: {
        transport: 'ajax',
        endpoint: '/api/pusher/auth-user',
      },
    });
  }

  const store = createStore(() => {
    return {
      pusherClient,
      members: new Map(),
    };
  });

  return store;
};

let pusherStore: StoreApi<PusherZustandStore>;
export function initPusher() {
  // Only initialize the store if it hasn't been initialized yet
  if (!pusherStore) {
    pusherStore = createPusherStore();
  }
}

// Sign user into Pusher and subscribe to presence channel to track online activity
export function pusherAuth() {
  const pusherClient = pusherStore.getState().pusherClient;
  if (!pusherClient.user.user_data) {
    console.log('hereherhehrehrehrehrehrehrehreherherhere');
    console.log(pusherClient.user.user_data);

    const presenceChannel = pusherClient.subscribe('presence-channel') as PresenceChannel;

    // Update helper that sets 'members' to contents of presence channel's current members
    const updateMembers = () => {
      pusherStore.setState(() => ({
        members: new Map(Object.entries(presenceChannel.members.members as Record<string, string>)),
      }));
    };

    // Bind all "present users changed" events to trigger updateMembers
    presenceChannel.bind('pusher:subscription_succeeded', updateMembers);
    presenceChannel.bind('pusher:member_added', updateMembers);
    presenceChannel.bind('pusher:member_removed', updateMembers);

    pusherClient.signin();
  }
}

export function connectToChannel(userId: string) {
  if (!pusherStore || pusherStore.getState().channel?.name === userId) return;
  pusherStore.setState(() => ({
    channel: pusherStore.getState().pusherClient.subscribe(`${userId}`),
  }));
}

/**
 * Hooks
 *
 * The exported hooks you use to interact with the store
 */

// Subscribe to an event on the channel
export function useSubscribeToChannelEvent<MessageType>(eventName: string, callback: (data: MessageType) => void) {
  const channel = useStore(pusherStore, (state) => state.channel);

  const stableCallback = useRef(callback);

  // Keep callback sync'd
  useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };
    channel?.bind(eventName, reference);
    return () => {
      channel?.unbind(eventName, reference);
    };
  }, [channel, eventName]);
}

export function useSubscribeToUserEvent<MessageType>(eventName: string, callback: (data: MessageType) => void) {
  const pusher = useStore(pusherStore, (state) => state.pusherClient);

  const stableCallback = useRef(callback);

  // Keep callback sync'd
  useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };
    pusher.user.bind(eventName, reference);
    return () => {
      pusher.user.unbind(eventName, reference);
    };
  }, [pusher, eventName]);
}

// Retrieve the current number of members in the presence channel
export const useCurrentMemberCount = () => useStore(pusherStore, (s) => s.members.size);

export { pusherStore };
