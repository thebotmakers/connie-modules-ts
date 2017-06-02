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

const dbs: { [botName: string]: Db } = {}

export const install = (bot: UniversalBot, db: Db, server: Application, config: IUsersInstallConfig) => {

    dbs[bot.name] = db;

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

                    let newUser = new User();

                    newUser.custom = {}
                    newUser.connieId = uuid();
                    newUser.name = address.user.name;
                    newUser.id = address.user.id;
                    newUser.addresses[address.channelId] = address;

                    return collection.insertOne(newUser).then(result => {

                        return newUser;
                    })
                }
            })

            .then((user: User) => {
                if ((!user.facebookPageScopedProfile || !user.firstName) && address.channelId == 'facebook' && (!user.blocked)) {

                    let fb = new FaceobokApi(config.FACEBOOK_PAGE_TOKEN)

                    return fb.getProfile(address.user.id).then((data: IFacebookPageScopedProfile) => {
                        if (!('error' in data)) {

                            let update =
                                {
                                    $set:
                                    {
                                        facebookPageScopedProfile: data,
                                        firstName: data.first_name,
                                        lastName: data.last_name,
                                        name: `${data.first_name} ${data.last_name}` //override name value with the real data from facebook                                        
                                    }
                                }

                            return collection.updateOne({ id: user.id }, update).then(result => user) // update and transform back to user
                        }
                        else {
                            if (data.error.error_subcode == 2018001) { //"No matching user" means user blocked the bot
                                let update = {
                                    $set: {
                                        blocked: true
                                    }
                                }

                                collection.updateOne({ id: user.id }, update).then(result => user) // update and transform back to user
                                console.log(`<User blocked>: connieId: ${user.connieId}, user.name: ${user.name}`);
                            }
                            rollbar.info(data.error, null, { user: { id: user.connieId, username: user.name } });
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

        if (req.query.page && req.query.pageSize) {

            api.get(parseInt(req.query.page), parseInt(req.query.pageSize)).then(users => {
                res.send(users)
            });
        }
        else {

            api.getAll().then(users => {
                res.send(users)
            })
        }
    })

    server.get('/api/users/:id', function (req, res, next) {

        let api = new Api(db)

        api.getById(req.params.id).then(users => {
            res.send(users)
        })
    })
}

export const api = (bot: UniversalBot) => {
    
    return new Api(dbs[bot.name]);
} 
