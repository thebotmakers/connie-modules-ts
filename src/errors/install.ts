import { UniversalBot } from 'botbuilder'
import * as nodemailer from 'nodemailer'

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