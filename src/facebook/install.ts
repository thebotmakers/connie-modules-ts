import { UniversalBot } from 'botbuilder';
import { MessengerProfile } from './model/MessengerProfile';

export interface IMenuItem {
    type: string;
    title: string;
    payload: string;
}

export interface IFacebookModuleSettings {

    FACEBOOK_PAGE_TOKEN: string;
    greetingText?: any[];
    menu?: any[];
    getStarted?: {};
}

export function install(bot: UniversalBot, config: IFacebookModuleSettings) {


    if (!config.FACEBOOK_PAGE_TOKEN) {
        console.error("MISSING FACEBOOK_PAGE_TOKEN ", config.FACEBOOK_PAGE_TOKEN);
    }

    let threadSettings = new MessengerProfile(config.FACEBOOK_PAGE_TOKEN);

    if (config.greetingText) {
        threadSettings.greeting(config.greetingText);
    }

    if (config.menu) {
        threadSettings.menu(config.menu)
    }

    if (config.getStarted) {
        threadSettings.get_started(config.getStarted)
    }

    //

    bot.use(
        {
            receive: (event, next) => {

                if (event.source == 'facebook') {

                    switch (event.sourceEvent.message.sticker_id) {
                        case 369239263222822:
                        case 369239343222814:
                        case 369239383222810:

                            // adding the text property makes the event be interpreted as a normal message
                            (event as any).text = ':like:'
                            break;
                    }
                }

                next()
            }
        })

    //should do the same with all the other thread settings



}