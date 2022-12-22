import {Dropdown, DropdownItem} from "./Dropdown.js";

class ToolbarIcon {
    name;
    icon;
    event;
    constructor(name, icon, event) {
        this.name = name;
        this.icon = icon;
        this.event = event;
    }
}

export class Toolbar {

    toolbarItems = [];
    toolbar = null;
    menu = null;
    more = null;
    prevCount = 0;

    constructor(jqMain, jqToolbar) {
        this.toolbar = jqToolbar;
        this.menu = jqToolbar.find(".menu");
        this.more = $('<div class="more button icon on-primary"><i class="material-icons">more_vert</i></div>');
        const self = this;
        this.more.click(function (e) {
            self.onMoreClick(e);
        })
        this.menu.append(this.more);
    }

    update() {
        let count = (((this.menu.width() - 16) / 48) | 0) - 1;
        if (this.prevCount !== count) {
            this.prevCount = count;

            this.menu.find(".menu-item").remove();
            for (let i = 0; i < this.toolbarItems.length && i < count; i++) {
                let tbItem = this.toolbarItems[i];
                if (tbItem.icon != null) {
                    let btn = $('<div class="menu-item action on-primary"><i class="material-icons">'+ tbItem.icon + '</i><span>' + tbItem.name + '</span></div>');
                    btn.click(tbItem.event);
                    this.menu.append(btn);
                } else {
                    break;
                }
            }
            this.menu.append(this.more);
        }
    }

    onMoreClick(event) {
        let dropdownItems = [];
        let count = (((this.menu.width() - 16) / 48) | 0) - 1;
        let hasHiddenItem = false;
        for (let i = 0; i < this.toolbarItems.length; i++) {
            let tbItem = this.toolbarItems[i];
            if (tbItem.icon !== null && i >= count) {
                hasHiddenItem = true;
                dropdownItems.push(new DropdownItem("", tbItem.name, tbItem.event));

            } else if (tbItem.icon === null || i >= count) {
                if (hasHiddenItem) {
                    hasHiddenItem = false;
                    dropdownItems.push(new DropdownItem("", "_", null));
                }
                dropdownItems.push(new DropdownItem("", tbItem.name, tbItem.event));
            }
        }

        new Dropdown({
            x : this.more.offset().left + this.more.width() / 2,
            y : this.more.offset().top + this.more.height() / 2,
        }, dropdownItems);
    }

    getItems() {
        return this.toolbarItems.clone();
    }

    addItem(name, icon, event) {
        this.toolbarItems.push(new ToolbarIcon(name, icon, event));
        this.prevCount = 0;
    }

    insertItem(index, name, icon, event) {
        this.toolbarItems.splice(index, 0, new ToolbarIcon(name, icon, event));
        this.prevCount = 0;
    }

    removeItem(index) {
        this.toolbarItems.splice(index, 1);
        this.prevCount = 0;
    }
}