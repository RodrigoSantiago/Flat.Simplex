export class TreeCell {

    /** @type{TreeView} */ treeView;
    /** @type{TreeItem} */ treeItem;

    /** @type{JQuery} */ jqItem;
    /** @type{JQuery} */ span;
    /** @type{JQuery} */ icon;
    /** @type{JQuery} */ fold;
    /** @type{JQuery} */ line;

    constructor(treeView, jqItemTemplate) {
        this.treeView = treeView;
        this.jqItem = jqItemTemplate.clone();
        
        this.treeItem = null;
        this.span = this.jqItem.find('span');
        this.icon = this.jqItem.find('.left');
        this.fold = this.jqItem.find('.fold');
        this.line = this.jqItem.find('.ident');

        this.jqItem.on("click", (e) => this.onClick(e));
        this.jqItem.on("dblclick", (e) => this.onDoubleClick(e));
        this.jqItem.on("mousedown", (e) => this.onMouseDown(e));
        this.jqItem.on("contextmenu", (e) => this.onContextClick(e));

        this.fold.on("click", (e) => this.onFolderClick(e));
    }

    setTreeItem(treeItem) {
        this.treeItem = treeItem;
    }

    getWidth() {
        return this.jqItem.outerWidth();
    }

    getHeight() {
        return this.jqItem.outerHeight();
    }
    
    onClick(e) {
        if (this.treeItem === null) {
            if (!e.ctrlKey && !e.shiftKey) {
                this.treeView.selectionClear();
            }
        } else {
            if (e.shiftKey && this.treeView.selection.length >= 0) {
                this.treeView.selectionAddBetween(this.treeView.selection[this.treeView.selection.length - 1], this.treeItem);
            } else if (this.treeItem.isSelected() && e.ctrlKey) {
                this.treeView.selectionRemove(this.treeItem);
            } else {
                this.treeView.selectionAdd(this.treeItem, e.ctrlKey);
            }
        }
    }
    
    onDoubleClick(e) {
        if (this.treeItem !== null) {
            if (this.treeItem.folder && !$(e.target).is(".fold")) {
                this.treeItem.setOpen(!this.treeItem.isOpen());
                this.treeView.update();
            } else {
                this.treeItem.treeView.onTreeItemClick?.(this.treeItem);
            }
        }
    }

    onContextClick(e) {
        if (this.treeItem && (this.treeView.selection.length === 0 || this.treeView.selection.indexOf(this.treeItem) === -1)) {
            this.treeView.selectionAdd(this.treeItem, e.ctrlKey);
        }
        this.treeView.onRequestContextMenu(e, this.treeItem);
    }

    onFolderClick(e) {
        if (this.treeItem !== null) {
            if (this.treeItem.folder) {
                this.treeItem.setOpen(!this.treeItem.isOpen());
                this.treeView.update();
            }
        }
    }

    onMouseDown(e) {
        if (this.treeItem !== null) {
            this.treeView.mouseDown(e, this.jqItem, this.treeItem);
        }
    }
}