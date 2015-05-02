var through = require('through2');

module.exports = Poster;

function Poster (selector) {
    if (!(this instanceof Poster)) return new Poster(selector);
    if (!selector) throw new Error('Requires selector.');

    this.selector = selector;
    this.el = document.querySelector(selector);
}