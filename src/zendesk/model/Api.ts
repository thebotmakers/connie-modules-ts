
import { IAddress } from 'botbuilder';
import { Ticket } from './Ticket';
import { Server } from 'restify'
import { Db, Collection } from 'mongodb'

var Zendesk = require('zendesk-node-api');

export class Api {

    zendesk_url: string
    zendesk_account: string
    zendesk_token: string
    zendesk: any

    constructor(zendesk_url: any, zendesk_account: any, zendesk_token: any) {

        this.zendesk = new Zendesk({
            url: this.zendesk_url,
            email: this.zendesk_account,
            token: this.zendesk_token
        });
    }

    getTicket(id: number): Promise<any> {
        var self = this

        let tickets = this.zendesk.tickets.show(id).then(function(result){

            return self.asMessage(result)
        
        });
        
        return Promise.resolve(tickets);
    }

    createTicket(ticket: any):Promise<any>{
       
       let retticket = this.zendesk.tickets.create({
            
            subject: ticket.subject,
            
            comment: {
                body: ticket.comment
            },
            
            custom_fields: ticket.custom_fields
        
        }).then(function(result){
            
            return result.ticket;

        });
        
        return Promise.resolve(retticket);
    }

    asMessage(ticket: any):string {
        
        let msg = ""
        
        msg = msg.concat("Nro: ").concat(ticket.id.toString())
                    .concat("Estado: ").concat(ticket.status)
                    .concat("Problema: " + ticket.subject)
        
        for (var i =0; i < ticket.custom_fields.length; i++) {
            
            msg = msg.concat(ticket.custom_fields[i].value)
        }
        
        return msg        
    }
}