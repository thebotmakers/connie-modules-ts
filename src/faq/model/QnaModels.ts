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
}

export class QnA {

    constructor(public questions: Question[], public answer: string) {

        this.questions = [new Question("")];
    }

    toQnaPair(): QnaPair[] {

        return this.questions.map(q => new QnaPair(q.text, this.answer))
    }
}
export class Question {

    constructor(public text: string) {

    }
}