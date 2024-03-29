import {DismissClickResize} from "../../Utils.js";
import {DragSystem} from "../../DragSystem.js";

export class Navigator {

    down = false;
    drag = false;
    start = {x: 0, y: 0};
    open = false;

    constructor(jqMain, jqToolbar, jqNavigator) {
        this.toolbar = jqToolbar;
        this.nav = jqNavigator;
        this.drawer = jqNavigator.find('.drawer');
        this.hamburger = $('<div class="hamburger button icon on-color"><i class="material-icons">menu</i></div>');

        this.toolbar.prepend(this.hamburger);
        this.hamburger.on("click", (e) => this.toggle(200));

        this.toClose();

        $(window).on("mousedown", (e) => this.mouseDown(e));
        $(window).on("mousemove", (e) => this.mouseMove(e));
        $(window).on("mouseup", (e) => this.mouseUp(e));
    }

    addItem(name, icon, event) {
        if (name === '_') {
            this.drawer.append($('<div class="separator"></div>'));
        } else {
            let item = $('<div class="button text primary"><i class="material-icons">' + icon + '</i><span>' + name + '</span></div>');
            item.on("click", (e) => event?.(e));
            this.drawer.append(item);
        }
    }

    toggle(anim) {
        if (!this.drag) {
            if (this.open) {
                this.toClose(anim);
            } else {
                this.toOpen(anim);
            }
        }
    }

    toOpen(anim) {
        this.open = true;
        this.nav.removeClass("close");
        this.nav.addClass("open");
        this.nav.finish();
        if (anim) {
            this.nav.animate({
                left : 0
            }, {
                duration : anim,
                step : () => {
                    this.updateNavigatorBackout();
                }
            })
        } else {
            this.nav.css({
                left : 0,
                backgroundColor : 'rgba(0, 0, 0, 0.5)'
            });
        }
        DismissClickResize(this.drawer, (s) => this.toClose(200));
    }

    toClose(anim) {
        this.open = false;
        this.nav.finish();
        if (anim) {
            this.nav.animate({
                left : -this.drawer.width(),
                backgroundColor : "rgba(0, 0, 0, 0)"
            }, {
                duration : anim,
                step : () => {
                    this.updateNavigatorBackout();
                },
                complete : () => {
                    this.nav.removeClass("open");
                    this.nav.addClass("close");
                }
            })
        } else {
            this.nav.removeClass("open");
            this.nav.addClass("close");
            this.nav.css({
                left : -this.drawer.width(),
                backgroundColor : 'transparent'
            });
        }
    }

    updateNavigatorBackout() {
        let val = "rgba(0, 0, 0, " + ((1 - -this.nav.offset().left / this.drawer.width()) * 0.5) + ")";
        this.nav.css('background-color', val)
    }

    mouseDown(e) {
        if (!this.down &&
            ((this.open && e.pageX > 0 && e.pageX < this.drawer.width()) || (!this.open && e.pageX > 0 && e.pageX < 16))) {
            this.down = true;
            this.start.x = e.pageX;
            this.start.y = e.pageY;
            this.dragButton = e.button;
        }
    }

    mouseMove(e) {
        if (this.down && !this.drag) {
            if ((this.open && Math.abs(e.pageX - this.start.x) > 16) ||
                (!this.open && e.pageX > this.start.x + 16)) {
                if (DragSystem.drag(this, this.dragButton)) {
                    this.drag = true;
                    this.nav.addClass("open");
                    this.nav.removeClass("close");
                } else {
                    this.down = false;
                }
            }
        }
    }

    mouseUp(e) {
        this.down = false;
        this.start = {x: 0, y: 0};
    }

    onDragMove(e) {
        this.nav.offset({left: Math.min(this.open ? (e.pageX - this.start.x) : (e.pageX - this.drawer.width()), 0)});
        this.updateNavigatorBackout();
    }

    onDragDrop(e) {
        if (e.pageX > this.drawer.width() / 2) {
            this.toOpen(200);
        } else {
            this.toClose(200);
        }
        this.drag = false;
    }

    onDragCancel(e) {
        if (this.open) {
            this.toOpen(200);
        } else {
            this.toClose(200);
        }
        this.drag = false;
        this.mouseUp(e);
    }
}