const {Command} = require('commander');

const {
    allowedFrom,
    allowedTo,
    askForInput,
    defaultFrom,
    defaultTo,
    execCommand,
    fancyLogger,
    getAllowedOrDefault,
    getHlsUrlForYoutubeVideo,
    getYoutubeVideoId
} = require("./helpers");

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
    if ( allowedTo['facebook'] === server ) {
        return askForFacebookRTMPKey();
    }

    throw Error(`Invalid RTMP server: ${server}`);
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
    if ( allowedFrom['youtube'] === service ) {
        return askForYoutubeURL();
    }

    throw Error(`Invalid broadcasting server: ${service}`);
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
 * Command related methods
 */

function registerCommand (rawArgs) {
    const program = new Command();
    program.version(require('../package.json').version);

    program
        /*.option('-s, --source <source>', "From the source where it's broadcasting", defaultFrom)
        .option('-d, --destination <destination>', "To the destination where you want to broadcast", defaultTo)*/
        .option('-rh, --rtmp-host <host>', 'Overwrite the existing RTMP host', '')
        .option('-t, --to <destination>', "To the destination where you want to broadcast", defaultTo)
        .option('-f, --from <source>', "From the source where it's broadcasting", defaultFrom)
        .parse(rawArgs);

    const options = program.opts();
    return new Promise(resolve => {
        resolve({
            'from': getAllowedOrDefault(allowedFrom, options.from, defaultFrom),
            'to': getAllowedOrDefault(allowedTo, options.to, defaultTo),
            'rtmpHost': options.rtmpHost,
        })
    });
}

/**
 * FFMPEG realted methods
 */

function generateFFMPEGConfiguration (options) {
    return [
        '-i',
        options['hlsUrl'],
        '-use_wallclock_as_timestamps',
        1,
        '-preset',
        'veryfast',
        '-tune',
        'zerolatency',
        '-bufsize',
        1000,
        '-async',
        1,
        '-c:a',
        'aac',
        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=3:min-keyint=2:no-scenecut',
        '-f',
        'flv',
        generateRTMPUrl(options)
    ];
}

function onData (data) {
    console.log(data);
}

function onError (err) {
    console.log(err);
}

function onFinished (info) {
    return () => {
        fancyLogger(`[INFO]: Task "${info}" finished`, 'white')
    };
}

async function entrypoint (args) {
    registerCommand(args)
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
        .then(options => generateFFMPEGConfiguration(options))
        .then(args => {
            execCommand('ffmpeg', args, onData, onError, onFinished('Streaming'))
        })
        .catch(e => fancyLogger(`[ERROR]: ${e.message}`, 'red'));
}

module.exports = entrypoint;
