import { Db } from 'mongodb';
import { Api } from './../users/model/Api';
import { User } from './../users/model/User';
import { UniversalBot, IPromptChoiceResult } from 'botbuilder';
import * as _ from 'lodash'
import * as botbuilder from 'botbuilder'

export interface Ii18nconfig {
    locales: ILocale[];
}

export interface ILocale {
    id: string;
    success: string;
    error: string;
    name: string;
}

export interface ILocalesMap {
    [locales: string]: ILocale;
}

export const localesMap: ILocalesMap =
    {
        en: { id: 'en', name: 'English', success: "Language changed succesfully!", error: "Error chaning language, please try again." },
        es: { id: 'es', name: 'Español', success: "Idioma cambiado exitosamente!!", error: "Error al cambiar el lenguage, intenta de nuevo." }
    }

export const install = (bot: UniversalBot, db: Db, config: Ii18nconfig) => {

    // answer get started postback
    bot.beginDialogAction('changelanguage', '/changeLanguage');

    // set the dialog itself.
    bot.dialog('/changeLanguage',
        [
            (session, args) => {

                let choices = config.locales.map(l => l.name);

                botbuilder.Prompts.choice(session, "Select language/Elige idioma", choices)
            },
            (session, arg: IPromptChoiceResult, next) => {

                const locale = _.filter(localesMap, l => l.name == arg.response.entity)[0]
                const user = session.message.user as User;
                const api = new Api(db);

                api.update(user.connieId, { $set: { locale: locale.id } })
                    .then(result => {
                        session.endDialog(locale.success);
                    })
                    .catch(() => {
                        session.endDialog(locale.error);
                    })
            }
        ]);

    bot.use
        ({
            receive: (event: any, next) => {

                let user = event.user as User;
                let locale: string;

                if (user.locale) {
                    locale = user.locale
                }
                else {
                    if (_.has(user, 'facebookPageScopedProfile.locale')) {
                        locale = user.facebookPageScopedProfile.locale.split('_')[0];
                    }
                }

                if (locale) {
                    event.textLocale = locale;
                }

                next();
            }
        });
}