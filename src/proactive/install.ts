import { Db } from 'mongodb';
import { User } from './../users/model/User';
import { UniversalBot, Message, IMessage, Session } from 'botbuilder';
import * as builder from 'botbuilder';
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

export interface IProactiveHandlerConfig {
    id: string,
    query?: any,
    handler: ProactiveHandler
}

export function add(config: IProactiveHandlerConfig) {

    handlers[config.id] = { logger: new ProactiveLogger(config.id, database), query: config.query || {}, callback: config.handler }

    console.log('Added proactive handler in: /api/proactive/', config.id)
}

export interface IProactivePageLikeConfig {
    pageUrl: string,
    imageUrl: string,
    title: string,
    subtitle: string
}

export function addPageLike(bot: UniversalBot, config: IProactivePageLikeConfig) {

    bot.dialog('/pageLike', [

        (session: Session, args, next) => {
            let user: User = session.message.user as User;
            var msg = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments([
                    new builder.HeroCard(session)
                        .title(session.localizer.gettext(user.locale, config.title))
                        .subtitle(session.localizer.gettext(user.locale, config.subtitle))
                        .images([
                            builder.CardImage.create(session, config.imageUrl)
                                .tap(builder.CardAction.showImage(session, config.imageUrl)),
                        ])
                        .buttons([
                            builder.CardAction.openUrl(session, config.pageUrl, session.localizer.gettext(user.locale, 'Like'))
                        ])
                ]);
            session.endConversation(msg);
        }
    ]);

    add({
        id: 'pageLike',
        query: {},
        handler: (bot, user, logger, next, args) => {
            
            let facebookAddress = user.addresses['facebook'];
            if (facebookAddress) {
                logger.exists({ 'data.facebookId': facebookAddress.user.id }).then(exists => {
                    if (exists) {
                        console.log('Already send page like to', facebookAddress.user.id, facebookAddress.user.name);
                        next();
                    }
                    else {
                        try {

                            bot.beginDialog(facebookAddress, '/pageLike', null, err => {
                                if (err) {
                                    console.error('Error sending message sent to', facebookAddress.user.id, facebookAddress.user.name);
                                    logger.log({ data: { facebookId: facebookAddress.user.id, error: err } });
                                    next();
                                }
                                else {
                                    console.log('Message sent to', facebookAddress.user.id, facebookAddress.user.name);
                                    logger.log({ data: { facebookId: facebookAddress.user.id } });
                                    next();
                                }
                            });

                        }
                        catch (e) {
                            console.log(`Error sending message to ${facebookAddress.user.id} ${facebookAddress.user.name}: ${(<Error>e).message}`);
                            next();
                        }
                    }
                });
            }
            else {
                next();
            }
        }
    });
}

export function install(bot: UniversalBot, db: Db, server: Application) {

    //module wide instance
    database = db;

    //setup api endpoint 

    server.post('/api/proactive/:id', (req, res, next) => {

        const id = req.params.id;

        if (id in handlers) {

            const handler = handlers[id];
            const query = req.body.query || handler.query || {}

            res.send(`Starting execution of proactive handler ${id}`);

            db.collection('users').find(query).toArray().then<User[]>(users => {

                async.eachSeries<User, {}>(users, (user, next) => {

                    handlers[id].callback(bot, user, handlers[id].logger, next, req.body);
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

                const address = user.addresses[args.channelId]

                const message = new Message()
                    .text(args.text)
                    .address(address)

                bot.send(message, (err) => {

                    if (err) {

                        console.error('ERROR sending message to ', address.user.name, address.user.id);
                        console.error(err);
                    }
                    else {

                        console.info('Succesfully send message to ', address.user.name, address.user.id);
                    }

                    logger.log({ data: { errror: err ? err : null } })

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
