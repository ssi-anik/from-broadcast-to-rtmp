import arg from 'arg';
import {
    allowedFrom,
    allowedTo,
    askForInput,
    defaultFrom,
    defaultTo,
    fancyLogger,
    getAllowedOrDefault,
    getYoutubeVideoId,
    getHlsUrlForYoutubeVideo
} from "./helpers";

function getYoutubeStreamUrl (url) {
    //YoutubeVideo.json.streamingData:.hlsManifestUrl
    return scrapper.getVideoInfo(url).then(video => {
        console.log(video.info.isLiveContent, video.info);
        return new Promise(resolve => {
            return resolve(video.YoutubeVideo.json.streamingData.hlsManifestUrl || '')
        });
    }).catch(e => {
        fancyLogger(`Error occurred when parsing video from: "${url}". Reason: ${e.message}`, 'red');
        process.exit(1);
    });
}

async function setHLSUrl (options) {
    const streamUrl = options.streamURL;
    let url = '';
    if ( options.from === allowedFrom['youtube'] ) {
        url = await getYoutubeStreamUrl(streamUrl);
    }

    if ( url.length === 0 ) {
        throw Error('Cannot fetch stream URL for: ' + streamUrl);
    }

    return {
        ...options,
        hls_url: url,
    };
}

// ------------

/**
 * RTMP Server related methods
 */

function askForRTMPKey (server) {
    return new Promise((resolve, reject) => {
        if ( allowedTo['facebook'] === server ) {
            resolve(askForFacebookRTMPKey());
        }

        reject(`Invalid RTMP server. ${server}`);
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

        reject(`Invalid broadcasting server. ${service}`);
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

        '-f': '--from',
        '-t': '--to',
    }, {
        argv: rawArgs.slice(2),
    });

    return new Promise(resolve => {
        resolve({
            'from': getAllowedOrDefault(allowedFrom, args['--from'], defaultFrom),
            'to': getAllowedOrDefault(allowedTo, args['--to'], defaultTo)
        })
    });
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
        .then(options => console.log(options))
        .catch(e => fancyLogger(`[ERROR]: ${e.message}`, 'red'));
}
