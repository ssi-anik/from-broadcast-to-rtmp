const {Youtube} = require('./youtube')

class SourceFactory {
    static make (source) {
        if ( source === 'youtube' ) {
            return new Youtube()
        }

        throw Error(`Invalid source: ${source}`);
    }
}


module.exports = {
    SourceFactory
}
