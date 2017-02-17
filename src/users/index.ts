import { Api as FaceobokApi, IFacebookPageScopedProfile } from './../facebook';
import { User } from './model/User';
import { Db } from 'mongodb';
import { IAddress, IIdentity, UniversalBot, Message } from 'botbuilder';
export * from './api'
import * as uuid from 'uuid/v1'

import { Api } from './api'

export const install = (bot: UniversalBot, db: Db, config: { FACEBOOK_PAGE_TOKEN: string }) => {

    let collection = db.collection('users')

    // setup lookup user setting

    bot.set('lookupUser', (address: IAddress, done: (err: Error, indentity: IIdentity) => void) => {

        let api = new Api(db)

        api.getByAddress(address)

            .then(user => {

                if (user) {

                    return user;
                }
                else {

                    user = new User();

                    user.connieId = uuid();
                    user.name = address.user.name;
                    user.id = address.user.id;
                    user.addresses[address.channelId] = address;

                    return collection.insertOne(user).then(result => {

                        return user;
                    })
                }
            })

            .then((user: User) => {

                if (!user.facebookPageScopedProfile && address.channelId == 'facebook') {

                    let fb = new FaceobokApi(config.FACEBOOK_PAGE_TOKEN)

                    return fb.getProfile(address.user.id).then((data: IFacebookPageScopedProfile) => {

                        if (!('error' in data)) {

                            let update =
                                {
                                    $set:
                                    {
                                        facebookPageScopedProfile: data,
                                        firstName: data.first_name,
                                        lastName: data.last_name
                                    }
                                }

                            return collection.updateOne({ id: user.id }, update).then(result => user) // update and transform back to user
                        }
                        else {

                            throw new Error(data.error.message);
                        }
                    })
                }
            })

            .then(user => {

                done(null, user)
            })

            .catch((error: Error) => {

                done(error, address.user)
            })

    })
}