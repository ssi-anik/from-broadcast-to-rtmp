const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');

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

function logger (text) {
    console.log(text);
}

function getYoutubeVideoId (str) {
    /**
     * Sauce: https://github.com/Rubenennj/youtube-scrapper/blob/81371c07128f5601dce53563865c581183d10b7d/src/util/Util.ts#L42
     */
    // https://www.youtube.com/v/s2h28p4s-Xs
    if ( str.includes("/v/") ) {
        return str.split("/v/")[1].split("&")[0]
    }
    // https://www.youtube.com/embed/s2h28p4s-Xs
    if ( str.includes("youtube.com/embed/") ) {
        return str.split("embed/")[1].split("&")[0]
    }
    // https://youtu.be/s2h28p4s-Xs
    if ( str.includes("youtu.be/") && !str.includes("/v/") ) {
        return str.split("youtu.be/")[1].split("&")[0];
    }
    // https://www.youtube.com/watch?v=s2h28p4s-Xs
    if ( str.includes("watch?v=") ) {
        return str.split("watch?v=")[1].split("&")[0]
    }

    // everything else
    return str;
}

function objectTraversal (data, keys, defaultValue = undefined) {
    if ( keys.length === 0 ) {
        return data;
    }

    const key = keys.shift();
    const selectedNodeValue = data[key];
    if ( selectedNodeValue === undefined ) {
        return defaultValue;
    }

    return objectTraversal(selectedNodeValue, keys, defaultValue);
}

function getHlsUrlForYoutubeVideo (videoId) {
    // https://github.com/Rubenennj/youtube-scrapper/blob/81371c07128f5601dce53563865c581183d10b7d/src/functions/getVideoInfo.ts#L5
    return axios.get(`https://www.youtube.com/watch?v=${videoId}&hl=en`).then(r => {
        const json = JSON.parse(r.data.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0]);

        const reason = objectTraversal(json, [
            'playabilityStatus',
            'reason'
        ], false);
        if ( reason ) {
            throw Error(reason);
        }

        const isLiveContent = objectTraversal(json, [
            'videoDetails',
            'isLiveContent',
        ], false);
        if ( false === isLiveContent ) {
            throw Error('The provided URL is not streaming live.');
        }

        const url = objectTraversal(json, [
            'streamingData',
            'hlsManifestUrl',
        ], '');
        if ( url === '' ) {
            throw Error('Cannot extract data for the URL.')
        }

        return url;
    });
}

function fancyLogger (text, color = 'green') {
    logger(chalk.keyword(color)(text));
}

function askForInput (message, minimumLength = null, errorMessage = null) {
    return inquirer.prompt({
        'type': 'input',
        'name': 'input',
        message
    }).then(r => {
        if ( (null === minimumLength) || (r.input.length >= minimumLength) ) {
            return r.input;
        }

        errorMessage = errorMessage || `Invalid input. Minimum length: ${minimumLength || 'N/A'}`;

        throw Error(errorMessage);
    });
}

function execCommand (cmd, args, onData, onError, onFinish) {
    // https://stackoverflow.com/a/66581232/2190689

    if ( typeof args === 'string' ) {
        args = args.split(' ');
    }

    let proc = require('child_process').spawn(cmd, args);
    proc.stdout.on('data', onData);
    proc.stderr.setEncoding("utf8")
    proc.stderr.on('data', onError);
    proc.on('close', onFinish);
}

module.exports = {
    allowedTo,
    allowedFrom,
    defaultFrom,
    defaultTo,
    getAllowedOrDefault,
    logger,
    fancyLogger,
    getYoutubeVideoId,
    getHlsUrlForYoutubeVideo,
    askForInput,
    execCommand
}
