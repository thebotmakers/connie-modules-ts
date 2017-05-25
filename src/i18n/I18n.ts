import * as botbuilder from 'botbuilder';
import { Db } from 'mongodb';
import { Api } from './../users/model/Api';
import { User } from './../users/model/User';
import * as _ from 'lodash'

export interface Ii18nconfig {
    locales: ILocale[];
}

export interface ILocale {
    id: string;
    success: string;
    error: string;
    name: string;
}

export const localesMap =
    {
        en: { id: 'en', name: 'English', success: "Language changed succesfully!", error: "Error chaning language, please try again." },
        es: { id: 'es', name: 'Español', success: "Idioma cambiado exitosamente!!", error: "Error al cambiar el lenguage, intenta de nuevo." }
    }

export class I18n {

    supportedLocales: string[];

    constructor(private config: Ii18nconfig) {

        this.supportedLocales = config.locales.map(l => l.id);
    }

    installDialogs(bot: botbuilder.UniversalBot, db: Db) {
        // answer get started postback
        bot.beginDialogAction('changelanguage', '/changeLanguage');

        // set the dialog itself.
        bot.dialog('/changeLanguage',
            [
                (session, args) => {

                    let choices = this.config.locales.map(l => l.name);

                    botbuilder.Prompts.choice(session, "Select language/Elige idioma", choices)
                },
                (session, arg: botbuilder.IPromptChoiceResult, next) => {

                    const locale = _.filter(localesMap, l => l.name == arg.response.entity)[0]
                    const user = session.message.user as User;
                    const api = new Api(db);

                    session.preferredLocale(locale.id, (err) => {

                        if (!err) {

                            api.update(user.connieId, { $set: { locale: locale.id } })
                                .then(result => {
                                    session.endDialog(locale.success);
                                })
                                .catch(err => {
                                    session.error(new Error(locale.error))
                                })
                        } else {

                            session.error(new Error(locale.error))
                        }
                    });
                }
            ]);
    }


    decideUserLocale(user): string {

        let locale: string;

        if (user.locale) {

            locale = user.locale
        }
        else {
            if (_.has(user, 'facebookPageScopedProfile.locale')) {

                let fbLocale = user.facebookPageScopedProfile.locale.split('_')[0];

                if (_.includes(this.supportedLocales, fbLocale)) {

                    locale = fbLocale;
                }
            }
        }

        return locale;
    }

    installMiddleware(bot: botbuilder.UniversalBot) {

        bot.use
            ({
                receive: (event: any, next) => {

                    const user = event.user as User;
                    const locale = this.decideUserLocale(user);

                    if (locale) {

                        event.textLocale = locale;
                    }

                    next();
                }
            });
    }


}