var request = require('request');
var from = require('from2');
var through = require('through2');
var iterate = require('iterate');

module.exports = Work;

function Work (selector) {
    if (!(this instanceof Work)) return new Work(selector);
    if (!selector) throw new Error('Requires selector.');
    var self = this;

    this.s3 = 'https://risdgradshow2014.s3.amazonaws.com/';
    this.link = {
        meta: this.s3 + 'data/metdata.json',
        project: function (id) {
            return [
                    self.s3,
                    'projects/',
                    id,
                    '.json'
                ]
                .join('');
        }
    };
    this.requested = [];
    this.pages = [];
    this.included_departments = [];
}

Work.prototype.list = function() {
    var self = this;
    var eventStream = through.obj();

    Metadata()
        .pipe(recursivePage());

    return eventStream;

    function Metadata () {
        var pageStream = through.obj();

        if (self.pages.length > 0) {
            request(self.link.meta, function (err, res, body) {
                if (!error && res.statusCode == 200) {
                    self.pages = JSON.parse(body).pages;
                    feed(self.pages);
                } else {
                    console.log(error);
                    console.log(res.statusCode);
                }
            });
        } else {
            feed(self.pages);
        }

        return pageStream;

        function feed (pages) {
            pages.forEach(pageStream.push);
            pageStream.push(null);
        }
    }

    function recursivePage () {
        return through.obj(recurse);

        function recurse (row, enc, next) {
            console.log(row);
        }
    }
};