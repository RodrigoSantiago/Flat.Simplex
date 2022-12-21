import {DragSystem} from "./DragSystem.js";

export class TreeItem {

    constructor(content, isFolder) {
        this.content = content;

        this.treeView = null;
        this.parent = null;
        this.children = [];

        this.folder = !!isFolder;
        this.open = false;
        this.selected = false;
        this.dragged = false;
        this.tempIndex = 0;
    }

    getParent() {
        return this.parent;
    }

    addChild(item, index) {
        if (item.parent !== null) {
            item.parent.removeChild(item);
        }
        if (index !== undefined) {
            this.children.splice(index, 0, item);
        } else {
            this.children.push(item);
        }
        item.parent = this;
        item.treeView = this.treeView;
    }

    removeChild(item) {
        let index = this.children.indexOf(item);
        if (index >= 0) {
            this.children.splice(index, 1);
            if (item.parent === this) {
                item.treeView.selectionRemove(item);

                item.parent = null;
            }
        }
    }

    isChildOf(parentItem) {
        if (this === parentItem || this.parent === parentItem) {
            return true;
        } else if (this.parent !== null) {
            return this.parent.isChildOf(parentItem);
        } else {
            return false;
        }
    }

    getIdent() {
        if (this.parent === null) {
            return 0;
        } else {
            return this.parent.getIdent() + 1;
        }
    }

    getIndex() {
        return this.parent == null ? 0 : this.parent.children.indexOf(this);
    }

    getTreeView() {
        return this.treeView;
    }

    setSelected(value) {
        this.selected = value;
    }

    isSelected() {
        return this.selected;
    }

    isSelectedFolder() {
        return this.selected || (this.parent !== null && this.parent.isSelected());
    }

    isFolder() {
        return this.folder;
    }

    isOpen() {
        return this.open;
    }

    setOpen(value) {
        this.open = value;
    }

    isDragged() {
        return this.dragged;
    }

    setDragged(value) {
        this.dragged = value;
    }
}

export class TreeView {
    root;
    jQRootElement;
    jQContentElement;
    jQItemElement;
    jQItemDragElement;
    jQLineDropElement;
    convertFunction;

    jQItems = [];
    offsetY = 0;
    visibleOffsetY = 0;
    itemHeight = 0;
    computedMaxHeight = 0;
    selection = [];
    onTreeItemClick = null;
    onSingleItemSelected = null;

    constructor(jQRootElement, onTreeItemClick, onSingleItemSelected, onRequestContextMenu) {
        this.root = new TreeItem(null);
        this.root.treeView = this;
        this.root.open = true;

        this.jQRootElement = jQRootElement;
        this.jQItemElement = $("<div class='tree-item'><div class='ident'></div><i class='right material-icons'>expand_more</i><i class='left material-icons'>folder</i><span class='text'></span></div>");
        this.jQContentElement = $("<div class='tree-content'></div>");
        this.jQRootElement.append(this.jQContentElement);

        this.jQItemDragElement = this.jQItemElement.clone();
        this.jQItemDragElement.addClass("drag");
        this.jQRootElement.append(this.jQItemDragElement);

        this.jQLineDropElement = $("<div class='tree-drop-line'></div>");
        this.jQRootElement.append(this.jQLineDropElement);

        this.onTreeItemClick = onTreeItemClick;
        this.onSingleItemSelected = onSingleItemSelected;
        this.onRequestContextMenu = onRequestContextMenu;
        this.addVisibleItem();
        this.itemHeight = this.jQItems[0].outerHeight();
        this.dragData = {
            item : null,
            drop : null,
            where : null,
            scrollTimerUp : null,
            scrollTimerDown : null,
            pressed : false,
            dragged : false,
            start : {x : 0, y : 0},
            relative : {x : 0, y : 0}
        }

        let self = this;
        $(window).mousemove(function (e) {
            self.mouseMove(e);
        });
        $(window).mouseup(function (e) {
            self.mouseUp(e);
        });

        jQRootElement.bind('mousewheel', function(e){
            self.scrollBy(e.originalEvent.wheelDelta * 0.25);
        });

        this.convertFunction = function (jQElement, treeItem, ident) {
            if (jQElement.span === undefined) {
                jQElement.span = jQElement.find('span');
                jQElement.icon = jQElement.find('.left');
                jQElement.fold = jQElement.find('.right');
                jQElement.line = jQElement.find('.ident');
            }
            let span = jQElement.span;
            let icon = jQElement.icon;
            let fold = jQElement.fold;
            let line = jQElement.line;
            if (!treeItem) {
                span.text("");
                icon.text("");
                line.empty();
                fold.removeClass("folder");
                jQElement.addClass("empty");
                jQElement.removeClass("selected");
                jQElement.removeClass("negative");

                return;
            }

            if (treeItem.isDragged()) {
                jQElement.addClass("negative");
            } else {
                jQElement.removeClass("negative");
            }

            if (treeItem.isSelected()) {
                if (treeItem.selectedJq !== undefined || jQElement.hasClass("selected")) {
                    jQElement.addClass("no-animation");
                }
                jQElement.addClass("selected");
                jQElement.width();
                jQElement.removeClass("no-animation");
                treeItem.selectedJq = jQElement;

            } else if (!treeItem.isSelected() && jQElement.hasClass("selected")) {
                if (treeItem.selectedJq !== jQElement) {
                    jQElement.addClass("no-animation");
                }
                jQElement.removeClass("selected");
                jQElement.width();
                jQElement.removeClass("no-animation");
                treeItem.selectedJq = undefined;
            }

            span.text(treeItem.content.text);
            icon.text(treeItem.content.icon);
            icon.css("background-color", treeItem.content.color);

            let prevHtml = line.html();
            let html = "";
            let it = treeItem;
            let meLast = !(it.isFolder() && it.isOpen() && it.children.length > 0) &&
                it.parent !== null &&
                it.parent.parent !== null &&
                it.parent.children.indexOf(it) === it.parent.children.length - 1;

            while (it !== null && it.parent !== null && it.parent.parent !== null && ident > 0 && !treeItem.isDragged()) {
                if (it === treeItem && meLast) {
                    html = "<div class='line end'></div>" + html;
                } else if (meLast && it.isFolder() && it.isOpen() && it.children.length > 0 && it.parent.children.indexOf(it) === it.parent.children.length - 1) {
                    html = "<div class='line end'></div>" + html;
                } else {
                    meLast = false;
                    html = "<div class='line'></div>" + html;
                }
                it = it.parent;
            }
            if (html !== prevHtml) {
                line.empty();
                line.append($(html));
            }

            jQElement.removeClass("empty");
            if (treeItem.isFolder()) {
                fold.text(treeItem.isOpen() ? "expand_more" : "chevron_right");
                fold.addClass("folder");
            } else {
                fold.removeClass("folder");
            }
        };
    }

