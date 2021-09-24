const {
    askForInput,
    validateUrl
} = require("../helpers");

class Source {

    askForUrlMessage () {
        throw Error('Unimplemented askForUrlMessage method');
    }

    minimumLength () {
        return null;
    }

    askForUrlErrorMessage () {
        return null;
    }

    disallowEmptyString (str, msg) {
        str = str.trim();
        if ( !str ) {
            throw Error(msg);
        }

        return str;
    }

    disallowEmptyUrl (url) {
        return this.disallowEmptyString(url, 'URL cannot be empty')
    }

    validateUrl (url) {
        return validateUrl(url);
    }

    parseUrl (url) {
        return url;
    }

    getHLSUrlFromSourceUrl (url) {
        throw Error('Unimplemented convertToHLSUrl method');
    }

    askUserForUrl () {
        return askForInput(this.askForUrlMessage(), this.minimumLength(), this.askForUrlErrorMessage());
    }

    getHLSUrl () {
        return this.askUserForUrl()
            .then(url => this.validateUrl(url))
            .then(url => this.parseUrl(url))
            .then(url => this.getHLSUrlFromSourceUrl(url));
    }
}

module.exports = {
    Source
}
