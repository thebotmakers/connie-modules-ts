import { Db } from 'mongodb';
import { User } from './../users/model/User';
import { UniversalBot, Message, IMessage, Session } from 'botbuilder';
import * as builder from 'botbuilder';
import { Application } from 'express';
import * as moment from 'moment';
import * as async from 'async';
import * as path from 'path';
let fs = require('fs');
import * as request from 'request';

export type ProactiveHandler = (bot: UniversalBot, user: User, logger: ProactiveLogger, next, args: any) => void;

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
    subtitle: string,
    webviewTitle: string,
    facebookPageToken: string,
    facebookAppId: string,
}

export function addPageLike(bot: UniversalBot, server: Application, config: IProactivePageLikeConfig) {

    bot.dialog('/pageLike', [

        (session: Session, args, next) => {
            let user: User = session.message.user as User;
            let pageLikeUrl = `https://${args.host}/api/webviews/pageLike`;

            /** add URL to whitelisted_domains */
            request.post({
                url: 'https://graph.facebook.com/v2.9/me/messenger_profile?access_token=' + config.facebookPageToken,
                form: { whitelisted_domains: [pageLikeUrl] }
            }, (err, httpResponse, body) => {

            });

            let msg = new builder.Message(session);
            msg.sourceEvent({
                facebook: {

                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: [
                                {
                                    title: session.localizer.gettext(user.locale, config.title),
                                    image_url: config.imageUrl,
                                    subtitle: session.localizer.gettext(user.locale, config.subtitle),
                                    buttons: [
                                        {
                                            type: "web_url",
                                            url: pageLikeUrl,
                                            title: session.localizer.gettext(user.locale, 'Me gusta'),
                                            webview_height_ratio: "compact"
                                        }
                                    ]
                                }
                            ]
                        }
                    }

                }
            });

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

                            bot.beginDialog(facebookAddress, '/pageLike', { host: args.host }, err => {
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

    //add GET to webview page
    server.get('/api/webviews/pageLike', function (req, res) {
        fs.readFile(path.join(__dirname, '../../public/webviews/pageLike/index.html'), 'utf8', function (err, data) {
            let html = data.replace(new RegExp('{pageUrl}', 'g'), config.pageUrl);
            html = html.replace(new RegExp('{appId}', 'g'), config.facebookAppId);
            html = html.replace(new RegExp('{webviewTitle}', 'g'), config.webviewTitle);
            res.send(html);
        });
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

                    handlers[id].callback(bot, user, handlers[id].logger, next, { body: req.body, host: req.headers.host });
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

                let address = user.addresses[args.body.channelId]

                bot.beginDialog(address, args.body.dialogId, args.body.dialogArgs, (err) => {

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