    mouseMove(e) {
        if (!this.dragData.dragged && this.dragData.pressed) {
            let xd = this.dragData.relative.x - e.pageX;
            let yd = this.dragData.relative.y - e.pageY;
            if (xd * xd + yd * yd > this.itemHeight/2 * this.itemHeight/2) {
                if (DragSystem.drag(this)) {
                    this.dragData.dragged = true;
                    this.jQItemDragElement.addClass("dragged");
                    this.jQLineDropElement.addClass("dragged");
                    this.convertFunction(this.jQItemDragElement, this.dragData.item, 0);
                    this.dragData.item.setDragged(true);
                    this.selectionAdd(this.dragData.item, false);
                    this.update();
                } else {
                    this.dragData.pressed = false;
                }
            }
        }

        if (!this.dragData.dragged) {
            return;
        }

        this.jQItemDragElement.offset({top: e.pageY - this.itemHeight / 2});
        let rTop = this.jQRootElement.offset().top;
        let visOff = (this.itemHeight - this.visibleOffsetY) % this.itemHeight;
        let offY = e.pageY - rTop + visOff;
        this.dragData.drop = null;
        this.dragData.where = null;
        let halfLine = this.jQLineDropElement.height() / 2;
        for (let i = 0; i < this.jQItems.length; i++) {
            let pos = (offY >= this.itemHeight * i && offY < this.itemHeight * (i + 1));
            let end = (i + 1 < this.jQItems.length && this.jQItems[i + 1].treeItem === null);
            if (pos || end) {

                let treeItem = this.jQItems[i].treeItem;
                this.dragData.drop = treeItem;
                let totalOffset = 0;
                let top = this.itemHeight * i + rTop - visOff;
                let mid = this.itemHeight * i + this.itemHeight * 0.5 + rTop - visOff;
                let bot = this.itemHeight * (i + 1) + rTop - visOff;

                if (treeItem.isFolder() && (!treeItem.isOpen() || treeItem.children.length === 0)) {
                    if (offY < (this.itemHeight * i) + this.itemHeight / 3) {
                        totalOffset = top;
                        this.dragData.where = 'top';
                    } else if (offY < (this.itemHeight * i) + this.itemHeight / 3 * 2) {
                        totalOffset = mid;
                        this.dragData.where = 'mid';
                    } else {
                        totalOffset = bot;
                        this.dragData.where = 'bot';
                    }
                } else {
                    if (offY < (this.itemHeight * i) + this.itemHeight / 2) {
                        totalOffset = top;
                        this.dragData.where = 'top';
                    } else {
                        totalOffset = treeItem.isFolder() ? mid : bot;
                        this.dragData.where = treeItem.isFolder() ? 'mid' : 'bot';
                    }
                }
                if (!pos && end) {
                    this.dragData.where = 'mid';
                    this.dragData.drop = this.root;
                }
                this.jQLineDropElement.offset({top: totalOffset - halfLine});
                this.jQLineDropElement.css({"--drop-ident": treeItem.getIdent() - 1});
                break;
            }
        }

        const self = this;
        if (e.pageY - rTop < 16) {
            if (this.dragData.scrollTimerUp === null) {
                this.dragData.scrollTimerUp = setInterval(function (e) {
                    self.scrollBy(24);
                }, 200);
            }
        } else if (e.pageY - rTop > this.visibleHeight() - 16) {
            if (this.dragData.scrollTimerDown === null) {
                this.dragData.scrollTimerDown = setInterval(function (e) {
                    self.scrollBy(-24);
                }, 200)
            }
        }
        if (!(e.pageY - rTop < 16) && !(e.pageY - rTop > this.visibleHeight() - 16)) {
            if (this.dragData.scrollTimerUp !== null) {
                clearInterval(this.dragData.scrollTimerUp);
            }
            if (this.dragData.scrollTimerDown !== null) {
                clearInterval(this.dragData.scrollTimerDown);
            }
            this.dragData.scrollTimerUp = null;
            this.dragData.scrollTimerDown = null;
        }
    }

