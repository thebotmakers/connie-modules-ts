import { User } from '../users';
import { IRollbarReporterConfig } from './install';
import { UniversalBot } from 'botbuilder'
import * as nodemailer from 'nodemailer'
import * as rollbar from 'rollbar'


export interface IRollbarReporterConfig {
    token: string,
    environment: string
}

export const installRollbarReporter = (bot: UniversalBot, config: IRollbarReporterConfig) => {

    let originalSessionErrorHandler;

    rollbar.init
        (config.token,
        {
            environment: config.environment
        });

    bot.use
        ({
            botbuilder: (session, next) => {

                if (!originalSessionErrorHandler) {
                    originalSessionErrorHandler = session.error;
                }

                session.error = (err) => {

                    let user = session.message.user as User;

                    rollbar.handleErrorWithPayloadData(
                        err,
                        {
                            custom:
                            {
                                message: session.message.text,
                                channel: session.message.address.channelId,
                                id: session.message.address.user.id,
                                sourceEvent: JSON.stringify(session.message.sourceEvent)
                            }
                        },
                        {
                            user:
                            {
                                id: user.connieId,
                                username: user.name
                            }
                        });

                    // call botframework's original handler
                    return originalSessionErrorHandler.call(session, err);
                };

                next();
            }
        });

        rollbar.handleUncaughtExceptions(config.token, {});
        rollbar.handleUnhandledRejections(config.token);
}



export interface IEmailReporterConfig {
    mailService: string,
    mailUser: string,
    mailPassword: string,
    mailFrom: string,
    mailTo: string
}

export const installEmailReporter = function (bot: UniversalBot, config: IEmailReporterConfig) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport
        ({
            service: config.mailService,
            auth:
            {
                user: config.mailUser,
                pass: config.mailPassword
            }
        });


    bot.on('error', (err) => {

        console.log(err.message)

        // setup email data with unicode symbols
        let mailOptions =
            {
                from: config.mailFrom,
                to: config.mailTo,
                subject: 'Error detected on bot 💥', // Subject line
                text: err.message, // plain text body
                html: err.message
            };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    });
}