import { DirectMessages, Messages, User } from '@prisma/client';

export type Conversation = DirectMessages & {
    messages: Messages[];
    user1: User;
    user2: User;
}

export type Message = Messages & { sender: User, receiver: User };