import * as request from 'request'


export class ThreadSettings {

    constructor(private FACEBOOK_PAGE_TOKEN: string) {

    }

    greeting(greeting: string) {
        var message = {
            'setting_type': 'greeting',
            'greeting': {
                'text': greeting
            }
        };

        this.postAPI(message);
    }

    delete_greeting() {
        var message = {
            'setting_type': 'greeting',
        };

        this.deleteAPI(message);
    }

    get_started(payload) {
        var message = {
            'setting_type': 'call_to_actions',
            'thread_state': 'new_thread',
            'call_to_actions':
            [
                {
                    'payload': payload
                }
            ]
        };

        this.postAPI(message);
    }

    delete_get_started() {
        var message = {
            'setting_type': 'call_to_actions',
            'thread_state': 'new_thread',
        };
        this.deleteAPI(message);
    }

    menu(payload) {
        var message = {
            'setting_type': 'call_to_actions',
            'thread_state': 'existing_thread',
            'call_to_actions': payload
        };

        this.postAPI(message);
    }

    delete_menu() {
        var message = {
            'setting_type': 'call_to_actions',
            'thread_state': 'existing_thread',
        };

        this.deleteAPI(message);
    }

    postAPI(message) {

        request.post('https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + this.FACEBOOK_PAGE_TOKEN,
            { form: message },
            function (err, res, body) {
                if (err) {
                    console.log('Could not configure thread settings');
                } else {

                    var results = null;
                    try {
                        results = JSON.parse(body);
                    } catch (err) {
                        console.log('ERROR in thread_settings API call: Could not parse JSON', err, body);
                    }

                    if (results) {
                        if (results.error) {
                            console.log('ERROR in thread_settings API call: ', results.error.message);
                        } else {
                            console.log('Successfully configured thread settings', body);
                        }
                    }

                }
            });
    }

    deleteAPI(message) {

        request.delete('https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + this.FACEBOOK_PAGE_TOKEN,
            { form: message },
            function (err, res, body) {
                if (err) {
                    console.log('Could not configure thread settings');
                } else {
                    console.log('Successfully configured thread settings', message);
                }
            });
    }
}