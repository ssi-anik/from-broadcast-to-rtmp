const {Destination} = require("./destination");

class Facebook extends Destination {

    askForRTMPKeyMessage () {
        return 'Enter RTMP key [https://www.facebook.com/live/producer]:'
    }

    getDefaultURL () {
        return 'rtmps://live-api-s.facebook.com:443/rtmp/{KEY}';
    }
}

module.exports = {
    Facebook
}
