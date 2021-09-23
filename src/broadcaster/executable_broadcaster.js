const {Broadcaster} = require('./broadcaster');
const {execCommand} = require('../helpers');

class ExecutableBroadcaster extends Broadcaster {

    onData (data) {
        console.log(data);
    }

    onError (error) {
        console.log(error);
    }

    onClose (code) {
        console.log(`Process finished with code: ${code}`);
    }

    executable () {
        throw Error("Unimplemented executable method");
    }

    arguments (sourceUrl, destinationUrl) {
        throw Error('Unimplemented arguments method');
    }

    broadcastToDestination (sourceUrl, destinationUrl) {
        return execCommand(this.executable(), this.arguments(sourceUrl, destinationUrl), this.onData, this.onError, this.onClose);
    }
}

module.exports = {
    ExecutableBroadcaster
}
