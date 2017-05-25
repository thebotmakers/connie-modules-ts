import { IIntentRecognizerResult, IIntentRecognizer } from 'botbuilder';
import { User } from '../users';
import { ConnieMessage, Conversation } from './model/Conversation';
import { UniversalBot } from 'botbuilder';
import { Db, Collection } from 'mongodb';
import { WatsonRecognizer } from 'botframework-watson-recognizer';

export function install(bot: UniversalBot, db: Db, recognizer: WatsonRecognizer) {

    recognizer.on('onRecognize', onRecognize);
    let collection = db.collection('conversations');
    collection.createIndex({ conversationId: 1 });

    bot.use(
        {
            receive: (event: any, next: Function) => {
                onReceive(event, collection);
                next();
            },
            send: (event: any, next) => {
                onSend(event, collection);
                next();
            }
        });

    function onRecognize(data: any) {
        collection.update({ 'messages.text': data.message.text, 'conversationId': data.message.address.conversation.id },
            { $set: { 'messages.$.intent': data.message.intent, 'messages.$.score': data.message.score } });
    }
}

export function installGeneric(bot: UniversalBot, db: Db) {

    let collection = db.collection('conversations');
    collection.createIndex({ conversationId: 1 });

    bot.use(
        {
            receive: (event: any, next: Function) => {
                onReceive(event, collection);
                next();
            },
            send: (event: any, next) => {
                onSend(event, collection);
                next();
            }
        });
}

function onReceive(event: any, collection: Collection) {
    if (event.type == "message") {
        let conversation = new Conversation();
        conversation.conversationId = event.address.conversation.id;
        let message = new ConnieMessage();
        message = event;
        message.address = event.address;
        message.sender = "user";

        collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
            { $push: { "messages": message } }, { upsert: true });
    }
}

function onSend(event: any, collection: Collection) {
    if (event.type == "message") {
        let conversation = new Conversation();
        conversation.conversationId = event.address.conversation.id;
        let message = new ConnieMessage();
        message = event;
        message.address = event.address;
        message.sender = "bot";

        collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
            { $push: { "messages": message } }, { upsert: true });
    }
}