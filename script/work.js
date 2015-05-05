var through = require('through2');

module.exports = Work;

function Work (selector) {
    if (!(this instanceof Work)) return new Work(selector);
    if (!selector) throw new Error('Requires selector.');
}