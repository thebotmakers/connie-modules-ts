import { Db } from 'mongodb';
import { User } from './../users/model/User';
import { UniversalBot, Message, IMessage } from 'botbuilder';
import { Application } from 'express'
import * as moment from 'moment'
import * as async from 'async'

export type ProactiveHandler = (bot: UniversalBot, user: User, logger: ProactiveLogger, next, args: any) => void

export interface ILogEntry {
    data: any,
    timestamp?: number
}

export class ProactiveLogger {

    constructor(private id: string, private db: Db) {
    }

    log(what: ILogEntry) {

        what.timestamp = Date.now()

        this.db
            .collection(this.id)
            .insertOne(what)
    }

    exists(query: any): Promise<boolean> {
        return this.db.collection(this.id).find(query).limit(1).next().then(data => !!data)
    }

    last(query: any): Promise<ILogEntry> {

        return this.db.collection(this.id).find(query).sort({ timestamp: -1 }).limit(1).next()
    }

}

const handlers: { [id: string]: { logger: ProactiveLogger, query: any, callback: ProactiveHandler } } = {}
let database: Db;

export interface IProactivHandlerConfig {
    id: string,
    query?: any,
    handler: ProactiveHandler
}

export function add(config: IProactivHandlerConfig) {

    handlers[config.id] = { logger: new ProactiveLogger(config.id, database), query: config.query || {}, callback: config.handler }

    console.log('Added proactive handler in: /api/proactive/', config.id)
}

export function install(bot: UniversalBot, db: Db, server: Application) {

    //module wide instance
    database = db;

    //setup api endpoint 

    server.post('/api/proactive/:id', (req, res, next) => {

        const id = req.params.id;

        if (id in handlers) {

            let handler = handlers[id];

            res.send(`Starting execution of proactive handler ${id}`);

            db.collection('users').find(handler.query).toArray().then<User[]>(users => {

                async.eachSeries<User, {}>(users, (user, next) => {

                    handlers[id].callback(bot, user, handlers[id].logger, next, req.params);
                });

                return users;
            });
        }
        else {
            res.send(`Proactive handler ${id} not found`)
        }

        next()
    })

    add
        ({
            id: 'sendmessage',
            query: {},
            handler: (bot: UniversalBot, user: User, logger: ProactiveLogger, next, args: any) => {

                let address = user.addresses[args.channelId]

                let message = new Message()
                    .text(args.text)
                    .address(address)

                bot.send(message, (err) => {

                    if (err) {
                        console.error('ERROR begining dialog to', address.user.name)
                    }
                    else {

                        
                        console.info('Succesfully begun dialog to', address.user.name)
                    }

                    logger.log({data: {errror: err ? err : null}})

                    next()
                })
            }
        })

    add
        ({
            id: 'begindialog',
            query: {},
            handler: (bot: UniversalBot, user: User, logger: ProactiveLogger, next, args: any) => {

                let address = user.addresses[args.channelId]

                bot.beginDialog(address, args.dialogId, args.dialogArgs, (err) => {

                    if (err) {
                        console.error('ERROR begining dialog to', address.user.name)
                    }
                    else {
                        console.info('Succesfully begun dialog to', address.user.name)
                    }
                    next()
                })
            }
        })

}
