const {Facebook} = require('./facebook');
const {Youtube} = require('./youtube');

class DestinationFactory {
    static make (destination, rtmpUrl) {
        if ( destination === 'facebook' ) {
            return new Facebook(rtmpUrl);
        }

        if ( destination === 'youtube' ) {
            return new Youtube(rtmpUrl);
        }

        throw Error(`Invalid destination ${destination}`);
    }
}

module.exports = {
    DestinationFactory
}
