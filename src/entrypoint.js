const {Command} = require('commander');
const {SourceFactory} = require('./sources/source_factory');
const {DestinationFactory} = require('./destinations/destination_factory');
const {BroadcasterFactory} = require('./broadcaster/broadcaster_factory');

const {
    allowedSources,
    allowedDestinations,
    defaultSource,
    defaultDestination,
    validateUrl,
    fancyLogger,
    validateInputAgainstAllowedData,
} = require("./helpers");

function registerCommandAndParseInput (rawArgs) {
    const program = new Command();
    program.version(require('../package.json').version);

    program
        .option('-s, --source <source>', "From the source where it's broadcasting", defaultSource)
        .option('-d, --destination <destination>', "To the destination where you want to broadcast", defaultDestination)
        .option('-ru, --rtmp-url <url>', 'Overwrite the existing RTMP URL', '')
        .parse(rawArgs);

    const options = program.opts();

    return new Promise(resolve => {
        resolve({
            'source': options.source,
            'destination': options.destination,
            'rtmpUrl': options.rtmpUrl,
        })
    });
}

function validateInputsAndParseAsOptions (inputs) {
    return {
        'source': validateInputAgainstAllowedData(allowedSources, inputs.source, 'source'),
        'destination': validateInputAgainstAllowedData(allowedDestinations, inputs.destination, 'destination'),
        'rtmpUrl': validateUrl(inputs.rtmpUrl, [
            'rtmp:', 'rtmps:'
        ], true),
    };
}

function mapOptionsToImplementation (options) {
    return {
        source: SourceFactory.make(options.source),
        destination: DestinationFactory.make(options.destination, options.rtmpUrl)
    }
}

function broadcast (options) {
    return BroadcasterFactory.make(options.source, options.destination)
        .broadcast();
}

async function entrypoint (args) {
    registerCommandAndParseInput(args)
        .then(inputs => validateInputsAndParseAsOptions(inputs))
        .then(options => mapOptionsToImplementation(options))
        .then(options => broadcast(options))
        /*.then(options => {
            return askForRTMPKey(options.destination).then(key => {
                return {
                    ...options,
                    rtmpKey: key
                };
            });
        })
        .then(options => {
            return askForStreamUrl(options.source).then(url => {
                return {
                    ...options,
                    hlsUrl: url,
                };
            });
        })
        .then(options => generateFFMPEGConfiguration(options))
        .then(args => {
            execCommand('ffmpeg', args, onData, onError, onFinished('Streaming'))
        })*/
        .catch(e => fancyLogger(`[ERROR]: ${e.message}`, 'red'));
}

module.exports = entrypoint;
