import arg from 'arg';
import {
    allowedFrom,
    allowedTo,
    askForInput,
    defaultFrom,
    defaultTo,
    fancyLogger,
    getAllowedOrDefault,
    getHlsUrlForYoutubeVideo,
    getYoutubeVideoId
} from "./helpers";

/**
 * Generate URLS for RTMP
 */

function generateRTMPUrl (options) {
    const host = options.rtmpHost;
    const key = options.rtmpKey;

    if ( allowedTo['facebook'] === options.to ) {
        return generateRTMPUrlForFacebook(host, key);
    }

    throw Error(`Invalid RTMP server: ${options.to}`);
}

function generateRTMPUrlForFacebook (host, key) {
    host = host || "rtmps://live-api-s.facebook.com:443/rtmp/";
    fancyLogger(`[INFO]: RTMP host: ${host}`, 'white');

    return `${host}${key}`;
}

/**
 * RTMP Server related methods
 */

function askForRTMPKey (server) {
    return new Promise((resolve, reject) => {
        if ( allowedTo['facebook'] === server ) {
            resolve(askForFacebookRTMPKey());
        }

        reject(`Invalid RTMP server: ${server}`);
    });
}

function askForFacebookRTMPKey () {
    const inputMessage = 'Enter your RTMP key [Facebook https://www.facebook.com/live/producer]:';
    const errorMessage = 'RTMP key cannot be empty';

    return askForInput(inputMessage, 1, errorMessage);
}

/**
 * Stream broadcaster related methods
 */

function askForStreamUrl (service) {
    return new Promise((resolve, reject) => {
        if ( allowedFrom['youtube'] === service ) {
            resolve(askForYoutubeURL());
        }

        reject(`Invalid broadcasting server: ${service}`);
    });
}

function askForYoutubeURL () {
    return askForInput('Enter streaming URL [Youtube]:').then(url => {
        url = (url || '').trim()
        if ( !url ) {
            throw Error('URL cannot be empty.');
        }

        return getHlsUrlForYoutubeVideo(getYoutubeVideoId(url));
    });
}

/**
 * Parser
 */

function parseArgToOptions (rawArgs) {
    const args = arg({
        '--from': String,
        '--to': String,
        '--rtmp-host': String,

        '-f': '--from',
        '-t': '--to',
        '-r': '--rtmp-host',
    }, {
        argv: rawArgs.slice(2),
    });

    return new Promise(resolve => {
        resolve({
            'from': getAllowedOrDefault(allowedFrom, args['--from'], defaultFrom),
            'to': getAllowedOrDefault(allowedTo, args['--to'], defaultTo),
            'rtmpHost': args['--rtmp-host'],
        })
    });
}

/**
 * FFMPEG realted methods
 */

function ffmpegConfiguration (options) {
    const configurations = {};
    configurations['-i'] = options['hlsUrl'];
    configurations['-y'] = '';
    configurations['-use_wallclock_as_timestamps'] = 1;
    configurations['-preset'] = 'veryfast';
    configurations['-tune'] = 'zerolatency';
    configurations['-bufsize'] = 1000;
    configurations['-async'] = 1;
    configurations['-c:a'] = 'aac';
    configurations['-c:v'] = 'libx264';
    configurations['-x264opts'] = 'keyint=3:min-keyint=2:no-scenecut';
    configurations['-f'] = 'flv';
    configurations[generateRTMPUrl(options)] = '';

    return configurations;
}

export async function cli (args) {
    parseArgToOptions(args)
        .then(options => {
            return askForRTMPKey(options.to).then(key => {
                return {
                    ...options,
                    rtmpKey: key
                };
            });
        })
        .then(options => {
            return askForStreamUrl(options.from).then(url => {
                return {
                    ...options,
                    hlsUrl: url,
                };
            });
        })
        .then(options => ffmpegConfiguration(options))
        .then(configuration => {
            console.log(configuration);
        })
        .catch(e => fancyLogger(`[ERROR]: ${e.message}`, 'red'));
}
