const {Youtube} = require('./youtube')
const {Twitch} = require('./twitch')

class SourceFactory {
    static make (source) {
        if ( source === 'youtube' ) {
            return new Youtube();
        }

        if ( source === 'twitch' ) {
            return new Twitch();
        }

        throw Error(`Invalid source: ${source}`);
    }
}


module.exports = {
    SourceFactory
}
