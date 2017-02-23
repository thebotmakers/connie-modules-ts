import { UniversalBot } from 'botbuilder';
import { DashbotAnalytics } from './DashbotAnalytics';

export function install(bot:UniversalBot, DASHBOT_API_KEY:string) {

    let analytics = new DashbotAnalytics(DASHBOT_API_KEY)

    // Install logging middleware
    bot.use({
        send: (event: any, next) => {

            if (event.type == 'message') {
                analytics.track(event.address.user.id, event.text, 'outgoing', Date.now())
            }

            next()
        },
        receive: (event: any, next) => {

            if (event.type == 'message') {
                analytics.track(event.user.id, event.text, 'incoming', Date.now())
            }

            next()
        }
    });
}