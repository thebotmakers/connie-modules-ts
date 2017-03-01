import { IIntentRecognizerResult, IIntentRecognizer } from 'botbuilder';
import { User } from '../users';
import { ConnieMessage, Conversation } from './model/Conversation';
import { UniversalBot } from 'botbuilder';
import { Db } from 'mongodb';
import { WatsonRecognizer } from 'botframework-watson-recognizer';

export function install(bot: UniversalBot, db: Db, recognizer: WatsonRecognizer) {

    recognizer.setCallback(onRecognize);
    let collection = db.collection('conversations');

    bot.use(
        {
            receive: (event: any, next) => {
                if (event.type == "message") {
                    let conversation = new Conversation();
                    conversation.conversationId = event.address.conversation.id;
                    let message = new ConnieMessage();
                    message = event;
                    message.address = event.address;
                    message.sender = "user";

                    collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
                        { $push: { "messages": message } }, { upsert: true });

                    console.log('------------receive        event');
                }

                next();
            },
            send: (event: any, next) => {
                let conversation = new Conversation();
                conversation.conversationId = event.address.conversation.id;
                let message = new ConnieMessage();
                message = event;
                message.address = event.address;
                message.sender = "bot";

                collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
                    { $push: { "messages": message } }, { upsert: true });
                    
                console.log('------------send           event');
                next();
            }
        });

    function onRecognize(data: any) {
        collection.update({ 'messages.text': data.message.text, 'conversationId': data.message.address.conversation.id },
            { $set: { 'messages.$.intent': data.message.intent, 'messages.$.score': data.message.score } });
    }
}