import { QnaPair, QnaAnswer } from './QnaModels';
import * as request from 'request-promise-native';
var _ = require('lazy.js');

export class QnaClient {

    private KNOWLEDGE_BASE_ID: string;
    private SUBSCRIPTION_KEY: string;
    private url_base: string;


    constructor(knowledgeBaseId: string, subscriptionKey: string) {
        this.KNOWLEDGE_BASE_ID = knowledgeBaseId;
        this.SUBSCRIPTION_KEY = subscriptionKey;
        this.url_base = `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/${this.KNOWLEDGE_BASE_ID}`;
    }

    getQnAList(): Promise<QnaPair[]> { //GET

        return request.get({
            url: this.url_base,
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY }
        }).then(response => {

            let result: QnaPair[] = [];
            if (response.error) {
                console.log(`Error: Could not download QnA list from ${this.url_base}`);
                return null;
            }
            else {
                let tsvUrl = response.replace(new RegExp('"', 'g'), '').replace('https', 'http');

                return request.get(tsvUrl).then(response => {
                    if (response.error) {
                        console.log(`Error: Could not download file from ${tsvUrl}`);
                        return null;
                    }
                    else {
                        return this.readTsvFile(response);
                    }
                })
            }
        });
    }

    addQnaPair(qnaPair: QnaPair): Promise<any> { //PATCH
        return request.patch({
            url: this.url_base,
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY },
            body: `{
                "add": {
                    "qnaPairs": [
                        {
                            "answer": "${qnaPair.answer}",
                            "question": "${qnaPair.question}"
                        }
                    ]
                }
            }`
        }).then(response => {
            this.publish();
        });
    }

    deleteQnaPair(qnaPair: QnaPair): Promise<any> { //PATCH
        return request.patch({
            url: this.url_base,
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY },
            body: `{
                "delete": {
                    "qnaPairs": [
                        {
                            "answer": "${qnaPair.answer}",
                            "question": "${qnaPair.question}"
                        }
                    ]
                }
            }`
        }).then(response => {
            this.publish();
        });
    }

    getAnswer(question: string, top: number): Promise<QnaAnswer[]> { //POST
        let result = [];
        return request.post({
            url: this.url_base + '/generateAnswer',
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY },
            body: `{
                "question": "${question}",
                "top": "${top}"
            }`
        }).then(response => {
            let answerRes = JSON.parse(response);
            if(answerRes && answerRes.answers)
            {
                answerRes.answers.forEach(answer => {
                    result.push(new QnaAnswer(answer.answer, answer.score));
                });
            }
            return result;
        });
    }

    publish(): Promise<any> {
        return request.put({
            url: this.url_base,
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY }
        }).then(response => {
            //everything ok and published
            return 'OK';
        });
    }

    private readTsvFile(fileContent: string): QnaPair[] {
        let result = [];
        var lines = fileContent.split('\r\n');
        if ((!lines.length) || (lines.length == 1)) return [];
        var header = lines.shift().split(/\t/);

        lines.forEach(line => {
            var fields = line.split(/\t/);
            if (_(fields).compact().isEmpty()) return;
            result.push(new QnaPair(fields[0], fields[1]));
        });

        return result;
    }
}
