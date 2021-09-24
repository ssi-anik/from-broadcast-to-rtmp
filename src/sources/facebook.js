const axios = require('axios');
const {askForChoices} = require("../helpers");
const {Source} = require("./source");

class Facebook extends Source {

    askForUrlMessage () {
        return 'Enter video URL [Facebook]:'
    }

    getHLSUrlFromSourceUrl (url) {
        return axios
            .get(url, {
                headers: {
                    // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.47 Safari/537.36'
                    'user-agent': 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)',
                }
            })
            .then(data => {
                const result = {
                    streamType: null,
                    videoId: null,
                    videoUrl: null,
                    isLiveStream: false,
                    isBroadcast: false,
                    hdSrcNoRateLimit: null,
                    sdSrcNoRateLimit: null,
                    hdSrc: null,
                    sdSrc: null,
                }

                const html = data.data;
                // https://www.npmjs.com/package/fb-video-downloader
                html.replace(/is_live_stream:([^,]+),/, (content, isLiveStream) => {
                    result.isLiveStream = "true" === isLiveStream;

                    return content;
                }).replace(/is_broadcast:([^,]+),/, (content, isBroadcast) => {
                    result.isBroadcast = "true" === isBroadcast;

                    return content;
                }).replace(/hd_src:"([^"]+)"/, (content, link) => {
                    result.hdSrc = link;

                    return content;
                }).replace(/sd_src:"([^"]+)"/, (content, link) => {
                    result.sdSrc = link;

                    return content;
                }).replace(/hd_src_no_ratelimit:"([^"]+)"/, (content, link) => {
                    result.hdSrcNoRateLimit = link;

                    return content;
                }).replace(/sd_src_no_ratelimit:"([^"]+)"/, (content, link) => {
                    result.sdSrcNoRateLimit = link;

                    return content;
                }).replace(/video_id:"([^"]+)"/, (content, videoId) => {
                    result.videoId = videoId;

                    return content;
                }).replace(/stream_type:"([^"]+)"/, (content, streamType) => {
                    result.streamType = streamType;

                    return content;
                }).replace(/videoData.*video_url:\s*"([^"]+)"/, (content, link) => {
                    result.videoUrl = link;

                    return content;
                });

                if ( false === result.isLiveStream ) {
                    throw Error('The provided URL is either not valid or not streaming live.');
                }

                const choices = [];
                if ( result.hdSrc ) {
                    choices.push({
                        name: 'HD',
                        value: result.hdSrc,
                    });
                }
                if ( result.hdSrcNoRateLimit ) {
                    choices.push({
                        name: 'HD No rate limit',
                        value: result.hdSrcNoRateLimit,
                    });
                }

                if ( result.sdSrc ) {
                    choices.push({
                        name: 'SD',
                        value: result.sdSrc,
                    });
                }
                if ( result.sdSrcNoRateLimit ) {
                    choices.push({
                        name: 'SD No rate limit',
                        value: result.sdSrcNoRateLimit,
                    });
                }

                console.log(result);
                return askForChoices('Which resolution do you want to stream?', choices).then(ans => {
                    console.log(ans);
                    return ans;
                });
            });
    }
}

module.exports = {
    Facebook
}
