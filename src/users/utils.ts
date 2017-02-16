import { User } from './model/User';
import { Db } from 'mongodb'
import { Graph } from '../facebook'
import { IAddress, IIdentity } from 'botbuilder'

const uuidV1 = require('uuid/v1');

export interface IUsersMiddlewareConfig {
    db: Db,
    FACEBOOK_PAGE_TOKEN: string
}

export const installLookupUser = (bot) => {

}

export const lookupUser = (address: IAddress, done: (err: Error, user: IIdentity) => void) => {



}

export function installMiddleware(controller: any, config: IUsersMiddlewareConfig) {

    let middleware: any = {}

    function receive(bot, message, next) {

        let collection = config.db.collection('users');
        let query = {};

        query[`${bot.type}Id`] = message.user;

        collection.find(query)
            .limit(1)
            .next()
            .then<User>((user: User) => {

                if (user) {

                    return user;
                }
                else {

                    user = new User();
                    user.fbId = message.user;
                    user.connieId = uuidV1();

                    return collection.insertOne(user).then(result => {
                        return user;
                    })
                }
            }).then(user => {

                if (!user.facebookPageScopedProfile && bot.type == 'fb') {

                    let fb = new Graph(config.FACEBOOK_PAGE_TOKEN)

                    return fb.getProfile(message.user).then(data => {

                        if (!('error' in data)) {
                            user.facebookPageScopedProfile = data

                            user.firstName = user.facebookPageScopedProfile.first_name
                            user.lastName = user.facebookPageScopedProfile.last_name
                        }
                        else {
                            throw data.error
                        }

                        return collection.updateOne({ connieId: user.connieId }, user).then(result => user) // update and transform back to user
                    })
                }

                // make conie user available to our bot 
                message.cmUser = user;

                next(); // end middleware
            })
            .catch(error => {

                console.log("Error getting data from user", error)

                next(); // end middleware
            })
    };

    controller.middleware.receive.use(receive);
};