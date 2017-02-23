import { Db } from 'mongodb';
import { User } from './../users/model/User';
import { UniversalBot } from 'botbuilder';
import { Application } from 'express'
import * as moment from 'moment'
import * as async from 'async'

export type ProactiveHandler = (bot: UniversalBot, user: User, log: Logger, next,  args: any) => void

export interface ILogEntry {
    data: any,
    timestamp?: number
}

export class Logger {


    constructor(private id: string, private db: Db) {
        this.id = id
    }

    log(what: ILogEntry) {

        what.timestamp = Date.now()

        this.db
            .collection(this.id)
            .insertOne(what)
    }

    exists(query: any): Promise<boolean> {
        return this.db.instance.collection(this.id).find(query).limit(1).next().then(data => !!data)
    }

    last(query: any): Promise<ILogEntry> {

        return this.db.instance.collection(this.id).find(query).sort({ timestamp: -1 }).limit(1).next()
    }

}

const handlers: { [id: string]: { logger: Logger, query: any, callback: ProactiveHandler } } = {}

export function add(id: string, db: Db, query: any, handler: ProactiveHandler) {

    handlers[id] = { logger: new Logger(id, db), query: query, callback: handler }
}

export function install(bot: UniversalBot, db: Db, server: Application) {

    server.post('api/proactive', (req, res, next) => {

        if (Array.isArray(req.params.ids)) {

            req.params.ids.forEach((id) => {

                if (id in handlers) {

                    let handler = handlers[id];

                    res.send(`Starting execution of proactive handler ${id}`);

                    db.collection('users').find(handler.query).toArray().then<User[]>(users => {

                        async.eachSeries<User, {}>(users, (user, next) => {

                            handlers[id].callback(bot, user, handlers[id].logger, next, req.params);
                        });
                    });
                }
                else {
                    res.send(`Proactive handler ${id} not found`)
                }
            })
        }
        else {

            res.send(`Missing proactive handlers ids in request body {ids: ['id1', 'id2', ...]}`)
        }

        next()
    })
}
