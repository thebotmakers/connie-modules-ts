import { Db } from 'mongodb';
import { UniversalBot, Message } from 'botbuilder';
import { Application } from 'express';
import { Api } from './utils/Api'

export function install(bot: UniversalBot, db: Db, server: Application) {

    let api = new Api(db);

    server.get('/api/handOff/:id', (req, res, next) => {        
        let connieId = req.params.id;

        api.getHandOffStatus(connieId).then(status => {
            res.send(status);
            next();
        });
    });

    server.post('/api/handOff/:id/status', (req, res, next) => {
        let connieId = req.params.id;
        let updateValue = req.params.status;

        api.updateHandOffStatus(connieId, updateValue).then(status => {
            res.send(status);
            next();
        });
    });
}
