var fs = require('fs');

var cors = require('corslite');
var request = require('request');
var from = require('from2');
var through = require('through2');

var hyperglue = require('hyperglue');
var Packery = require('packery');
var pieceTemplate = fs.readFileSync(__dirname + '/piece.html')
                 .toString();


module.exports = Work;

function Work (selector) {
    if (!(this instanceof Work)) return new Work(selector);
    if (!selector) throw new Error('Requires selector.');
    var self = this;

    this.container = document.querySelector(selector);
    this.packery = new Packery(this.container, {
            itemSelector: '.piece',
            columnWidth: '.piece',
            percentPosition: true
        });

    this.s3 = 'https://risdgradshow2015.s3.amazonaws.com/';
    this.link = {
        meta: this.s3 + 'data/metadata.json',
        project: function (id) {
            return [
                    self.s3,
                    'projects/',
                    id,
                    '.json'
                ]
                .join('');
        }
    };
    this.requested = [];
    this.pages = [];
    this.included_departments = [];
    this.projects = [];

    this.projectForKeyStream = through.obj();
}

Work.prototype.projectForKey = function (id) {
    var self = this;
    console.log('projectforkey');
    console.log(typeof id);
    var needle =
        self.projects.filter(function (project) {
            console.log(typeof projectKey(project));
            return id === projectKey(project);
        });
    if (needle.length === 1) {
        console.log('found!');
        this.projectForKeyStream.push(needle[0]);
    } else {
        console.log('not found!');
        var stream = this;

        cors(self.link.project(id), function (err, res) {
            if (!err && res.status === 200) {
                needle =
                    behanceSchemaTransform(
                        JSON.parse(res.responseText));

                // we don't want dupes in our
                // project array. check to see
                // if its been added or not.
                var finding =
                    self.projects
                        .filter(function (project) {
                            return projectKey(needle) === projectKey(project);
                        });
                if (finding.length === 0) {
                    self.projects.push(needle);
                }

                self.projectForKeyStream.push(needle);

            } else {
                console.log(err);
                console.log(res.status);
            }
        });
    }
};

Work.prototype.fetchProjects = function () {
    var self = this;
    return through.obj(projects);

    function projects (projectURL, enc, next) {
        console.log('GetProjects');
        var stream = this;
        cors(projectURL, function (err, res) {
            var body = { objects: [] };
            if (!err && res.status === 200) {
                body =
                    JSON.parse(res.responseText);

                // a project could have been added
                // via the projectForKey entry
                // so it might not need to be
                // added to the projects list
                body.objects = body.objects
                    .map(behanceSchemaTransform);

                var toAdd = 
                    body.objects
                    .filter(function (d) {
                        var add = true;

                        self.projects.forEach(function (project) {
                            if (projectKey(project) === projectKey(d)) {
                                add = false;
                            }
                        });

                        return add;
                    });

                self.projects = self.projects.concat(toAdd);

            } else {
                console.log(err);
                console.log(res.status);
            }
            // all objects need thumbnails
            // this is the pipeline for that
            shuffle(body.objects)
                .forEach(function (project) {
                    stream.push(project);
                });
            next();
        });
    }
};

Work.prototype.fetchMeta = function() {
    var self = this;

    return from.obj([self.link.meta])
        .pipe(GetMetadata());

    function GetMetadata () {
        return through.obj(meta);

        function meta (url, enc, next) {
            console.log('GetMetadata');
            var stream = this;
            if (self.pages.length > 0) {
                feed();
            } else {
                cors(url, function (err, res) {
                    if (!err && res.status === 200) {
                        var body =
                            JSON.parse(res.responseText);

                        self.included_departments =
                            body.included_departments;
                        self.pages = body.pages;
                    } else {
                        console.log(err);
                        console.log(res.status);
                    }
                    feed();
                });
            }

            function feed () {
                shuffle(self.pages)
                    .forEach(function (page) {
                        stream.push(page);
                    });
                next();
            }
        }
    }
};

Work.prototype.render = function () {
    var self = this;

    return through.obj(rndr);

    function rndr (project, enc, next) {
        var stream = this;

        var toRender = hyperglue(pieceTemplate, {
                '[class=student-name]': project.student_name,
                '[class=risd-program]': project.risd_program
            });

        var cover_image = toRender.querySelector('img');
        cover_image.src = project.cover.src;
        var appended = self.container.appendChild(toRender);
        appended.style.visibility = 'hidden';

        cover_image.addEventListener('load', function () {
            self.packery.appended(toRender);
            self.packery.layout();
            
            appended.style.visibility = 'visible';

            stream.push({ el: appended, data: project });
            next();
        });
    }
};

function behanceSchemaTransform (project) {
    var modules_for_cover = [];
    var modules_to_include = [];
    project.details.modules.forEach(function (md, mi) {
        if (md.type === 'image') {
            modules_for_cover.push(md);
        }
        // these are all cases that are
        // covered in lightbox.js
        if ((md.type === 'image') |
            (md.type === 'text') |
            (md.type === 'embed') |
            (md.type === 'video')) {

            modules_to_include.push(md);
        }
    });

    var random_cover;
    if (modules_for_cover.length > 0) {
        // random_cover_option
        // based on images to include
        var random_module =
            modules_for_cover[Math.floor(Math.random() *
                               modules_for_cover.length)];

        random_cover = {
            original_width: +random_module.width,
            original_height: +random_module.height,
            src: random_module.src
        };
        random_cover.height = (random_cover.width*
                               random_module.height)/
                              random_module.width;
    } else {
        // otherwise, just use a the cover that
        // is included
        random_cover = {
            original_width: 404,
            original_height: 316,
            src: project.details.covers['404']
        };
    }

    var formatted = {
        project_name: project.name,
        student_name: project.owners[0].display_name,
        risd_program: project.risd_program,
        risd_program_class:
            escape_department(project.risd_program),
        modules: modules_to_include,
        cover: random_cover,
        description: project.details.description,
        url: project.owners[0].url,
        personal_link: project.personal_link,
        id: project.id
    };
    return formatted;
}

function projectKey (project) {
    return project.id + '';
}

function shuffle (o) {
    for(var j, x, i = o.length;
        i;
        j = Math.floor(Math.random() * i),
        x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function escape_department(d) {
    return d.toLowerCase().replace(/ /g, '-');
}
