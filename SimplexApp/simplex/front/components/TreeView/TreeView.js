import {DragSystem} from "../../DragSystem.js";
import {TreeItem} from "./TreeItem.js";
import {TreeCellAdapter} from "./TreeCellAdapter.js";
import {TreeCell} from "./TreeCell.js";

export class TreeView {

    /** @type{TreeItem} */ root;
    /** @type{JQuery} */ jQRootElement;
    /** @type{JQuery} */ jqContentElement;
    /** @type{JQuery} */ jQItemElement;
    /** @type{JQuery} */ jQItemDragElement;
    /** @type{JQuery} */ jQLineDropElement;
    /** @type{JQuery} */ jQScroll;
    /** @type{JQuery} */ jQScrollArea;

    /** @type{TreeCell[]} */ jqCells = [];
    /** @type{TreeCellAdapter} */ cellAdapter;

    /** @type{Function} */ onTreeItemClick = null;
    /** @type{Function} */ onSingleItemSelected = null;
    /** @type{Function} */ onRequestContextMenu = null;

    /** @type{TreeCell} */ dragCell;
    #dragData = {
        item: null,
        drop: null,
        where: null,
        scrollTimerUp: null,
        scrollTimerDown: null,
        pressed: false,
        dragged: false,
        start: {x: 0, y: 0},
        relative: {x: 0, y: 0}
    }

    /** @type{TreeItem[]} */ selection = [];
    
    #offsetY = 0;
    #visibleOffsetY = 0;
    #itemHeight = 0;
    #itemWidth = 0;
    #computedMaxHeight = 0;
    #prevIndex = -1;

    constructor(jQRootElement, onTreeItemClick, onSingleItemSelected, onRequestContextMenu) {
        this.root = new TreeItem(null);
        this.root.treeView = this;
        this.root.open = true;

        this.jQRootElement = jQRootElement;
        this.jQItemElement = $(
            "<div class='tree-item'>" +
            "   <div class='ident'></div>" +
            "   <i class='fold material-icons'>expand_more</i>" +
            "   <i class='left material-icons'>folder</i>" +
            "   <span class='text'></span>" +
            "</div>");
        this.jqContentElement = $("<div class='tree-content'></div>");

        this.jQScrollArea = $("<div class='tree-scroll-area'></div>");
        this.jQScroll = $("<div class='tree-scroll'><div class='tree-scroll-bar'></div></div>");
        this.jQScrollBar = this.jQScroll.find(".tree-scroll-bar");
        this.jQScrollArea.append(this.jqContentElement);
        this.jQRootElement.append(this.jQScrollArea);
        this.jQRootElement.append(this.jQScroll);

        this.dragCell = new TreeCell(this, this.jQItemElement);
        this.jQItemDragElement = $("<div class='tree-drag-item'></div>");
        this.jQItemDragElement.append(this.dragCell.jqItem);
        this.jQRootElement.append(this.jQItemDragElement);

        this.jQLineDropElement = $("<div class='tree-drop-line'></div>");
        this.jQRootElement.append(this.jQLineDropElement);

        this.onTreeItemClick = onTreeItemClick;
        this.onSingleItemSelected = onSingleItemSelected;
        this.onRequestContextMenu = onRequestContextMenu;
        this.addVisibleItem();
        this.#itemWidth = this.jqCells[0].getWidth();
        this.#itemHeight = this.jqCells[0].getHeight();

        

        $(window).on("mousemove", (e) => this.mouseMove(e));
        $(window).on("mouseup", (e) => this.mouseUp(e));

        jQRootElement[0].addEventListener('wheel', (e) => {
            this.scrollBy(Math.sign(e.deltaY) * -30);
        });

        this.cellAdapter = new TreeCellAdapter();

        this.configureScrollbar();
    }

    mouseDown(e, jqItem, item) {
        this.#dragData.item = item;
        this.#dragData.pressed = true;
        this.#dragData.start = {x: e.pageX - jqItem.offset().left, y: e.pageY - jqItem.offset().top};
        this.#dragData.relative = {x: e.pageX, y: e.pageY};
        this.#dragData.button = e.button;
    }

    mouseMove(e) {
        if (this.#dragData.pressed) {
            let xd = this.#dragData.relative.x - e.pageX;
            let yd = this.#dragData.relative.y - e.pageY;
            if (xd * xd + yd * yd > this.#itemHeight / 2 * this.#itemHeight / 2) {
                if (DragSystem.drag(this, this.#dragData.button)) {
                    this.onDragStart(e);
                }

                this.#dragData.pressed = false;
            }
        }
    }

    mouseUp(e) {
        if (this.#dragData.button === e.button) {
            this.#dragData.item = null;
            this.#dragData.pressed = false;
            this.#dragData.drop = null;
            this.#dragData.where = null;
            this.jQItemDragElement.removeClass("dragged");
            this.jQLineDropElement.removeClass("dragged");
            if (this.#dragData.scrollTimerUp !== null) {
                clearInterval(this.#dragData.scrollTimerUp);
            }
            if (this.#dragData.scrollTimerDown !== null) {
                clearInterval(this.#dragData.scrollTimerDown);
            }
            this.#dragData.scrollTimerUp = null;
            this.#dragData.scrollTimerDown = null;
        }
    }

    onDragStart(e) {
        this.jQItemDragElement.addClass("dragged");
        this.jQLineDropElement.addClass("dragged");
        this.cellAdapter.adapt(this.dragCell, this.#dragData.item, 0);

        this.#dragData.item.setDragged(true);
        this.selectionAdd(this.#dragData.item, false);
        this.update();
    }

    onDragMove(e) {
        this.jQItemDragElement.offset({top: e.pageY - this.#itemHeight / 2, left: e.pageX - this.#itemWidth / 2});

        let rTop = this.jQRootElement.offset().top;
        let visOff = (this.#itemHeight - this.#visibleOffsetY) % this.#itemHeight;
        let offY = e.pageY - rTop + visOff;
        this.#dragData.drop = null;
        this.#dragData.where = null;
        let halfLine = this.jQLineDropElement.height() / 2;

        if (e.pageX - this.#itemWidth / 2 > this.jQRootElement.width()) {
            this.jQLineDropElement.removeClass("dragged");
            this.clearAutoScroll();
            return;
        } else {
            this.jQLineDropElement.addClass("dragged");
        }

        for (let i = 0; i < this.jqCells.length; i++) {
            let start = offY < 0;
            let pos = (offY >= this.#itemHeight * i && offY < this.#itemHeight * (i + 1));
            let end = (i + 1 < this.jqCells.length && this.jqCells[i + 1].treeItem === null);
            if (start || pos || end) {

                let treeItem = this.jqCells[i].treeItem;
                this.#dragData.drop = treeItem;
                let totalOffset = 0;
                let top = this.#itemHeight * i + rTop - visOff;
                let mid = this.#itemHeight * i + this.#itemHeight * 0.5 + rTop - visOff;
                let bot = this.#itemHeight * (i + 1) + rTop - visOff;

                if (treeItem.isFolder() && (!treeItem.isOpen() || treeItem.children.length === 0)) {
                    if (offY < (this.#itemHeight * i) + this.#itemHeight / 3) {
                        totalOffset = top;
                        this.#dragData.where = 'top';
                    } else if (offY < (this.#itemHeight * i) + this.#itemHeight / 3 * 2) {
                        totalOffset = mid;
                        this.#dragData.where = 'mid';
                    } else {
                        totalOffset = bot;
                        this.#dragData.where = 'bot';
                    }
                } else {
                    if (offY < (this.#itemHeight * i) + this.#itemHeight / 2) {
                        totalOffset = top;
                        this.#dragData.where = 'top';
                    } else {
                        totalOffset = treeItem.isFolder() ? mid : bot;
                        this.#dragData.where = treeItem.isFolder() ? 'mid' : 'bot';
                    }
                }
                if (!pos && end) {
                    this.#dragData.where = 'mid';
                    this.#dragData.drop = this.root;
                }
                this.jQLineDropElement.offset({top: totalOffset - halfLine});
                this.jQLineDropElement.css({"--drop-ident": treeItem.getIdent() - 1});
                break;
            }
        }

        if (e.pageY - rTop < 16) {
            if (this.#dragData.scrollTimerUp === null) {
                this.#dragData.scrollTimerUp = setInterval((e) => this.scrollBy(24), 200);
            }
        } else if (e.pageY - rTop > this.visibleHeight() - 16) {
            if (this.#dragData.scrollTimerDown === null) {
                this.#dragData.scrollTimerDown = setInterval((e) => this.scrollBy(-24), 200)
            }
        }
        if (!(e.pageY - rTop < 16) && !(e.pageY - rTop > this.visibleHeight() - 16)) {
            this.clearAutoScroll();
        }
    }

    onDragDrop(e) {
        if (this.#dragData.item !== null) {
            this.#dragData.item.setDragged(false);
            if (this.#dragData.drop !== null && !this.#dragData.drop.isChildOf(this.#dragData.item)) {
                this.#dragData.item.parent.removeChild(this.#dragData.item);
                let index = this.#dragData.drop.getIndex();

                if (this.#dragData.where === 'top') {
                    this.#dragData.drop.parent.addChild(this.#dragData.item, index);
                } else if (this.#dragData.where === 'bot') {
                    this.#dragData.drop.parent.addChild(this.#dragData.item, index + 1);
                } else if (this.#dragData.where === 'mid') {
                    this.#dragData.drop.addChild(this.#dragData.item);
                }

                this.selectionAdd(this.#dragData.item, false);
            } else {
                this.update();
            }
        }
    }

    onDragCancel(e) {
        if (this.#dragData.item !== null) {
            this.#dragData.item.setDragged(false);
        }
        this.mouseUp();
        this.update();
    }

    configureScrollbar() {
        this.jQScrollBar.dragged = false;
        this.jQScroll.on("mousedown", (e) => {
            if ($(e.target).is(".tree-scroll-bar")) return;

            let maxHeight = this.#computedMaxHeight;
            let height = this.jQScroll.height();
            let barPosY = (-this.#offsetY / maxHeight * height);
            let mouseX = e.pageX - this.jQScroll.offset().left;
            let mouseY = e.pageY - this.jQScroll.offset().top;

            if (mouseY < barPosY) {
                this.scrollSet(-mouseY / height * maxHeight);
            } else if (mouseY > barPosY + height * height / maxHeight) {
                this.scrollSet(-(mouseY - height * height / maxHeight) / height * maxHeight);
            }
            if (DragSystem.drag(this.jQScrollBar, e.button)) {
                barPosY = (-this.#offsetY / maxHeight * height);
                this.jQScrollBar.grabPos = {
                    x: mouseX,
                    y: mouseY,
                    p: barPosY / height
                };
            }
        });
        this.jQScrollBar.on("mousedown", (e) => {
            if (DragSystem.drag(this.jQScrollBar, e.button)) {
                let maxHeight = this.#computedMaxHeight;
                let height = this.jQScroll.height();
                let yPos = (-this.#offsetY / maxHeight * height);
                this.jQScrollBar.grabPos = {
                    x: e.pageX - this.jQScroll.offset().left,
                    y: e.pageY - this.jQScroll.offset().top,
                    p: yPos / height
                };
            }
        });
        this.jQScrollBar.onDragMove = (e) => {
            let maxHeight = this.#computedMaxHeight;
            let height = this.jQScroll.height();
            let offx = e.pageX - this.jQScroll.offset().left;
            let offy = e.pageY - this.jQScroll.offset().top - this.jQScrollBar.grabPos.y;
            let yDist = (offy) / (height);
            this.scrollSet(-((this.jQScrollBar.grabPos.p + yDist) * maxHeight));
        }
    }

    clearAutoScroll() {
        if (this.#dragData.scrollTimerUp !== null) {
            clearInterval(this.#dragData.scrollTimerUp);
        }
        if (this.#dragData.scrollTimerDown !== null) {
            clearInterval(this.#dragData.scrollTimerDown);
        }
        this.#dragData.scrollTimerUp = null;
        this.#dragData.scrollTimerDown = null;
    }

    updateScrollBar() {
        let maxHeight = this.#computedMaxHeight;
        let height = this.jQScroll.height();
        if (height >= maxHeight) {
            this.jQScroll.css("display", "none");
        } else {
            this.jQScroll.css("display", "");
            this.jQScrollBar.css("height", ((height / maxHeight) * 100) + "%");
            this.jQScrollBar.css("top", (-this.#offsetY / maxHeight * height) + "px");
        }
    }

    scrollSet(scroll) {
        let prevOffset = this.#offsetY;
        this.#offsetY = scroll;
        this.limiteOffset();
        if (prevOffset !== this.#offsetY) {
            this.update();
        }
    }

    scrollBy(scroll) {
        let prevOffset = this.#offsetY;
        this.#offsetY += scroll;
        this.limiteOffset();
        if (prevOffset !== this.#offsetY) {
            this.update();
        }
    }

    visibleHeight() {
        return this.jQRootElement.height() - 16;
    }

    limiteOffset() {
        if (this.#offsetY > 0) {
            this.#offsetY = 0;
        } else if (-this.#offsetY + this.visibleHeight() > this.#computedMaxHeight) {
            this.#offsetY = -Math.max(0, this.#computedMaxHeight - this.visibleHeight());
        }
        this.#visibleOffsetY = this.#offsetY % this.#itemHeight;
        this.jqContentElement.css({top: this.#visibleOffsetY});
        this.updateScrollBar();
    }

    getFirstItemIndex() {
        return -Math.floor((-this.#offsetY) / this.#itemHeight);
    }

    update() {
        this.#itemHeight = this.jqCells[0].getHeight();
        this.#computedMaxHeight = this.computeMaxHeight(this.root) * this.#itemHeight;
        this.limiteOffset();

        let height = this.visibleHeight() + this.#itemHeight * 2;
        let currentHeight = this.jqCells.length * this.#itemHeight;
        while (currentHeight < height && this.jqCells.length < 100) {
            this.addVisibleItem();
            currentHeight += this.#itemHeight;
        }

        this.#prevIndex = this.getFirstItemIndex();
        let index = {i: this.#prevIndex};
        for (const child of this.root.children) {
            if (!this.updateItem(child, index, 0)) {
                break;
            }
        }
        while (index.i < this.jqCells.length) {
            let cell = this.jqCells[index.i];
            cell.setTreeItem(null);
            this.cellAdapter.adapt(cell, null, 0);
            index.i++;
        }
    }

    updateItem(item, index, ident) {
        if (index.i < this.jqCells.length) {
            if (index.i >= 0) {
                let cell = this.jqCells[index.i];
                cell.setTreeItem(item);
                this.cellAdapter.adapt(cell, item, ident);
            }
            index.i++;

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
        const cell = new TreeCell(this, this.jQItemElement);
        this.jqCells.push(cell);
        this.jqContentElement.append(cell.jqItem);
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

    /**
     * 
     * @param item {TreeItem}
     * @param additive {boolean}
     */
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
        let index = {i: 1};
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