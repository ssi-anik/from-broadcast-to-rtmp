const {Destination} = require("./destination");

class Youtube extends Destination {

    askForRTMPKeyMessage () {
        return 'Enter RTMP key [https://youtube.com/livestreaming]:'
    }

    getDefaultURL () {
        return 'rtmps://a.rtmp.youtube.com/live2/{KEY}';
    }

    ffmpegExtraConfig () {
        // return ['-b', '2500k', '-minrate', '2500K', '-maxrate', '2500K'];
        return [];
    }
}

module.exports = {
    Youtube
}
