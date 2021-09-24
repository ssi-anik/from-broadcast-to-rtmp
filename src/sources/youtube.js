const axios = require("axios");
const {Source} = require("./source");
const {objectTraversal} = require("../helpers");

class Youtube extends Source {

    askForUrlMessage () {
        return 'Enter source URL [Youtube]:'
    }

    parseUrl (url) {
        // https://github.com/Rubenennj/youtube-scrapper/blob/81371c07128f5601dce53563865c581183d10b7d/src/util/Util.ts#L42

        let videoId = url;
        if ( url.includes("/v/") ) {
            // Example: https://www.youtube.com/v/s2h28p4s-Xs
            videoId = url.split("/v/")[1].split("&")[0];
        } else if ( url.includes("youtube.com/embed/") ) {
            // Example: https://www.youtube.com/embed/s2h28p4s-Xs
            videoId = url.split("embed/")[1].split("&")[0];
        } else if ( url.includes("youtu.be/") && !url.includes("/v/") ) {
            // Example: https://youtu.be/s2h28p4s-Xs
            videoId = url.split("youtu.be/")[1].split("&")[0];
        } else if ( url.includes("watch?v=") ) {
            // Example: https://www.youtube.com/watch?v=s2h28p4s-Xs
            videoId = url.split("watch?v=")[1].split("&")[0]
        }

        return `https://www.youtube.com/watch?v=${videoId}&hl=en`;
    }

    validateUrl (url) {
        return this.disallowEmptyUrl(url);
    }

    getHLSUrlFromSourceUrl (url) {
        return axios.get(url)
            .then(r => {
                const json = JSON.parse(r.data.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0]);

                const reason = objectTraversal(json, [
                    'playabilityStatus', 'reason'
                ], false);
                if ( reason ) {
                    throw Error(reason);
                }

                const isLiveContent = objectTraversal(json, [
                    'videoDetails', 'isLiveContent',
                ], false);
                if ( false === isLiveContent ) {
                    throw Error('The provided URL is not streaming live.');
                }

                const url = objectTraversal(json, [
                    'streamingData', 'hlsManifestUrl',
                ], '');
                if ( url === '' ) {
                    throw Error('Cannot extract data for the URL.')
                }

                return url;
            });
    }
}

module.exports = {
    Youtube
}
