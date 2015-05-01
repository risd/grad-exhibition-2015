var through = require('through2');

module.exports = Information;

function Information (selector) {
    if (!(this instanceof Information)) return new Information(selector);
    if (!selector) throw new Error('Requires selector.');

    this.selector = selector;
    this.el = document.querySelector(selector);
    this.anchor = this.el.querySelector('a');
}

Information.prototype.inActive = function () {
    var self = this;
    this.anchor.href = '/info';
    this.el.classList.add('inActive');
    this.el.classList.remove('active');
};

Information.prototype.active = function () {
    var self = this;
    this.anchor.href = '/';
    this.el.classList.add('active');
    this.el.classList.remove('inActive');
};
