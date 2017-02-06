import { Application } from 'express'
import { Db } from 'mongodb'

export function installApi(db:Db, server: Application) {

    let collection = db.collection('users')

    server.get('/api/users', function (req, res, next) {

        collection.find().toArray().then( users => 
        {
            res.send(users)
        })
    })
}

