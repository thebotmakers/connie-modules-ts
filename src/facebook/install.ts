import { UniversalBot } from 'botbuilder';
import { ThreadSettings } from './model/ThreadSettings';


export interface IFacebookModuleSettings {

    FACEBOOK_PAGE_TOKEN: string;

    greetingText?: string;
}

export function install(bot: UniversalBot, config: IFacebookModuleSettings) {


    if(!config.FACEBOOK_PAGE_TOKEN) 
    {
        console.error("MISSING FACEBOOK_PAGE_TOKEN ", config.FACEBOOK_PAGE_TOKEN);
    }

    let threadSettings = new ThreadSettings(config.FACEBOOK_PAGE_TOKEN);

    if (config.greetingText) {
        threadSettings.greeting(config.greetingText);
    }

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