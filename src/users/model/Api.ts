
import { IAddress } from 'botbuilder';
import { User } from './User';
import { Server } from 'restify'
import { Db, Collection, UpdateWriteOpResult } from 'mongodb'

export interface IPaginatedResponse<T> {
    total: number;
    items: T[];
}

export class Api {

    collection: Collection;

    constructor(private db: Db) {

        this.collection = db.collection('users')
    }

    get(page: number = 1, pageSize: number = 10): Promise<IPaginatedResponse<User>> {

        return this.collection.count({})
            .then(result => {

                return this.collection
                    .find({})
                    .skip((page - 1) * pageSize)
                    .limit(pageSize)
                    .toArray()
                    .then(users => {
                        return {
                            total: result,
                            items: users
                        }
                    })
            })
    }

    getById(connieId: string): Promise<User> {

        return this.collection.find({ connieId: connieId }).limit(1).next()
    }

    getByAddress(address: IAddress): Promise<User> {

        let query = {}

        query[`addresses.${address.channelId}.user.id`] = address.user.id

        return this.collection.find(query).limit(1).next()
    }

    getAll(): Promise<User[]> {
        return this.collection.find().toArray()
    }

    update(connieId: string, update: {}): Promise<UpdateWriteOpResult> {

        return this.collection.updateOne({ connieId }, update)
    }
}