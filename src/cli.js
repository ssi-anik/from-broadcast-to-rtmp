import arg from 'arg';
import inquirer from "inquirer";

const allowedFrom = {
    'yt': 'youtube',
    'youtube': 'youtube',
};
const allowedTo = {
    'fb': 'facebook',
    'facebook': 'facebook',
};
const defaultFrom = 'youtube';
const defaultTo = 'facebook';

function getAllowedOrDefault (allowed, provided, defaultSelected) {
    return allowed[provided && provided.toLowerCase() || defaultSelected] || defaultSelected
}

function parseArgToOptions (rawArgs) {
    const args = arg({
        '--from': String,
        '--to': String,

        '-f': '--from',
        '-t': '--to',
    }, {
        argv: rawArgs.slice(2),
    });

    return {
        'from': getAllowedOrDefault(allowedFrom, args['--from'], defaultFrom),
        'to': getAllowedOrDefault(allowedTo, args['--to'], defaultTo)
    };
}

function askForFacebookRTMPKey () {
    return inquirer.prompt({
        'type': 'input',
        'name': 'key',
        'message': 'Enter your RTMP key for Facebook: ',
    }).then(r => r.key);
}

function askForYoutubeURL () {
    return inquirer.prompt({
        'type': 'input',
        'name': 'url',
        'message': 'Enter broadcasting URL from Youtube: ',
    }).then(r => r.url);
}

async function askForRequiredData (options) {
    if ( options.to === allowedTo['facebook'] ) {
        options = {
            ...options,
            rtmpKey: await askForFacebookRTMPKey()
        }
    }

    if ( options.from === allowedFrom['youtube'] ) {
        options = {
            ...options,
            streamURL: await askForYoutubeURL()
        }
    }

    return options;
}


export async function cli (args) {
    let options = parseArgToOptions(args);
    options = await askForRequiredData(options);
    console.log(options);
}
