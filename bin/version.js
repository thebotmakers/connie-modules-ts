#!/usr/bin/env node

var del = require('del')
var os = require('os');
var cmd = require("cmd-exec").init();

del(['dist'])
    .then(paths => {
        console.log('Deleted dist folder\n');
    })
    .then(() => {

        console.log('Transpiling typescript\n');

        if(os.platform() == 'win32') // "win32")
         {
             return cmd.exec('"./node_modules/.bin/tsc" -p .');
         }
         else
         {
             return cmd.exec('./node_modules/.bin/tsc -p .');
         }
    })
    .then( msg => {
        console.log(msg)
    })