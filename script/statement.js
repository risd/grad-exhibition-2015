var through = require('through2');

module.exports = Statement;

function Statement (selector) {
    if (!(this instanceof Statement)) return new Statement(selector);
    if (!selector) throw new Error('Requires selector.');

    this.name = 'statement';
    this.active = false;
    this.selector = selector;
    this.background = document.querySelector(selector + '-background');
    this.foreground = document.querySelector(selector + '-foreground');
}

Statement.prototype.setInActive = function () {
    var self = this;
    this.active = false;
    this.background.classList.add('inActive');
    this.foreground.classList.add('inActive');
    this.background.classList.remove('active');
    this.foreground.classList.remove('active');
};

Statement.prototype.setActive = function () {
    var self = this;
    this.active = true;
    this.background.classList.add('active');
    this.foreground.classList.add('active');
    this.background.classList.remove('inActive');
    this.foreground.classList.remove('inActive');
};

Statement.prototype.clicked = function () {
    var self = this;
    var eventStream = through.obj();

    this.foreground
        .addEventListener('click', toggle, false);

    function toggle (ev) {
        eventStream.push({
            name: self.name,
            active: self.active
        });
    }

    return eventStream;
};