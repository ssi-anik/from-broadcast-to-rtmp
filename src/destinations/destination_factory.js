const {Facebook} = require('./facebook');

class DestinationFactory {
    static make (destination, rtmpUrl) {
        if ( destination === 'facebook' ) {
            return new Facebook(rtmpUrl);
        }

        throw Error(`Invalid destination ${destination}`);
    }
}

module.exports = {
    DestinationFactory
}