    mouseUp(e) {
        if (this.dragData.dragged) {
            DragSystem.drop(this);
        }

        if (this.dragData.dragged && this.dragData.item !== null) {
            this.dragData.item.setDragged(false);
            if (this.dragData.drop !== null && !this.dragData.drop.isChildOf(this.dragData.item)) {
                this.dragData.item.parent.removeChild(this.dragData.item);
                let index = this.dragData.drop.getIndex();

                if (this.dragData.where === 'top') {
                    this.dragData.drop.parent.addChild(this.dragData.item, index);
                } else if (this.dragData.where === 'bot') {
                    this.dragData.drop.parent.addChild(this.dragData.item, index + 1);
                } else if (this.dragData.where === 'mid') {
                    this.dragData.drop.addChild(this.dragData.item);
                }

                this.selectionAdd(this.dragData.item, false);
            }
            this.update();
        }

        this.dragData.item = null;
        this.dragData.pressed = false;
        this.dragData.dragged = false;
        this.dragData.drop = null;
        this.dragData.where = null;
        this.jQItemDragElement.removeClass("dragged");
        this.jQLineDropElement.removeClass("dragged");
        if (this.dragData.scrollTimerUp !== null) {
            clearInterval(this.dragData.scrollTimerUp);
        }
        if (this.dragData.scrollTimerDown !== null) {
            clearInterval(this.dragData.scrollTimerDown);
        }
        this.dragData.scrollTimerUp = null;
        this.dragData.scrollTimerDown = null;
    }

    scrollBy(scroll) {
        let prevOffset = this.offsetY;
        this.offsetY += scroll;
        this.limiteOffset();
        if (prevOffset !== this.offsetY) {
            this.update();
        }
    }

    visibleHeight() {
        return this.jQRootElement.height() - 16;
    }

    limiteOffset() {
        if (this.offsetY > 0) {
            this.offsetY = 0;
        } else if (-this.offsetY + this.visibleHeight() > this.computedMaxHeight) {
            this.offsetY = -Math.max(0, this.computedMaxHeight - this.visibleHeight());
        }
        this.visibleOffsetY = this.offsetY % this.itemHeight;
        this.jQContentElement.css({top : this.visibleOffsetY});
    }

    update() {
        this.itemHeight = this.jQItems[0].outerHeight();
        this.computedMaxHeight = this.computeMaxHeight(this.root) * this.itemHeight;
        this.limiteOffset();

        let height = this.visibleHeight() + this.itemHeight * 2;
        let currentHeight = this.jQItems.length * this.itemHeight;
        while (currentHeight < height && this.jQItems.length < 100) {
            this.addVisibleItem();
            currentHeight += this.itemHeight;
        }

        let index = {i : -Math.floor((-this.offsetY) / this.itemHeight)};
        for (const child of this.root.children) {
            if (!this.updateItem(child, index, 0)) {
                break;
            }
        }
        while (index.i < this.jQItems.length) {
            let jqItem = this.jQItems[index.i];
            jqItem.treeItem = null;
            this.convertFunction(jqItem, null, 0);
            index.i ++;
        }
    }

