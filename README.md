# connie-modules

This is the source for The Bot Makers bot platform Connie

You can read more about the platform [here](http://www.thebotmakers.com/connie/) 


## Modules

Connie is made of multiple optional modules (except the Users module), each adding a specific functionality to your bot.

### Analitycs

Let's you connect with Dashbot 

### Botframework

Utils to ease development with Misocroft's BotFramework

### Conversation

Saves messages exchanged between your users and your bot.

### Proactive

Let's you define multiple types of proactive messages scheduled, manual, triggered by other integrations, etc.


#### POST

`/api/proactive/:id`

Executes a proactive handler of `id`, to all user that satisfy `query`.
```json
{
    "query": {}, // optional, for example {connieId: `asdasdasd-asda-asdasd-ad` } wil send a message to only that user.
    "arg1": {},
    ...
    "argn": {}
}
```

`/api/proactive/sendmessage`

Sends a message to all the users, that satisfy `query`

```json
{
    "query": {},
    "channelId": "facebook",
    "text": "message text"
}
```


`/api/proactive/beginDialog`

Starts a dialog with `dialogId` to all the users that satisfy `query`

```json
{
    "query": {},
    "channelId": "facebook",
    "dialogId": "/askSign"
}
```

### Users

Autmatically lodas custom user info from their channels. and lets you link multiple accounts.


## UNDER HEAVY DEVELOPMENT

