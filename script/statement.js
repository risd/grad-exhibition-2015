var through = require('through2');

module.exports = Statement;

function Statement (selector) {
    if (!(this instanceof Statement)) return new Statement(selector);
    if (!selector) throw new Error('Requires selector.');

    this.selector = selector;
    this.el = document.querySelector(selector);
    this.anchor = this.el.querySelector('a');
}

Statement.prototype.inActive = function () {
    var self = this;
    this.anchor.href = '/statement';
    this.el.classList.add('inActive');
    this.el.classList.remove('active');
};

Statement.prototype.active = function () {
    var self = this;
    this.anchor.href = '/';
    this.el.classList.add('active');
    this.el.classList.remove('inActive');
};
