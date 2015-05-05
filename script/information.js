var through = require('through2');

module.exports = Information;

function Information (selector) {
    if (!(this instanceof Information)) return new Information(selector);
    if (!selector) throw new Error('Requires selector.');

    this.name = 'info';
    this.active = false;
    this.selector = selector;
    this.background = document.querySelector(selector + '-background');
    this.foreground = document.querySelector(selector + '-foreground');
}

Information.prototype.setInActive = function () {
    var self = this;
    this.active = false;
    this.background.classList.add('inActive');
    this.foreground.classList.add('inActive');
    this.background.classList.remove('active');
    this.foreground.classList.remove('active');
};

Information.prototype.setActive = function () {
    var self = this;
    this.active = true;
    this.background.classList.add('active');
    this.foreground.classList.add('active');
    this.background.classList.remove('inActive');
    this.foreground.classList.remove('inActive');
};

Information.prototype.clicked = function () {
    var self = this;
    var eventStream = through.obj();

    this.foreground
        .addEventListener('click', toggle, false);

    function toggle (ev) {
        if (!(ev.target.classList.contains('external-link'))) {
            eventStream.push({
                name: self.name,
                active: self.active
            });
        }
    }

    return eventStream;
};
