import inquirer from "inquirer";
import chalk from "chalk";
import axios from "axios";

export const allowedFrom = {
    'yt': 'youtube',
    'youtube': 'youtube',
};
export const allowedTo = {
    'fb': 'facebook',
    'facebook': 'facebook',
};
export const defaultFrom = 'youtube';
export const defaultTo = 'facebook';

export function getAllowedOrDefault (allowed, provided, defaultSelected) {
    return allowed[provided && provided.toLowerCase() || defaultSelected] || defaultSelected
}

export function logger (text) {
    console.log(text);
}

export function getYoutubeVideoId (str) {
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

export function objectTraversal (data, keys, defaultValue = undefined) {
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

export function getHlsUrlForYoutubeVideo (videoId) {
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

export function fancyLogger (text, color = 'green') {
    logger(chalk.keyword(color)(text));
}

export function askForInput (message, minimumLength = null, errorMessage = null) {
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

export function execCommand (cmd, args, onData, onError, onFinish) {
    // https://stackoverflow.com/a/66581232/2190689
    /*let spawn = require('child_process').spawn;
    let proc = spawn(cmd, args.split(' '));*/
    let proc = require('child_process').spawn(cmd, args.split(' '));
    proc.stdout.on('data', onData);
    proc.stderr.setEncoding("utf8")
    proc.stderr.on('data', onError);
    proc.on('close', onFinish);
}
