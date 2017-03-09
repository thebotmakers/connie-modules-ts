import { Api } from './../facebook/model/Api';
import { Db } from 'mongodb';
import { User, Api as UsersApi } from './../users';
import { UniversalBot, Message } from 'botbuilder';
import { Application } from 'express'
import * as moment from 'moment'
import * as async from 'async'
import * as request from 'request'

export interface ILogEntry {
    data: any,
    timestamp?: number
}

export function install(bot: UniversalBot, db: Db, server: Application) {

    server.post('/api/ticketUpdate/:id', (req, res, next) => {

        const id = req.params.id;
        const api = new UsersApi(db)

        api.get(req.params.connieId).then(user => {

            const message = new Message().text("hola se te resolvio el ticket").address(user.addresses['facebook']);

            bot.send(message, err => {

                if (err) {
                    console.log("error sending message to ", user.name)
                }
                else {
                    console.log("ticket update message sent to ", user.name)

                }
            })
        })
    })
}
