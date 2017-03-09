import { Server } from 'restify';

import { Api as FaceobokApi, IFacebookPageScopedProfile } from './../facebook';
import { User } from './model/User';
import { Db } from 'mongodb';
import { IAddress, IIdentity, UniversalBot, Message } from 'botbuilder';
import * as uuid from 'uuid/v1'
import { Api } from './model/Api'
import { Application } from 'express'
import * as rollbar from 'rollbar'

export interface IUsersInstallConfig {

    FACEBOOK_PAGE_TOKEN: string,
    transformUser?: (user: User) => User;
}

export const install = (bot: UniversalBot, db: Db, server: Application, config: IUsersInstallConfig) => {

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

                    user.custom = {}
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

                            rollbar.handleError(data.error, {user: {id: user.connieId, username: user.name}});
                        }
                    })
                }

                return user;
            })

            .then(user => {

                done(null, (config.transformUser) ? config.transformUser(user) : user)
            })

            .catch((error: Error) => {

                done(error, address.user)
            })

    })

    server.get('/api/users', function (req, res, next) {

        let api = new Api(db)

        api.getAll().then(users => {
            res.send(users)
        })
    })
}