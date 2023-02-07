export class TreeCellAdapter {

    /**
     * Adapt the elements values from a cell to the given TreeItem values
     *
     * @param {TreeCell} treeCell
     * @param {TreeItem} treeItem
     * @param {number} ident
     */
    adapt(treeCell, treeItem, ident) {
        let span = treeCell.span;
        let icon = treeCell.icon;
        let fold = treeCell.fold;
        let line = treeCell.line;
        let jQElement = treeCell.jqItem;

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

        if (treeItem.isSelected()) {
            jQElement.addClass("selected");
        } else {
            jQElement.removeClass("selected");
        }

        if (treeItem.isMarked()) {
            jQElement.addClass("mark");
        } else {
            jQElement.removeClass("mark");
        }

        span.text(treeItem.content.text);
        icon.text(treeItem.content.icon);
        icon.css("background-color", treeItem.content.color);

        let prevHtml = line.html();
        let html = "";
        let ti = treeItem;
        let meLast = !(ti.isOpen() && !ti.isEmpty()) &&
            ti.parent !== null &&
            ti.parent.parent !== null &&
            ti.parent.children.indexOf(ti) === ti.parent.children.length - 1;

        while (ident > 0 && !treeItem.isDragged() && ti !== null && ti.parent !== null && ti.parent.parent !== null) {
            if (ti === treeItem && meLast) {
                html = "<div class='line end'></div>" + html;
            } else if (meLast && ti.isOpen() && !ti.isEmpty() && ti.parent.children.indexOf(ti) === ti.parent.children.length - 1) {
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
    }
}