export class TreeItem {

    /** @type{*} */ content;

    /** @type{TreeView} */ treeView = null;
    /** @type{TreeItem} */ parent = null;
    /** @type{TreeItem[]} */ children = [];

    /** @type{boolean} */ folder = false;
    /** @type{boolean} */ open = false;
    /** @type{boolean} */ selected = false;
    /** @type{boolean} */ dragged = false;
    /** @type{number} */ tempIndex = 0;
    /** @type{boolean} */ mark = false;

    /**
     * Base constructor
     *
     * @param {*} content The content that the TreeItem holds
     * @param {boolean} [isFolder] If the current TreeItem is an fold
     */
    constructor(content, isFolder) {
        this.content = content;
        this.folder = !!isFolder;
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

        this.treeView.onTreeChange?.();
    }

    removeChild(item) {
        let index = this.children.indexOf(item);
        if (index >= 0) {
            this.children.splice(index, 1);
            if (item.parent === this) {
                item.treeView.onTreeChange?.();
                item.treeView.selectionRemove(item);

                item.parent = null;
                item.setMark(false);
            }
        }
    }

    isEmpty() {
        return this.children.length === 0;
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

    setMark(mark) {
        this.mark = mark;
        for(let child of this.children) {
            child.setMark(mark);
        }
    }

    isMarked() {
        return this.mark;
    }
}