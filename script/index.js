var Poster = require('./poster.js')('.poster');
var Info = require('./information.js')('.info');

var Router = require('routes');
var router = Router();

router.addRoute('/', function () {
    console.log('route: /');

    Info.inActive();
    routeClicks();
});

router.addRoute('/info', function () {
    console.log('route: /info');
    
    Info.active();
    routeClicks();
});


(function initialize (href) {

    routeClicks();

    var route = router.match(href);
    route.fn.apply(window, [route]);

    window.ga = window.ga ||
                function() {
                    (ga.q=ga.q||[])
                        .push(arguments);
                };

    ga.l = +new Date;
    ga('create', 'UA-59960857-1', 'auto');
    ga('set', 'forceSSL', true);
    ga('set', 'page', href);
    ga('send', 'pageview');

})(window.location.pathname);


function routeClicks () {
    var base = window.location.host;

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
        window.history.pushState('', '', href);

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