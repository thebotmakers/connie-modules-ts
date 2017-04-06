import { FaqRecognizer } from './model/faqRecognizer';
import { Faq, QnaPair } from './model/QnaModels';
import { QnaClient } from './model/qnaclient';
import { UniversalBot, IntentDialog } from 'botbuilder';
import { Application } from 'express';
import { TextUtils } from '../botframework';

let qnaClient: QnaClient;

export function install(bot: UniversalBot, server: Application, intents: IntentDialog, knowledgeBaseId: string, subscriptionKey: string, intentThreshold: number) {

    //  setup QnA client
    qnaClient = new QnaClient(knowledgeBaseId, subscriptionKey);

    //create recognizer
    let faqRecognizer: FaqRecognizer = new FaqRecognizer(qnaClient, intentThreshold);

    //install recognizer
    intents.recognizer(faqRecognizer);

    //add dialog for Faq
    intents.matches('faq', '/faq');

    bot.dialog(`/faq`,
        [
            (session: any) => {
                var messages = TextUtils.split(session.message.answer, 640);
                messages.forEach(function (text, index) {
                    session.send(text);
                });
                session.endConversation();
            }
        ]);

    ////////////// API /////////////////

    server.get('/api/faq', (req, res, next) => {

        qnaClient.getFaq().then(faq => {
            res.send(faq);
            next();
        });
    });

    server.patch('/api/faq', (req, res, next) => {
        let faq = new Faq();
        faq.qnas = req.body.qnas;

        qnaClient.updateQnaPairs(faq).then(response => {

            res.send(response);
            next();
        });
    });

    server.put('/api/faq', (req, res, next) => {
        qnaClient.publish().then(response => {
            res.send(response);
            next();
        });
    });

    server.post('/api/faq/generateAnswer', (req, res, next) => {
        let question = req.body.question;
        let top = req.body.top;
        qnaClient.getAnswer(question, top).then(response => {
            res.send(response);
            next();
        });
    });

    //not used anymore
    server.patch('/api/faq/add', (req, res, next) => {
        let qnaPair = new QnaPair(req.body.question, req.body.answer);
        qnaClient.addQnaPair(qnaPair).then(response => {
            res.send(response);
            next();
        });
    });

    //not used anymore
    server.patch('/api/faq/delete', (req, res, next) => {
        let qnaPair = new QnaPair(req.body.question, req.body.answer);
        qnaClient.deleteQnaPair(qnaPair).then(response => {
            res.send(response);
            next();
        });
    });
}
