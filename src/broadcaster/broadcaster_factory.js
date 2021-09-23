const {Ffmpeg} = require("./ffmpeg");

class BroadcasterFactory {
    static make (source = null, destination = null) {
        return new Ffmpeg(source, destination);
    }
}

module.exports = {
    BroadcasterFactory
}
