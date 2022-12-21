import {Navigator} from "./simplex/front/Navigator.js";
import {TreeView} from "./simplex/front/TreeView.js"
import {Studio} from "./simplex/front/studio/Studio.js";
import {Toolbar} from "./simplex/front/Toolbar.js";

$(document).on('DOMNodeInserted', function(e) {
    onElementAdded($(e.target));
});

$(window).on('resize', function () {
    studio.onResize();
});

function clickRipple(e) {
    let ripple = $(this).children('.ripple');
    ripple.removeClass("expand");
    let position = $(this).offset();
    ripple.css({'left': e.pageX - position.left, 'top': e.pageY - position.top});
    ripple.addClass("expand");
    setTimeout(function () {ripple.removeClass("expand")}, 250);
}

function onElementAdded(e) {
    if (e.is(".button, .hamburger, .menu-item, .tree-item")) {
        e.attr("tabindex", 0);
        if (e.children('.ripple').length === 0) {
            e.prepend($('<div class="ripple"></div>'));
            e.mousedown(clickRipple);
        }
    }
}

$(".button, .toolbar > .hamburger, .menu > .menu-item, .menu, .main").each(() => onElementAdded($(this)));

let main = $(".main");
let toolbar = $(".main .toolbar");
let navigator = $(".main .navigator");
let treeview = $(".main .tree-view");
const studio = new Studio(
    main,
    new Navigator(main, toolbar, navigator),
    new Toolbar(main, toolbar),
    new TreeView(treeview),
    null,
    null
);