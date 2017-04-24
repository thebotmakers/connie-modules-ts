import { QnaAnswer } from '../';
import * as _ from 'lodash';
import { IIntentRecognizer, IIntentRecognizerResult, IIntent, IEntity } from 'botbuilder';
import { EventEmitter } from 'events';
import { QnaClient } from './qnaclient';

export class FaqRecognizer extends EventEmitter implements IIntentRecognizer {

    private intentThreshold: number;

    constructor(private qnaClient: QnaClient, intentThreshold: number) {
        super();

        this.intentThreshold = intentThreshold;
    };

    recognize(context, callback) {

        // Disable bot responses to talk to human.
        if (context.message.user.handOff) {
            return;
        }

        var result: IIntentRecognizerResult = { score: 0.0, intent: null };

        if (context && context.message && context.message.text) {
            let textClean = context.message.text.replace(/(\r\n|\n|\r)/gm, " ");

            this.qnaClient.getAnswer(textClean, 3).then(answers => {
                // map entities to botbuilder format
                //result.entities = (answers as Array<QnaAnswer>).map<IEntity>(e => ({ type: "answer", entity: e.answer, startIndex: 0, endIndex: 1 }))


                // map intents to botbuilder format
                result.intents = (answers as Array<QnaAnswer>).map<IIntent>(i => ({ intent: "faq", score: i.score }));

                let top = answers.sort((a, b) => a.score - b.score)[answers.length - 1];

                //filter intents with less than intentThreshold
                result.score = (top.score / 100) < this.intentThreshold ? 0 : (top.score / 100);
                result.intent = "faq";

                //Add intent and score to message object
                context.message.intent = result.intent;
                context.message.score = result.score;
                context.message.answer = top.answer;

                this.emit('onRecognize', context);
                callback(null, result);
            });            
        }
        else {
            callback(null, result);
        }
    };
}