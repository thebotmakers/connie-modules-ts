import { IAddress } from 'botbuilder';
import { User } from './model/User';
import { Server } from 'restify'
import { Db, Collection } from 'mongodb'


export class Api {

    collection: Collection
    constructor(private db: Db) {

        this.collection = db.collection('users')
    }

    get(connieId: string): Promise<User> {

        return this.collection.find({ connieId: connieId }).limit(1).next()
    }

    getByAddress(address:IAddress):Promise<User> {

        let query = {}

        query[`addresses.${address.channelId}.user.id`] = address.user.id

        return this.collection.find(query).limit(1).next()
    }

    getAll(): Promise<User[]> {
        return this.collection.find().toArray()
    }
}

export function setRoutes(db: Db, server: Server) {

    let api = new Api(db)

    server.get('/api/users', function (req, res, next) {

        api.getAll().then(users => {
            res.send(users)
        })
    })
}