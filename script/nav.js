var fs = require('fs');

var from = require('from2');
var through = require('through2');

var hyperglue = require('hyperglue');
var template =
        fs.readFileSync(
            __dirname + '/nav.html')
          .toString();

module.exports = Nav;

function Nav (selector) {
    if (!(this instanceof Nav)) return new Nav(selector);
    if (!selector) throw new Error('Requires selector.');
    var self = this;

    this.container = document.querySelector(selector);
    this.mobileToggle = this.container.querySelector('.mobile-toggle');
    this.departments = [];
}

Nav.prototype.render = function () {
    var self = this;

    return through.obj(rndr);

    function rndr (departments, enc, next) {
        self.departments = ['All'].concat(departments);
        var links = self.departments
            .map(function (department) {
                return {
                    a: {
                        href:
                            '/work/department/' +
                            escape_department(
                                department),
                        _text: department
                    }
                };
            });

        var toRender =
            hyperglue(template, { li: links });

        self.container.appendChild(toRender);
        this.push(departments);
        next();
    }
};

Nav.prototype.mobileEnableButton = function () {
    var clicks = through.obj();
    this.mobileToggle
        .addEventListener('click', function (ev) {
            console.log('enable');
            console.log(ev.target.tagName);
            if ((ev.target.tagName === 'svg') ||
                (ev.target.tagName === 'path')) {
                clicks.push(ev);
            }
        });

    return clicks;
};

Nav.prototype.mobileDisableButton = function () {
    var clicks = through.obj();

    this.container
        .addEventListener('click', function (ev) {
            if ((ev.target.tagName === 'NAV') ||
                (ev.target.tagName === 'UL') ||
                (ev.target.tagName === 'LI')) {
                clicks.push(ev);
            }
        });

    return clicks;
};

Nav.prototype.mobileMenuInActive = function () {
    this.container.classList.remove('active');
};

Nav.prototype.mobileMenuActiveS = function () {
    var self = this;
    return through.obj(active);

    function active (ev, enc, next) {
        console.log(self.container);
        self.container.classList.add('active');
        this.push(ev);
        next();
    }
};

Nav.prototype.mobileMenuInActiveS = function () {
    var self = this;
    return through.obj(inactive);

    function inactive (ev, enc, next) {
        console.log(self.container);
        self.container.classList.remove('active');
        this.push(ev);
        next();
    }
};

Nav.prototype.mobileToggleButtonShow = function () {
    var self = this;

    return through({ objectMode: true,
                     allowHalfOpen: true}, show);

    function show (row, enc, next) {
        self.mobileToggle.classList.add('show');
        this.push(row);
        next();
    }
};

Nav.prototype.mobileToggleButtonHide = function () {
    var self = this;

    return through({ objectMode: true,
                     allowHalfOpen: true}, hide);

    function hide (row, enc, next) {
        self.mobileToggle.classList.remove('show');
        this.push(row);
        next();
    }
};

function escape_department(d) {
    return d.toLowerCase().replace(/ /g, '-');
}

