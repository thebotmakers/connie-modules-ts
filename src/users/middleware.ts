import { UserBase } from './model/UserBase';
import { Db } from 'mongodb'
import {Graph} from '../facebook'

export interface IUsersMiddlewareConfig {
    db: Db,
    FACEBOOK_PAGE_TOKEN: string
}

export function installMiddleware(controller: any, config: IUsersMiddlewareConfig) {

    let middleware: any = {}

    function receive(bot, message, next) {

        let connieId = `${bot.type}.${message.user}`
        let collection = config.db.collection('users')

        collection.find({ connieId: connieId })
            .limit(1)
            .next()
            .then<UserBase>((user: UserBase) => {

                if (user) {

                    return user
                }
                else {

                    user = new UserBase()
                    user.connieId = connieId

                    return collection.insertOne(user).then(result => {

                        return user
                    })
                }
            }).then(user => {

                if (!user.facebookPageScopedProfile && bot.type == 'fb') {

                    let fb = new Graph(config.FACEBOOK_PAGE_TOKEN)

                    return fb.getProfile(message.user).then(data => {
                        
                        if(!('error' in data))
                        {
                            user.facebookPageScopedProfile = data    
                        }
                        else
                        {
                            throw data.error
                        }                        

                        return collection.updateOne({ connieId: user.connieId}, { $set: { facebookPageScopedProfile: data } }).then(result => user) // update and transform back to user
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