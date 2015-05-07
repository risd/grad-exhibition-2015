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
    this.departments = [];
}

Nav.prototype.ensureDepartment = function (departmentToEnsure) {
    var result = false;
    var check = this.departments
        .map(escape_department)
        .filter(function (department) {
            return departmentToEnsure === department;
        });
    if (check.length === 1) {
        result = true;
    }

    return result;
};

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

function escape_department(d) {
    return d.toLowerCase().replace(/ /g, '-');
}

