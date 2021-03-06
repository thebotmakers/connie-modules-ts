import { Session, CardAction, Message, Keyboard, ICardAction } from 'botbuilder';
import * as builder from 'botbuilder'

export class Prompts {

    static optionalKeyboardCard(session: Session, suggestions: string[] | ICardAction[] | CardAction[], message?: string) {

        const buttons = (<any>suggestions).map(s => s.toAction ? s.toAction() : CardAction.imBack(session, s, s))
        const msg = new Message()

        if (message) {
            const prompt = session.localizer.gettext(session.preferredLocale(), message)
            msg.text(prompt)
        }

        msg.attachments([new Keyboard(session).buttons(buttons)])

        session.send(msg)
    }

    static optionalHeroCard(session: Session, message?: string, suggestions?: string[]) {
        const prompt = session.localizer.gettext(session.preferredLocale(), message || "help")
        const buttons = suggestions.map(s => CardAction.imBack(session, s, s))

        const msg = new Message()
        msg.text(prompt)

        msg.attachments([new builder.HeroCard(session).buttons(buttons).toAttachment()])

        session.send(msg)
    }
}
