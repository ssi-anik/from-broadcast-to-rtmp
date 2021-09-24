const chalk = require('chalk');
const inquirer = require('inquirer');

const allowedSources = {
    'yt': 'youtube',
    'youtube': 'youtube',
    'ttv': 'twitch',
    'twitch': 'twitch',
    'fb': 'facebook',
    'facebook': 'facebook',
};
const allowedDestinations = {
    'fb': 'facebook',
    'facebook': 'facebook',
    'yt': 'youtube',
    'youtube': 'youtube',
};
const defaultSource = 'youtube';
const defaultDestination = 'facebook';

function validateInputAgainstAllowedData (allowed, provided, reference = null) {
    const lowercase = provided && provided.toLowerCase() || '';
    if ( !allowed[lowercase] ) {
        const msg = `"${provided}" is invalid${reference ? ` for ${reference}` : ''}. Allowed values are: "${Object.keys(allowed)
            .join('", "')}"`;

        throw Error(msg)
    }

    return allowed[provided];
}

function validateUrl (str, protocols = ['http:', 'https:'], allowEmpty = false) {
    if ( !str ) {
        if ( allowEmpty ) {
            return str;
        }

        throw Error('Given URL is empty');
    }

    const url = new URL(str);

    if ( !protocols.includes(url.protocol) ) {
        throw Error(`Invalid protocol. Allowed protocols are: "${protocols.join('", "')}"`);
    }

    return str;
}

function logger (text) {
    console.log(text);
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

function askForChoices (message, choices, preSelected = null) {
    return inquirer.prompt({
        'type': 'list',
        'name': 'input',
        message,
        choices,
        preSelected
    }).then(r => {
        return r.input;
    });
}

function execCommand (cmd, args, onData, onError, onClose) {
    // https://stackoverflow.com/a/66581232/2190689
    // https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

    let proc = require('child_process').spawn(cmd, args);
    proc.stdout.on('data', onData);
    proc.stderr.setEncoding("utf8")
    proc.stderr.on('data', onError);
    proc.on('close', onClose);
}

module.exports = {
    allowedDestinations,
    allowedSources,
    defaultSource,
    defaultDestination,
    validateInputAgainstAllowedData,
    validateUrl,
    fancyLogger,
    objectTraversal,
    askForInput,
    askForChoices,
    execCommand
}
