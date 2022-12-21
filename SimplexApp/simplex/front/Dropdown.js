import {Dialogs} from "./Dialogs.js";
import {DismissClickResize} from "./Utils.js";

export class DropdownItem {
    constructor(icon, name, onclick, enabled = true) {
        this.icon = icon;
        this.name = name;
        this.onclick = onclick;
        this.enabled = enabled;
    }
}

export class Dropdown {

    jqRoot = null;
    shown = true;

    constructor(position, items) {
        const self = this;

        this.jqRoot = $("<div class='dropdown'></div>");
        $(".main").append(this.jqRoot);

        // Configure Items
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let jqItem;
            if (item.name === '_') {
                jqItem = $("<div class='menu-item separator'></div>");
            } else {
                if (item.icon) {
                    jqItem = $("<div class='menu-item'><i class='material-icons'>" + item.icon + "</i>" + item.name + "</div>");
                } else {
                    jqItem = $("<div class='menu-item'>" + item.name + "</div>");
                }
                if (!item.enabled) {
                    jqItem.addClass("disabled");
                }
            }

            jqItem.click(function (e) {
                if (self.shown) {
                    item.onclick?.(e);
                    self.hidden();
                }
            })
            this.jqRoot.append(jqItem);
        }
        this.jqRoot.css("z-index", Dialogs.zindex++);
        this.jqRoot.width();

        // Configure Position
        let minX = position.x, minY = position.y;
        let sw = $(window).width() - 8;
        let sh = $(window).height() - 8;
        let w = this.jqRoot.width();
        let h = this.jqRoot.height();
        let side = 0;
        if (w + minX > sw) {
            minX = minX - w;
            side += 1;
        }
        if (h + minY > sh) {
            minY = minY - h;
            side += 2;
        }
        minX = Math.max(8, Math.min(minX, sw - w));
        minY = Math.max(8, Math.min(minY, sh - h));
        this.jqRoot.addClass(side === 0 ? "show left" : side === 1 ? "show top" : side === 2 ? "show right" : "show bottom");
        this.jqRoot.offset({left : minX, top : minY});

        // Configure Dismiss
        this.clearDismiss = DismissClickResize(this.jqRoot, function (e) {
            self.hidden();
        })
    }

    hidden() {
        const self = this;

        if (this.shown) {
            this.shown = false;
            this.clearDismiss();

            this.jqRoot.fadeOut("fast", function (e) {
                self.jqRoot.remove();
            })
        }
    }
}