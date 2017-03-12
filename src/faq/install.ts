import { QnaPair } from './model/QnaModels';
import { QnaClient } from './model/qnaclient';
import { UniversalBot } from 'botbuilder';
import { Application } from 'express';

let qnaClient: QnaClient;

export function install(bot: UniversalBot, server: Application, knowledgeBaseId: string, subscriptionKey: string) {

    //  setup QnA client
    qnaClient = new QnaClient(knowledgeBaseId, subscriptionKey);

    //setup api endpoint 
    server.get('/api/faq', (req, res, next) => {

        qnaClient.getQnAList().then(list => {
            res.send(list);
        });     
    });

    server.patch('/api/faq/add', (req, res, next) => {
        debugger;
        let qnaPair = new QnaPair(req.body.question, req.body.answer);
        qnaClient.addQnaPair(qnaPair).then(response => {
            res.send(response);
        });     
    });
}
