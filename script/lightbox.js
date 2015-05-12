var fs = require('fs');

var from = require('from2');
var through = require('through2');

var hyperglue = require('hyperglue');
var lightboxTemplate =
        fs.readFileSync(
            __dirname + '/lightbox.html')
          .toString();
var behanceImageTemplate =
        fs.readFileSync(
            __dirname + '/behanceImage.html')
          .toString();
var behanceTextTemplate =
        fs.readFileSync(
            __dirname + '/behanceText.html')
          .toString();
var behanceEmbedTemplate =
        fs.readFileSync(
            __dirname + '/behanceEmbed.html')
          .toString();


module.exports = Lightbox;

function Lightbox (selector) {
    if (!(this instanceof Lightbox)) return new Lightbox(selector);
    if (!selector) throw new Error('Requires selector.');
    var self = this;

    this.container = document.querySelector(selector);
    this.wrapper = function () {
        return self
            .container
            .querySelector(selector + '-wrapper');
    };
    this.fixedElements = function () {
        return [
            self.container.querySelector('.name-tag'),
            self.container.querySelector('.close')
        ];
    };

    this.closeStream = through.obj(function close (row, enc, next) {
        console.log('lightbox.close');
        this.push(row);
        self.setInActive();
        next();
    });
}

Lightbox.prototype.setActiveStream = function () {
    var self = this;

    return through.obj(open);

    function open (project, enc, next) {
        console.log('lightbox.open');
        console.log(project);
        self.setActive(project);
        this.push(project);
        next();
    }
};

Lightbox.prototype.setInActiveStream = function () {
    var self = this;

    return through.obj(open);

    function open (row, enc, next) {
        console.log('lightbox.close');
        self.setInActive();
        this.push(row);
        next();
    }
};

Lightbox.prototype.setActive = function (project) {
    var self = this;

    var toRender = hyperglue(lightboxTemplate, {
        '[class=student-name]': project.student_name,
        '[class=risd-program]': project.risd_program,
        '.website': [
            { 'a': { name: 'Behance URL',
                     href: project.url,
                     _text: 'Behance Site',
                     'class': 'external-link' } }
        ],
        '.project .name': project.project_name,
        '.description': project.description
    });

    project.modules
        .map(function (module) {
            if (module.type === 'text') {
                return createTextModule(module);
            }
            else if (module.type === 'image') {
                return createImageModule(module);
            }
            else if (module.type === 'embed') {
                return createEmbedModule(module);
            }
            else {
                return false;
            }
        })
        .filter(function (module) {
            return module !== false;
        })
        .forEach(function (module) {
            toRender
                .querySelector('.modules')
                .appendChild(module);
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

function createImageModule (module) {
    return hyperglue(behanceImageTemplate, {
            img: {
                src: module.sizes.max_1240 ?
                     module.sizes.max_1240 :
                     module.src
            }
        });
}
function createTextModule (module) {
    return hyperglue(behanceTextTemplate, {
            p: module.text_plain
        });
}
function createEmbedModule (module) {
    return hyperglue(behanceEmbedTemplate, {
            '.embed': { _html: module.embed }
        });
}

function projectKey (project) {
    return project.id;
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
