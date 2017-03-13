import * as _ from 'lodash';

export class QnaPair {

    constructor(public question: string, public answer: string) {
    }
}

export class QnaAnswer {

    constructor(public answer: string, public score: number) {
    }
}

export class Faq {

    qnas: QnA[] = [];

    constructor(qnaPairs?: QnaPair[]) {

        if (qnaPairs) {
            const groupedPairs = _.groupBy(qnaPairs, 'answer');

            _.each(groupedPairs, (pairs, answer) => {

                const qna = new QnA([], answer)
                this.qnas.push(qna);

                _.each(pairs, pair => {
                    qna.questions.push(new Question(pair.question))
                });
            })
        }
    }

    toQnaPairs(): QnaPair[] {

        const pairs: QnaPair[] = []

        _.each(this.qnas, qna => {

            _.each(qna.questions, question => {

                pairs.push(new QnaPair(question.text, qna.answer));
            })
        })

        return pairs;
    }
}

export class QnA {

    constructor(public questions: Question[], public answer: string) {

        this.questions = [];
    }

    toQnaPair(): QnaPair[] {

        return this.questions.map(q => new QnaPair(q.text, this.answer))
    }
}
export class Question {

    constructor(public text: string) {

    }
}