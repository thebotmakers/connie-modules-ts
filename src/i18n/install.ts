import { Db } from 'mongodb';
import { Api } from './../users/model/Api';
import { User } from './../users/model/User';
import { Ii18nconfig } from './install';
import { UniversalBot, IPromptChoiceResult } from 'botbuilder';
import * as _ from 'lodash'
import * as botbuilder from 'botbuilder'

export interface Ii18nconfig {
    locales: string[];
}


const localesMap =
    {
        en: { name: 'English' },
        es: { name: 'Spanish' }
    }

export const install = (bot: UniversalBot, db: Db, config: Ii18nconfig) => {

    // answer get started postback
    bot.beginDialogAction('changeLanguage', '/changeLanguage');

    // set the dialog itself.
    bot.dialog('/changeLanguage',
        [
            (session, args) => {

                botbuilder.Prompts.choice(session, "Select language/Elige idioma", config.locales)
            },
            (session, arg: IPromptChoiceResult, next) => {

                debugger;

                const user = session.message.user as User;
                const api = new Api(db);

                api.update(user.connieId, { $set: { locale: arg.response.entity } })
                    .then(result => {
                        next()
                    })
                    .catch(() => {

                        session.endDialog("Erro saving language option :S");
                    });
            },
            (session) => {

                session.endDialog("Language changed succesfully!");
            }
        ])

    //default to proper locale
    bot.use
        ({
            receive: (event: any, next) => {

                let user = event.user as User;
                let locale = (_.has(user, 'facebookPageScopedProfile.locale')) ? user.facebookPageScopedProfile.locale.split('_')[0] : 'es';

                event.textLocale = locale;

                next();
            }
        });
}