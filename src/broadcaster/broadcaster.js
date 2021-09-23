const {Source} = require('../sources/source');
const {Destination} = require('../destinations/destination');

class Broadcaster {
    constructor (source = null, destination = null) {
        this.source = source;
        this.destination = destination;
    }

    verifySourceType (source) {
        if ( !(source instanceof Source) ) {
            throw Error('Invalid source for broadcasting.');
        }
    }

    verifyDestinationType (destination) {
        if ( !(destination instanceof Destination) ) {
            throw Error('Invalid destination for broadcasting.');
        }
    }

    broadcastToDestination (sourceUrl, destinationUrl) {
        throw Error('Unimplemented broadcastToDestination');
    }

    broadcast (source = null, destination = null) {
        source = source || this.source;
        destination = destination || this.destination;

        this.verifySourceType(source);
        this.verifyDestinationType(destination);

        return destination.getRTMPKeyAppendedUrl()
            .then(rtmpUrl => {
                return source.getHLSUrl().then(hlsUrl => {
                    return {
                        source: hlsUrl,
                        destination: rtmpUrl
                    }
                });
            })
            .then(urls => this.broadcastToDestination(urls.source, urls.destination));
    }
}

module.exports = {
    Broadcaster
}
