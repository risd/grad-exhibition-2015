var through = require('through2');

var Poster = require('./poster.js')('.poster');
var Info = require('./information.js')('.info');
var Statement = require('./statement.js')('.statement');
var Work = require('./work')('.work');

var Router = require('routes');
var router = Router();

router.addRoute('/', function () {
    console.log('route: /');

    Info.setInActive();
    
    Statement.setInActive();
    
    routeClicks();
});

router.addRoute('/info', function () {
    console.log('route: /info');
    
    Info.setActive();
    
    Statement.setInActive();
    
    routeClicks();
});

router.addRoute('/statement', function () {
    console.log('route: /info');
    
    Statement.setActive();

    Info.setInActive();
    
    routeClicks();
});

(function initialize (href) {

    Work.list();
    routeClicks();

    var route = router.match(href);
    route.fn.apply(window, [route]);

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

var toggleHandleStateStream = toggleHandleState();

Info.clicked().pipe(toggleHandleStateStream);
Statement.clicked().pipe(toggleHandleStateStream);


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