const {Youtube} = require('./youtube');
const {Twitch} = require('./twitch');
const {Facebook} = require('./facebook');

class SourceFactory {
    static make (source) {
        if ( source === 'youtube' ) {
            return new Youtube();
        }

        if ( source === 'twitch' ) {
            return new Twitch();
        }

        if ( source === 'facebook' ) {
            return new Facebook();
        }

        throw Error(`Invalid source: ${source}`);
    }
}


module.exports = {
    SourceFactory
}
