var through = require('through2');

var Poster = require('./poster.js')('.poster');
var Info = require('./information.js')('.info');
var Statement = require('./statement.js')('.statement');
var Nav = require('./nav.js')('nav');
var Work = require('./work.js')('.work');
var Lightbox = require('./lightbox.js')('.lightbox');

var Router = require('routes');
var router = Router();

var workMeta = Work.fetchMeta();

router.addRoute('/', function () {
    console.log('route: /');

    Info.setInActive();
    Statement.setInActive();
    Lightbox.setInActive();
    // Nav.mobileMenuInActive();
    
    routeClicks();
});

router.addRoute('/info', function () {
    console.log('route: /info');
    
    Info.setActive();
    
    Statement.setInActive();
    Lightbox.setInActive();
    // Nav.mobileMenuInActive();
    
    routeClicks();
});

router.addRoute('/statement', function () {
    console.log('route: /info');
    
    Statement.setActive();

    Info.setInActive();
    Lightbox.setInActive();
    // Nav.mobileMenuInActive();
    
    routeClicks();
});

router.addRoute('/work/department/:department', function (opts) {
    console.log('route: /work/department');

    var re = Work.rerenderForDepartmentFilter(opts.params.department);
    if (re) {Work.clear()
            .pipe(Work.list())
            .pipe(Work.render())
            .pipe(WorkInteraction());
    }

    window.scrollTo(0, window.innerHeight);

    scrollBodyF();

    Statement.setInActive();
    Info.setInActive();
    Nav.mobileMenuInActive();

    routeClicks();
});

router.addRoute('/work/:id', function (opts) {
    console.log('route: /work');
    console.log(opts.params.id);

    Work.projectForKey(opts.params.id);

    Statement.setInActive();
    Info.setInActive();
    Nav.mobileMenuInActive();

    routeClicks();
});

var toggleHandleStateStream = toggleHandleState();

Info.clicked().pipe(toggleHandleStateStream);
Statement.clicked().pipe(toggleHandleStateStream);

Lightbox.closeStream
    .pipe(through.obj(function (row, enc, next) {
        var href = '/';
        window.history.pushState({href: href}, '', href);

        var route = router.match(href);
        route.fn.apply(window, [route]);

        this.push(row);
        next();
    }))
    .pipe(scrollBody());

Work.projectForKeyStream
    .pipe(Lightbox.setActiveStream())
    .pipe(doNotScrollBody());


(function initialize (href) {

    var route = router.match(href);
    route.fn.apply(window, [route]);

    workMeta
        .pipe(Work.feedPages())
        .pipe(Work.fetchProjects())
        .pipe(Work.render())
        .pipe(WorkInteraction());

    workMeta
        .pipe(Work.feedDepartments())
        .pipe(Nav.render())
        .pipe(through.obj(function (row, enc, next){
            routeClicks();
        }));
    

    window.ga = window.ga ||
                function() {
                    (ga.q=ga.q||[])
                        .push(arguments);
                };

    ga.l = +new Date;
    ga('create', 'UA-2285370-24', 'auto');
    ga('set', 'forceSSL', true);
    ga('set', 'page', href);
    ga('send', 'pageview');

})(window.location.pathname);

Nav.mobileEnableButton()
    .pipe(Nav.mobileMenuActiveS())
    .pipe(doNotScrollBody());

Nav.mobileDisableButton()
    .pipe(Nav.mobileMenuInActiveS())
    .pipe(scrollBody());

var scrollerEmitters = scrollEmit();
scrollerEmitters
    .belowPoster
    .pipe(Nav.mobileToggleButtonShow())
    .pipe(Nav.addFixedClass())
    .pipe(through({ objectMode: true,
                     allowHalfOpen: true},
        function addWorkMargin (row, enc, next) {
            var height = 0;
            if (row.navSectionHeight) {
                height = row.navSectionHeight;
            }

            if (window.innerWidth > 768) {
                Work.container
                    .style
                    .marginTop = 'calc(100vh + ' + height + 'px)';
            }
            else {
                Work.container
                    .style
                    .marginTop = '100vh';
            }

            this.push(row);
            next();
        })
    );

scrollerEmitters
    .inPoster
    .pipe(Nav.mobileToggleButtonHide())
    .pipe(Nav.removeFixedClass())
    .pipe(through({ objectMode: true,
                     allowHalfOpen: true},
        function rmWorkMargin (row, enc, next) {
            if (window.innerWidth > 768) {
                Work.container
                    .style
                    .marginTop = '0';
            }
            else {
                Work.container
                    .style
                    .marginTop = '100vh';
            }
            this.push(row);
            next();
        })
    );


var base = window.location.host;

window.onpopstate = function (event) {
    var target = window.location;
    var href = target.href.split(base)[1];
    window.history.pushState({href: href}, '', href);

    var route = router.match(href);
    route.fn.apply(window, [route]);

    if (ga) {
        ga('set', 'page', href);
        ga('send', 'pageview');
    }

    return false;  
};

function toggleHandleState () {
    return through.obj(toggle);

    function toggle (row, enc, next) {
        var href = '/';
        if (row.active === false) {
            href += row.name;
        }
        var route = router.match(href);
        route.fn.apply(window, [route]);
        window.history.pushState({href: href}, '', href);

        next();
    }
}

function routeClicks () {

    var links = document.getElementsByTagName('a');

    for (var i = links.length - 1; i >= 0; i--) {
        if (links[i].classList.contains('external-link')) {
            // console.log('Not internally handled');
        } else {
            links[i].onclick = interllayHandleClick;
        }
    }

    function interllayHandleClick (event) {
        event.preventDefault();
        var target = findAnchor(event.target);
        var href = target.href.split(base)[1];
        window.history.pushState({href: href}, '', href);

        var route = router.match(href);
        route.fn.apply(window, [route]);

        if (ga) {
            ga('set', 'page', href);
            ga('send', 'pageview');
        }

        return false;
    }

    function findAnchor (el) {
	    if (el.nodeName === 'A') return el;
	    else return findAnchor(el.parentNode);
	}
}

function WorkInteraction () {
    return through({ objectMode: true,
                     allowHalfOpen: true},
                   interact);

    function interact (row, enc, next) {
        row.el.addEventListener('click', function (ev) {
            var href = '/work/' + row.data.id;
            window.history.pushState({href: href}, '', href);

            var route = router.match(href);
            route.fn.apply(window, [route]);
        });
        this.push(row);
        next();
    }
}

function scrollBody () {
    return through.obj(scroll);

    function scroll (row, enc, next) {
        document.body.classList.remove('no-scroll');
        this.push(row);
        next();
    }
}

function scrollBodyF () {
    document.body.classList.remove('no-scroll');
}

function doNotScrollBody () {
    return through.obj(noScroll);

    function noScroll (row, enc, next) {
        document.body.classList.add('no-scroll');
        this.push(row);
        next();
    }
}

function scrollEmit () {
    var belowPoster = through.obj();
    var inPoster = through.obj();
    var allScroll = through.obj();

    window.onscroll = debounce(onScroll());

    function onScroll () {
        var poster = document.querySelector('.poster-year');

        return function (ev) {
            var bounding = poster.getBoundingClientRect();
            if (bounding.bottom < 0) {
                belowPoster.push({});
            } else {
                inPoster.push({});
            }
            allScroll.push({});
        };
    }

    return {
        belowPoster: belowPoster,
        inPoster: inPoster,
        allScroll: allScroll
    };
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
