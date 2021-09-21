# From Broadcast to RTMP

From stream servers:

- Youtube

To Stream servers:

- Facebook

## Requirements

Host machine must have

- `node` installed. Tested with `v14.15`
- `ffmpeg` installed. Tested with `4.2.4-1ubuntu0.1`

## Installation

- Clone the repository.
- Run `yarn install`
- Run `npm link`

## Usage

Example: To stream from **Youtube** to **Facebook**.

* Grab the URL for Youtube. Example formats:
    - https://www.youtube.com/v/s2h28p4s-Xs
    - https://www.youtube.com/embed/s2h28p4s-Xs
    - https://youtu.be/s2h28p4s-Xs
    - https://www.youtube.com/watch?v=s2h28p4s-Xs
    - `s2h28p4s-Xs`
* Visit [Facebook Live Producer Dashboard](https://www.facebook.com/live/producer).
    - Grab your Stream key.
* From your console, run `broadcast-to-rtmp`. It'll then ask questions for required information. Answer to those
  questions.

## Command variations

```shell
broadcast-to-rtmp

broadcast-to-rtmp --from youtube
broadcast-to-rtmp --from yt

broadcast-to-rtmp --to facebook
broadcast-to-rtmp --to fb

broadcast-to-rtmp --from youtube --to facebook

broadcast-to-rtmp --rtmp-host "rtmps://live-api-s.facebook.com:443/rtmp/"
```

## Aliases

- `--from` has alias with `-f` `-s`.
- `--to` has alias with `-t` `-d`.
- `--rtmp-host` has alias with `-r` `-rh` (If the default host doesn't work.)

## Note

- **THIS CLI APPLICATION ONLY WORKS FOR LIVE STREAM FROM THE REMOTE SOURCE(S). ANY VIDEO OTHER THAN LIVE STREAMS WILL
  NOT WORK.**
- **POSSIBLY THE PROJECT IS COMPLETE FROM MY SIDE, YOU CAN FORK AND MAINTAIN YOUR OWN CHANGES IF NOT MERGED.**
