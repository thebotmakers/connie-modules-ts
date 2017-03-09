export class Ticket {
    id: number;
    subject: string;
    custom_fields: Object[];
    comment: string;
    status: Ticket.STATUS;
    connieId: string;
}

export module Ticket {
    export enum STATUS{
        OPEN,
        PENDING,
        CLOSED
    }
}