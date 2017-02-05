let fetch = require('node-fetch')  // TODO: import * as fetch from 'node-fetch' didn't worked :/

export interface IFacebookPageScopedProfile {
    id:string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    locale?: string;
    timezone?: number;
    gender?: string;
    error?:any
}

export class Graph {

    api: string
    token: string

    constructor(token: string, api: string = 'https://graph.facebook.com/v2.8') {
        this.token = token
        this.api = api
    }

    getProfile(id: string): Promise<IFacebookPageScopedProfile> {
        
        return fetch(`${this.api}/${id}?access_token=${this.token}`)
            .then(response => {
                return response.json()
            })
    }
}