import { Application } from 'express';

export function install(server: Application, packageJson: any) {

    server.get('/info', (request, response, next) => {
        response.send(`version: ${packageJson.version}`);
    })
}