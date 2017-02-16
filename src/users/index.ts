import { IAddress, IIdentity } from 'botbuilder';
export * from './model/User'
export * from './api'



export const install = (bot, db) => {

    let collection = db.collection('users')

    // setup lookup user setting

    bot.set('lookupUser', (address: IAddress, done: (err: Error, user: IIdentity) => void) => {

        let api = new Api()
        api.getUser(address, done)
    })

    


}