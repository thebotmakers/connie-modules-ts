let fetch = require('node-fetch')  // TODO: import * as fetch from 'node-fetch' didn't worked :/

export interface IFacebookPageScopedProfile {
    id: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    locale?: string;
    timezone?: number;
    gender?: string;
    error?: any
}

export class Api {

    api: string
    token: string

    constructor(token: string, apiUrl: string = 'https://graph.facebook.com/v2.8') {
        this.token = token
        this.api = apiUrl
    }



    getProfile(id: string): Promise<IFacebookPageScopedProfile> {

        return fetch(`${this.api}/${id}?access_token=${this.token}`)
            .then(response => {
                return response.json()
            })
    }
}