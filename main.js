"use strict";

/*
 * Created with @iobroker/create-adapter v2.0.2
 */


// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const request = require('request');

/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;


function sendMessageToSignal(message, phoneNumber) {
    return new Promise((resolve, reject) =>  {
        phoneNumber = phoneNumber || adapter.config.defaultPhone;

        if (message) {
            const sNewline = "%0A";
            let encodedMessage = encodeURIComponent(message);

            adapter.log.debug(`Encoded message: ${encodedMessage}`);
            adapter.log.debug(`Original Message: ${message} `);
            //Detect emojis
            let lEmojies = null;
            lEmojies = encodedMessage.match(/%25F0%259F%25[0-9A-Fa-f]{2}%25[0-9A-Fa-f]{2}/g);
            let lNewlines = null;
            lNewlines = encodedMessage.match(/%250A/g);
            adapter.log.debug(`Size of 'lEmojies': ${lEmojies?.length}`);
            adapter.log.debug(`Size of 'lNewlines': ${lNewlines?.length}`);

            if(lEmojies !== null)
            {
                if(lEmojies.length && lEmojies)
                {
                    lEmojies.forEach(element => {
                        encodedMessage = encodedMessage.replace(element, decodeURIComponent(element));
                        adapter.log.debug(`Found emoji ${element.toString()}$`);
                        adapter.log.debug(`Replace with ${decodeURIComponent(element)}`);
                    });
                }
            } 
            else
            {
                adapter.log.debug(`'lEmojies is null...'`);   
            } 

            if(lNewlines !== null)
            {
                if(lNewlines.length && lNewlines)
                {
                    lNewlines.forEach(element =>{
                        encodedMessage = encodedMessage.replace(element, decodeURIComponent(element));
                        adapter.log.debug(`Found newline and replace!`);
                    });
                }    
            } 
            else
            {
                adapter.log.debug("'lNewlines' is null...");
            } 

            const url = `https://api.callmebot.com/signal/send.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${adapter.config.apikey}&source=iobroker`;
            adapter.log.debug('Call ' + url);
            request(url, (err, resp, body) => {
                adapter.log.debug(body);
                !err && resp && resp.statusCode < 400 && (!body || !body.includes('ERROR')) ? resolve() : reject(err || body || (resp && resp.statusCode));
            })
                .on('error', err => reject(err));
        } else {
            resolve();
        }
    });
}
/**
 * Starts the adapter instance
 * @param {Partial<utils.AdapterOptions>} [options]
 */
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: 'signal-cmb',
        ready: main, // Main method defined below for readability
        stateChange: (id, state) => {
            if (state && !state.ack && state.val && adapter.config.apikey) {
                if (adapter.config.defaultPhone) {
                    // The state was changed
                    adapter.log.debug(`Sending message "${state.val}" to default number "${adapter.config.defaultPhone}"`);
                    sendMessageToSignal(state.val)
                        .then(() => adapter.log.debug(`Successfully sent`))
                        .catch(err => adapter.log.error('Cannot send message: ' + err));
                } else {
                    adapter.log.error('Please set the default phone number.');
                }
            }
        },
        message: (obj) => {
            if (typeof obj === 'object' && obj.message && adapter.config.apikey) {
                if (obj.command === 'send' ) {
                    if (typeof obj.message !== 'object') {
                        obj.message = {
                            text: obj.message
                        };
                    }
                    obj.message.phone = obj.message.phone || adapter.config.defaultPhone;
                    if (!obj.message.phone) {
                        adapter.log.warn('Default phone number is not provided!');
                        return obj.callback && adapter.sendTo(obj.from, obj.command, {result: 'Message sent'}, obj.callback);
                    }

                    // e.g. send email or pushover or whatever
                    adapter.log.info(`Send ${obj.message.text} to ${obj.message.phone}`);

                    sendMessageToSignal(obj.message.text, obj.message.phone)
                        .then(() => {
                            // Send response in callback if required
                            obj.callback && adapter.sendTo(obj.from, obj.command, {result: 'Message sent'}, obj.callback);
                        })
                        .catch(err => {
                            adapter.log.error('Cannot send message: ' + err);
                            obj.callback && adapter.sendTo(obj.from, obj.command, {error: err}, obj.callback);
                        });
                }
            }
        },
    }));
}

function main() {
    if (!adapter.config.apikey) {
        adapter.log.warn('APIKEY is not provided. No messages will be sent');
        return;
    }

    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('sendMessage');
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
