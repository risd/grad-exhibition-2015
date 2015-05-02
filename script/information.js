var through = require('through2');

module.exports = Information;

function Information (selector) {
    if (!(this instanceof Information)) return new Information(selector);
    if (!selector) throw new Error('Requires selector.');

    this.selector = selector;
    this.background = document.querySelector(selector + '-background');
    this.foreground = document.querySelector(selector + '-foreground');
    this.anchor = this.background.querySelector('a');
}

Information.prototype.inActive = function () {
    var self = this;
    this.anchor.href = '/info';
    this.background.classList.add('inActive');
    this.foreground.classList.add('inActive');
    this.background.classList.remove('active');
    this.foreground.classList.remove('active');
};

Information.prototype.active = function () {
    var self = this;
    this.anchor.href = '/';
    this.background.classList.add('active');
    this.foreground.classList.add('active');
    this.background.classList.remove('inActive');
    this.foreground.classList.remove('inActive');
};
