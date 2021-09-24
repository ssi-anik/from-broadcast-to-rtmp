const twitch = require("twitch-m3u8");
const {Source} = require("./source");
const {askForChoices} = require("../helpers");

class Twitch extends Source {

    askForUrlMessage () {
        return 'Enter channel name only [Twitch]:'
    }

    validateUrl (channel) {
        channel = channel.trim();
        if ( !channel ) {
            throw Error('Channel cannot be empty');
        }

        return channel;
    }

    getHLSUrlFromSourceUrl (channel) {
        return twitch.getStream(channel, false)
            .then(data => {
                const choices = data.map(each => {
                    return {
                        name: each.quality,
                        value: each.url,
                    };
                }).filter(each => each.name.indexOf('audio') === -1);
                return askForChoices('Which resolution do you want to stream?', choices);
            })
            .catch(err => {
                throw Error(`Cannot extract the streamable URL for the channel "${channel}"`);
            });
    }
}

module.exports = {
    Twitch
}
