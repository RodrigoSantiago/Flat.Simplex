import {Navigator} from "./simplex/front/components/Navigator/Navigator.js";
import {TreeView} from "./simplex/front/components/TreeView/TreeView.js"
import {Studio} from "./simplex/front/studio/Studio.js";
import {Toolbar} from "./simplex/front/Toolbar.js";
import {TabView} from "./simplex/front/components/TabView/TabView.js";
import {SpriteEditor} from "./simplex/front/editors/sprite/SpriteEditor.js";
import {Dialogs} from "./simplex/front/Dialogs.js";
import {FontManager} from "./simplex/front/font/FontManager.js";
import {DropdownButton} from "./simplex/front/Dropdown.js";

window.log = function (...points) {
    let str = "";
    for (let p of points) {
        str += (Math.round(p.x * 100)/100) + ", " + (Math.round(p.y * 100)/100) + "\n";
    }
    console.log(str);
};

let globalDomInsert = null;
$(document).on('DOMNodeInserted', function() {
    if (globalDomInsert === null) {
        globalDomInsert = setTimeout(function () {
            $(".button, .hamburger, .menu-item, .tree-item, .tab-page, .list-item").each(function (e) {
                addRipple($(this))
            });
            $(".drop-down-button").each(function (e) {
                if (!$(this).data("expansion")) {
                    new DropdownButton($(this));
                }
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
Dialogs.loadModels();
FontManager.loadDefaultFonts();