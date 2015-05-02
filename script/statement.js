var through = require('through2');

module.exports = Statement;

function Statement (selector) {
    if (!(this instanceof Statement)) return new Statement(selector);
    if (!selector) throw new Error('Requires selector.');

    this.selector = selector;
    this.background = document.querySelector(selector + '-background');
    this.foreground = document.querySelector(selector + '-foreground');
    this.anchor = this.background.querySelector('a');
}

Statement.prototype.inActive = function () {
    var self = this;
    this.anchor.href = '/statement';
    this.background.classList.add('inActive');
    this.foreground.classList.add('inActive');
    this.background.classList.remove('active');
    this.foreground.classList.remove('active');
};

Statement.prototype.active = function () {
    var self = this;
    this.anchor.href = '/';
    this.background.classList.add('active');
    this.foreground.classList.add('active');
    this.background.classList.remove('inActive');
    this.foreground.classList.remove('inActive');
};
