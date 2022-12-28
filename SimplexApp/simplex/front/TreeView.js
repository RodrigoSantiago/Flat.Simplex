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
    jQScroll;
    convertFunction;

    jQItems = [];
    offsetY = 0;
    visibleOffsetY = 0;
    itemHeight = 0;
    itemWidth = 0;
    computedMaxHeight = 0;
    selection = [];
    onTreeItemClick = null;
    onSingleItemSelected = null;

    prevIndex = -1;

    constructor(jQRootElement, onTreeItemClick, onSingleItemSelected, onRequestContextMenu) {
        this.root = new TreeItem(null);
        this.root.treeView = this;
        this.root.open = true;

        this.jQRootElement = jQRootElement;
        this.jQItemElement = $("<div class='tree-item'><div class='ident'></div><i class='fold material-icons'>expand_more</i><i class='left material-icons'>folder</i><span class='text'></span></div>");
        this.jQContentElement = $("<div class='tree-content'></div>");

        this.jQScrollArea = $("<div class='tree-scroll-area'></div>");
        this.jQScroll = $("<div class='tree-scroll'><div class='tree-scroll-bar'></div></div>");
        this.jQScrollBar = this.jQScroll.find(".tree-scroll-bar");
        this.jQScrollArea.append(this.jQContentElement);
        this.jQRootElement.append(this.jQScrollArea);
        this.jQRootElement.append(this.jQScroll);

        this.jQItemDragElement = $("<div class='tree-drag-item'></div>");
        this.jQItemDragElement.append(this.jQItemElement.clone());
        this.jQRootElement.append(this.jQItemDragElement);

        this.jQLineDropElement = $("<div class='tree-drop-line'></div>");
        this.jQRootElement.append(this.jQLineDropElement);

        this.onTreeItemClick = onTreeItemClick;
        this.onSingleItemSelected = onSingleItemSelected;
        this.onRequestContextMenu = onRequestContextMenu;
        this.addVisibleItem();
        this.itemHeight = this.jQItems[0].outerHeight();
        this.itemWidth = this.jQItems[0].outerWidth();

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

        jQRootElement[0].addEventListener('wheel', function(e){
            self.scrollBy(Math.sign(e.deltaY) * -30);
        });

        this.convertFunction = function (jQElement, treeItem, ident) {
            if (jQElement.span === undefined) {
                jQElement.span = jQElement.find('span');
                jQElement.icon = jQElement.find('.left');
                jQElement.fold = jQElement.find('.fold');
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
                jQElement.addClass("selected");
            } else {
                jQElement.removeClass("selected");
            }

            span.text(treeItem.content.text);
            icon.text(treeItem.content.icon);
            icon.css("background-color", treeItem.content.color);

            let prevHtml = line.html();
            let html = "";
            let ti = treeItem;
            let meLast = !(ti.isFolder() && ti.isOpen() && ti.children.length > 0) &&
                ti.parent !== null &&
                ti.parent.parent !== null &&
                ti.parent.children.indexOf(ti) === ti.parent.children.length - 1;

            while (ti !== null && ti.parent !== null && ti.parent.parent !== null && ident > 0 && !treeItem.isDragged()) {
                if (ti === treeItem && meLast) {
                    html = "<div class='line end'></div>" + html;
                } else if (meLast && ti.isFolder() && ti.isOpen() && ti.children.length > 0 && ti.parent.children.indexOf(ti) === ti.parent.children.length - 1) {
                    html = "<div class='line end'></div>" + html;
                } else {
                    meLast = false;
                    html = "<div class='line'></div>" + html;
                }
                ti = ti.parent;
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

        this.configureScrollbar();
    }

    mouseDown(e, jqItem, item) {
        this.dragData.item = item;
        this.dragData.pressed = true;
        this.dragData.start = {x: e.pageX - jqItem.offset().left, y: e.pageY - jqItem.offset().top};
        this.dragData.relative = {x: e.pageX, y: e.pageY};
    }

    mouseMove(e) {
        if (this.dragData.pressed) {
            let xd = this.dragData.relative.x - e.pageX;
            let yd = this.dragData.relative.y - e.pageY;
            if (xd * xd + yd * yd > this.itemHeight / 2 * this.itemHeight / 2) {
                if (DragSystem.drag(this)) {
                    this.onDragStart(e);
                }

                this.dragData.pressed = false;
            }
        }
    }

    mouseUp(e) {
        this.dragData.item = null;
        this.dragData.pressed = false;
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

    onDragStart(e) {
        this.jQItemDragElement.addClass("dragged");
        this.jQLineDropElement.addClass("dragged");
        this.convertFunction(this.jQItemDragElement.find(".tree-item"), this.dragData.item, 0);
        this.dragData.item.setDragged(true);
        this.selectionAdd(this.dragData.item, false);
        this.update();
    }

    onDragMove(e) {
        this.jQItemDragElement.offset({top: e.pageY - this.itemHeight / 2, left : e.pageX - this.itemWidth / 2});

        let rTop = this.jQRootElement.offset().top;
        let visOff = (this.itemHeight - this.visibleOffsetY) % this.itemHeight;
        let offY = e.pageY - rTop + visOff;
        this.dragData.drop = null;
        this.dragData.where = null;
        let halfLine = this.jQLineDropElement.height() / 2;

        if (e.pageX - this.itemWidth / 2 > this.jQRootElement.width()) {
            this.jQLineDropElement.removeClass("dragged");
            this.clearAutoScroll();
            return;
        } else {
            this.jQLineDropElement.addClass("dragged");
        }

        for (let i = 0; i < this.jQItems.length; i++) {
            let start = offY < 0;
            let pos = (offY >= this.itemHeight * i && offY < this.itemHeight * (i + 1));
            let end = (i + 1 < this.jQItems.length && this.jQItems[i + 1].treeItem === null);
            if (start || pos || end) {

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
            this.clearAutoScroll();
        }
    }

    onDragDrop(e) {
        if (this.dragData.item !== null) {
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
            } else {
                this.update();
            }
        }
    }

    onDragCancel(e) {
        if (this.dragData.item !== null) {
            this.dragData.item.setDragged(false);
        }
        this.mouseUp();
        this.update();
    }

    configureScrollbar() {
        const self = this;
        this.jQScrollBar.dragged = false;
        this.jQScroll.mousedown(function (e) {
            if ($(e.target).is(".tree-scroll-bar")) return;

            let maxHeight = self.computedMaxHeight;
            let height = self.jQScroll.height();
            let barPosY = (-self.offsetY/maxHeight * height);
            let mouseX = e.pageX - self.jQScroll.offset().left;
            let mouseY = e.pageY - self.jQScroll.offset().top;

            if (mouseY < barPosY) {
                self.scrollSet(-mouseY/height * maxHeight);
            } else if (mouseY > barPosY + height * height/maxHeight) {
                self.scrollSet(-(mouseY-height * height/maxHeight)/height * maxHeight);
            }
            if (DragSystem.drag(self.jQScrollBar)) {
                barPosY = (-self.offsetY/maxHeight * height);
                self.jQScrollBar.grabPos = {
                    x: mouseX,
                    y: mouseY,
                    p: barPosY / height
                };
            }
        });
        this.jQScrollBar.mousedown(function (e) {
            if (DragSystem.drag(self.jQScrollBar)) {
                let maxHeight = self.computedMaxHeight;
                let height = self.jQScroll.height();
                let yPos = (-self.offsetY/maxHeight * height);
                self.jQScrollBar.grabPos = {
                    x : e.pageX - self.jQScroll.offset().left,
                    y : e.pageY - self.jQScroll.offset().top,
                    p : yPos/height
                };
            }
        });
        this.jQScrollBar.onDragMove = function (e) {
            let maxHeight = self.computedMaxHeight;
            let height = self.jQScroll.height();
            let offx = e.pageX - self.jQScroll.offset().left;
            let offy = e.pageY - self.jQScroll.offset().top - self.jQScrollBar.grabPos.y;
            let yDist = (offy)/(height);
            self.scrollSet( -( (self.jQScrollBar.grabPos.p + yDist) * maxHeight));
        }
    }

    clearAutoScroll() {
        if (this.dragData.scrollTimerUp !== null) {
            clearInterval(this.dragData.scrollTimerUp);
        }
        if (this.dragData.scrollTimerDown !== null) {
            clearInterval(this.dragData.scrollTimerDown);
        }
        this.dragData.scrollTimerUp = null;
        this.dragData.scrollTimerDown = null;
    }

    updateScrollBar() {
        let maxHeight = this.computedMaxHeight;
        let height = this.jQScroll.height();
        if (height >= maxHeight) {
            this.jQScroll.css("display", "none");
        } else {
            this.jQScroll.css("display", "");
            this.jQScrollBar.css("height", ((height/maxHeight) * 100)+"%");
            this.jQScrollBar.css("top", (-this.offsetY/maxHeight * height) + "px");
        }
    }

    scrollSet(scroll) {
        let prevOffset = this.offsetY;
        this.offsetY = scroll;
        this.limiteOffset();
        if (prevOffset !== this.offsetY) {
            this.update();
        }
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
        this.updateScrollBar();
    }

    getFirstItemIndex() {
        return -Math.floor((-this.offsetY) / this.itemHeight);
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

        this.prevIndex = this.getFirstItemIndex();
        let index = {i : this.prevIndex};
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
        jqItem.fold = jqItem.find('.fold');
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
                if (jqItem.treeItem.folder && !$(e.target).is(".fold")) {
                    jqItem.treeItem.setOpen(!jqItem.treeItem.isOpen());
                    self.update();
                } else  {
                    jqItem.treeItem.treeView.onTreeItemClick?.(jqItem.treeItem);
                }
            }
        }).mousedown(function (e) {
            if (jqItem.treeItem !== null) {
                self.mouseDown(e, jqItem, jqItem.treeItem);
            }
        }).contextmenu(function (e) {
            if (jqItem.treeItem && (self.selection.length === 0 || self.selection.indexOf(jqItem.treeItem) === -1)) {
                self.selectionAdd(jqItem.treeItem, e.ctrlKey);
            }
            self.onRequestContextMenu(e, jqItem.treeItem);
        });
        jqItem.find(".fold").click(function (e) {
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