    updateItem(item, index, ident) {
        if (index.i < this.jQItems.length) {
            if (index.i >= 0) {
                let jqItem = this.jQItems[index.i];
                jqItem.treeItem = item;
                this.convertFunction(jqItem, item, ident);
            }
            index.i ++;

            if (item.open) {
                for (const child of item.children) {
                    if (!this.updateItem(child, index, ident + 1)) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

    addVisibleItem() {
        const self = this;
        const jqItem = this.jQItemElement.clone();
        jqItem.treeItem = null;
        jqItem.span = jqItem.find('span');
        jqItem.icon = jqItem.find('.left');
        jqItem.fold = jqItem.find('.right');
        jqItem.line = jqItem.find('.ident');

        jqItem.click(function (e) {
            if (jqItem.treeItem === null) {
                if (!e.ctrlKey && !e.shiftKey) {
                    self.selectionClear();
                }
            } else {
                if (e.shiftKey && self.selection.length >= 0) {
                    self.selectionAddBetween(self.selection[self.selection.length - 1], jqItem.treeItem);
                } else if (jqItem.treeItem.isSelected() && e.ctrlKey) {
                    self.selectionRemove(jqItem.treeItem);
                } else {
                    self.selectionAdd(jqItem.treeItem, e.ctrlKey);
                }
            }
        }).dblclick(function (e) {
            if (jqItem.treeItem !== null) {
                if (jqItem.treeItem.folder && !$(e.target).is(".right")) {
                    jqItem.treeItem.setOpen(!jqItem.treeItem.isOpen());
                    self.update();
                } else  {
                    jqItem.treeItem.treeView.onTreeItemClick?.(jqItem.treeItem);
                }
            }
        }).mousedown(function (e) {
            if (jqItem.treeItem !== null) {
                self.dragData.item = jqItem.treeItem;
                self.dragData.pressed = true;
                self.dragData.start = {x: e.pageX - jqItem.offset().left, y: e.pageY - jqItem.offset().top};
                self.dragData.relative = {x: e.pageX, y: e.pageY};
            }
        }).contextmenu(function (e) {
            if (jqItem.treeItem && (self.selection.length === 0 || self.selection.indexOf(jqItem.treeItem) === -1)) {
                self.selectionAdd(jqItem.treeItem, e.ctrlKey);
            }
            self.onRequestContextMenu(e, jqItem.treeItem);
        });
        jqItem.find(".right").click(function (e) {
            if (jqItem.treeItem !== null) {
                if (jqItem.treeItem.folder) {
                    jqItem.treeItem.setOpen(!jqItem.treeItem.isOpen());
                    self.update();
                }
            }
        });

        this.jQItems.push(jqItem);
        this.jQContentElement.append(jqItem);
    }

    computeMaxHeight(item) {
        let sum = item === this.root ? 0 : 1;
        if (item.open) {
            for (const child of item.children) {
                sum += this.computeMaxHeight(child);
            }
        }
        return sum;
    }

    selectionAdd(item, additive) {
        if (additive) {
            if (this.selection.indexOf(item) === -1) {
                this.selection.push(item);
                item.selected = true;
            }
        } else {
            if (this.selection.length === 1 && this.selection[0] === item) {
                return;
            }

            for (let item of this.selection) {
                item.selected = false;
            }
            this.selection = [item];
            item.selected = true;

            this.onSingleItemSelected?.(item);
        }
        this.update();
    }

    selectionSet(items) {
        for (let item of this.selection) {
            item.selected = false;
        }
        this.selection = items.slice();
        for (let item of this.selection) {
            item.selected = true;
        }
        this.update();
    }

    selectionRemove(item) {
        let index = this.selection.indexOf(item);
        if (index >= 0) {
            this.selection.splice(index, 1);
            item.selected = false;
        }
        this.update();
    }

    selectionClear() {
        for (let item of this.selection) {
            item.selected = false;
        }
        this.selection = [];
        this.update();
    }

    selectionAddBetween(itemA, itemB) {
        let index = {i : 1};
        for (const child of this.root.children) {
            this.computeListIndex(child, index);
        }
        for (const child of this.root.children) {
            this.selectIfBetween(child, Math.min(itemA.tempIndex, itemB.tempIndex), Math.max(itemA.tempIndex, itemB.tempIndex))
        }
        this.update();
    }

    computeListIndex(item, index) {
        item.tempIndex = index.i++;
        for (const child of item.children) {
            this.computeListIndex(child, index);
        }
    }

    selectIfBetween(item, indexMin, indexMax) {
        if (item.tempIndex >= indexMin && item.tempIndex <= indexMax) {
            if (this.selection.indexOf(item) === -1) {
                this.selection.push(item);
                item.selected = true;
            }
        }
        for (const child of item.children) {
            this.selectIfBetween(child, indexMin, indexMax);
        }
    }
}