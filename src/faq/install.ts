import { Faq, QnaPair } from './model/QnaModels';
import { QnaClient } from './model/qnaclient';
import { UniversalBot } from 'botbuilder';
import { Application } from 'express';

let qnaClient: QnaClient;

export function install(bot: UniversalBot, server: Application, knowledgeBaseId: string, subscriptionKey: string) {
    
    //  setup QnA client
    qnaClient = new QnaClient(knowledgeBaseId, subscriptionKey);

    server.get('/api/faq', (req, res, next) => {

        qnaClient.getFaq().then(faq => {
            res.send(faq);
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
}
