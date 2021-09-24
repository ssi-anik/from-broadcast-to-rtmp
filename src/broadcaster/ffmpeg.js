const {ExecutableBroadcaster} = require('./executable_broadcaster');

class Ffmpeg extends ExecutableBroadcaster {

    name () {
        return 'ffmpeg';
    }

    arguments (extraConfig, sourceUrl, destinationUrl) {
        return [
            '-i',
            sourceUrl,
            '-use_wallclock_as_timestamps',
            1,
            '-preset',
            'veryfast',
            '-tune',
            'zerolatency',
            '-bufsize',
            1000,
            '-async',
            1,
            '-c:a',
            'aac',
            '-c:v',
            'libx264',
            '-x264opts',
            'keyint=3:min-keyint=2:no-scenecut',
            ...extraConfig,
            '-f',
            'flv',
            destinationUrl
        ];
    }

    executable () {
        return 'ffmpeg';
    }
}

module.exports = {
    Ffmpeg
}
