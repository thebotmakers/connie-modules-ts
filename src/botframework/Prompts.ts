import { Session, CardAction, Message, Keyboard } from 'botbuilder';
import * as builder from 'botbuilder'

export class Prompts {

    static optionalKeyboardCard(session: Session, suggestions: string[], message?: string) {

        let buttons = suggestions.map(s => CardAction.imBack(session, s, s))
        let msg = new Message()

        if (message) {
            let prompt = session.localizer.gettext(session.preferredLocale(), message)
            msg.text(prompt)
        }

        msg.attachments([new Keyboard(session).buttons(buttons)])

        session.send(msg)
    }

    static optionalHeroCard(session: Session, message?: string, suggestions?: string[]) {
        let prompt = session.localizer.gettext(session.preferredLocale(), message || "help")
        let buttons = suggestions.map(s => CardAction.imBack(session, s, s))

        let msg = new Message()
        msg.text(prompt)

        msg.attachments([new builder.HeroCard(session).buttons(buttons).toAttachment()])

        session.send(msg)
    }
}
