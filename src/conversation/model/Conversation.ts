import { Message } from 'botbuilder';

export class Conversation {
    conversationId: string;
    messages: ConnieMessage[];
    custom: any;
}

export class ConnieMessage extends Message {
    sender: string;
    intent: string;
    score: number;
}