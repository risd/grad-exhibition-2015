var fs = require('fs');

var from = require('from2');
var through = require('through2');

var hyperglue = require('hyperglue');
var lightboxTemplate =
        fs.readFileSync(
            __dirname + '/lightbox.html')
          .toString();


module.exports = Lightbox;

function Lightbox (selector) {
    if (!(this instanceof Lightbox)) return new Lightbox(selector);
    if (!selector) throw new Error('Requires selector.');
    var self = this;

    this.container = document.querySelector(selector);

    this.openStream = through.obj(function open (project, enc, next) {
        console.log('lightbox.open');
        console.log(project);
        self.setActive(project);
        this.push(project);
        next();
    });
    this.closeStream = through.obj(function close (row, enc, next) {
        console.log('lightbox.close');
        this.push(row);
        self.setInActive();
        next();
    });
}

Lightbox.prototype.setActive = function (project) {
    var self = this;
    var modules = project.modules.map(function (module) {
            return module;
        });
    console.log('modules');
    console.log(modules);

    var toRender = hyperglue(lightboxTemplate, {
        '[class=student-name]': project.student_name,
        '[class=risd-program]': project.risd_program,
        '.website': [
            { 'a': { name: 'Behance URL',
                     href: project.url } }
        ],
        '.project .name': project.project_name,
        '.description': project.description
    });

    this.container.innerHTML = '';
    var appeneded = this.container.appendChild(toRender);
    appeneded
        .querySelector('.close')
        .addEventListener('click', function () {
            self.closeStream.push({});
        });
    
    this.container.classList.remove('inActive');
    this.container.classList.add('active');

};
Lightbox.prototype.setInActive = function () {
    this.container.classList.remove('active');
    this.container.classList.add('inActive');
};

function projectKey (project) {
    return project.id;
}
