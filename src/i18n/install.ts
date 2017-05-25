import { Ii18nconfig, I18n } from './I18n';
import { Db } from 'mongodb';
import { Api } from './../users/model/Api';
import { UniversalBot, IPromptChoiceResult } from 'botbuilder';

export const install = (bot: UniversalBot, db: Db, config: Ii18nconfig) => {

    const i18n = new I18n(config);

    i18n.installDialogs(bot, db);
    i18n.installMiddleware(bot);
}