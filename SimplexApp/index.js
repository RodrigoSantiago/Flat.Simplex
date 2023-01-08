import {Navigator} from "./simplex/front/Navigator.js";
import {TreeView} from "./simplex/front/TreeView.js"
import {Studio} from "./simplex/front/studio/Studio.js";
import {Toolbar} from "./simplex/front/Toolbar.js";
import {TabView} from "./simplex/front/TabView.js";
import {SpriteEditor} from "./simplex/front/editors/sprite/SpriteEditor.js";

let globalDomInsert = null;
$(document).on('DOMNodeInserted', function() {
    if (globalDomInsert === null) {
        globalDomInsert = setTimeout(function () {
            $(".button, .hamburger, .menu-item, .tree-item, .tab-page").each(function (e) {
                addRipple($(this))
            });
            globalDomInsert = null;
        }, 200);
    }
});

let globalResize = null;
$(window).on('resize', function () {
    if (globalResize === null) {
        globalResize = setTimeout(function () {
            studio.onResize();
            globalResize = null;
        }, 200);
    }
});

function addRipple(e) {
    if (e.children('.ripple').length === 0) {
        e.attr('tabindex', 0);
        e.prepend($('<div class="ripple"></div>'));
        e.on('mousedown', clickRipple);
        if (e.css("z-index") === "auto") {
            e.css("z-index", 0);
        }
    }
}

function clickRipple(e) {
    if ($(e.target).hasClass("no-ripple") || $(e.target).parent().hasClass("no-ripple")) return;

    let ripple = $(this).children('.ripple');
    if (ripple[0].timeout) {
        clearTimeout(ripple[0].timeout);
        ripple.removeClass("expand");
    }
    ripple[0].timeout = setTimeout(() => {
        ripple.removeClass("expand");
        ripple[0].timeout = null;
    }, 500);
    let position = $(this).offset();
    ripple.css({'left': e.pageX - position.left, 'top': e.pageY - position.top});
    ripple.addClass("expand");
}


function hoverTooltip(e) {

}

let main = $(".main");
let toolbar = $("#main-toolbar");
let navigator = $("#main-navigator");
let treeview = $("#main-treeview");
let tabview = $("#main-tabview");
let tabcontent = $("#main-tab-content");
const studio = new Studio(
    main,
    new Navigator(main, toolbar, navigator),
    new Toolbar(toolbar),
    new TreeView(treeview),
    null,
    new TabView(tabview, tabcontent)
);

SpriteEditor.loadModel();