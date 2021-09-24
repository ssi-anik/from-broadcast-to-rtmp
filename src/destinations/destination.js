const {
    askForInput
} = require("../helpers");

class Destination {

    constructor (url = '') {
        this.url = url;
    }

    askForRTMPKeyMessage () {
        throw Error('Unimplemented askForUrlMessage method');
    }

    minimumLength () {
        return 1;
    }

    askForRTMPKeyErrorMessage () {
        return 'RTMP key cannot be empty';
    }

    askUserForRTMPKey () {
        return askForInput(this.askForRTMPKeyMessage(), this.minimumLength(), this.askForRTMPKeyErrorMessage());
    }

    getDefaultURL () {
        throw Error('Unimplemented getDefaultURL method');
    }

    getUrl () {
        return (this.url || this.getDefaultURL()).replace(/\/+$/, '').trim();
    }

    getRTMPKeyAppendedUrl () {
        return this.askUserForRTMPKey()
            .then(key => {
                return this.getUrl().replace(/\{KEY\}/, key);
            });
    }

    ffmpegExtraConfig () {
        return [];
    }

    extraConfig (type) {
        if ( type === 'ffmpeg' ) {
            return this.ffmpegExtraConfig();
        }

        return [];
    }
}

module.exports = {
    Destination
}
