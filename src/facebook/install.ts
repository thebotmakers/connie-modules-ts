import { ThreadSettings } from './ThreadSettings';


export interface IFacebookModuleSettings {

    FACEBOOK_PAGE_TOKEN: string;

    greetingText?: string;
}

export function install(config: IFacebookModuleSettings) {

    let threadSettings = new ThreadSettings(config.FACEBOOK_PAGE_TOKEN);

    if(config.greetingText)
    {
        threadSettings.greeting(config.greetingText);
    }

    //should do the same with all the other thread settings
}