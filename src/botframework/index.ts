import * as botbuilder from 'botbuilder'
import * as restify from 'restify'

export function createConnector(MICROSOFT_APP_ID: string, MICROSOFT_APP_PASSWORD: string): botbuilder.ChatConnector {

    // common stuff to all connie coonnectors should be setup here

    // connector    
    let connector = new botbuilder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    });

    return connector;
}

export function createBot(connector: botbuilder.ChatConnector) {

    // common stuff to all connie bots should be setup here

    return new botbuilder.UniversalBot(connector)
}

export function createServer() {

    // common stuff to all connie servers should be setup here

    let server = restify.createServer();

    server.use(restify.bodyParser());

    return server
}

export function start(connector: botbuilder.IConnector, server: restify.Server) {

    // Handle Bot Framework messages
    server.post('/api/messages', (connector as any).listen());

    server.listen(process.env.PORT, function () {
        console.log('Bot %s listening to %s', server.name, server.url);
    })
}
