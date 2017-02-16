import { User } from './model/User';
import { UsersApi } from './api';
import { Server} from 'restify'
import { Db, Collection } from 'mongodb'


export class Api {

    collection:Collection
    constructor(private db:Db) {

        this.collection = db.collection('users')
    }   

    get(connieId?:string) {

        if(!connieId)
        {
            return this.collection.find().toArray()
        }
        else 
        {
            return this.collection.find({connieId: connieId}).limit(1).next()
        }
    }

}


export function install(db:Db, server: Server) {
    
    let collection = db.collection('users')
    let api = new Api(db)

    server.get('/api/users', function (req, res, next) {

        api.get().then(users => {
            res.send(users)
        })
    })

    
}