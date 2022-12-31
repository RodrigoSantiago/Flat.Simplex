import {DragSystem} from "../../DragSystem.js";

export class SpriteMenu {

    jqDragView = null;
    dragged = false;
    floating = false;
    type = null;

    _updateTimer = null;

    constructor(editor, jqDragView, dockeable) {
        const self = this;
        this.editor = editor;
        this.jqDragView = jqDragView;
        this.jqDragView.find(".drag").mousedown(function (e) {
            if (DragSystem.drag(self, e.button)) {
                self.onDragStart(e);
            }
        });
        this.dockeable = dockeable;
        this.type = this.jqDragView.parent()[0] === editor.splitVer[0] ? "horizontal" : "vertical";
        this.jqDragView.addClass(this.type);
        this.floating = this.jqDragView.is(".floating");
        if (!dockeable) {
            this.floating = true;
            let off = this.jqDragView.offset();
            this.jqDragView.addClass("floating");
            this.jqDragView.detach();
            this.editor.splitVer.append(this.jqDragView);
            this.jqDragView.offset({left: off.left, top: off.top});

        }
    }

    onDragStart(e) {
        let off = this.jqDragView.offset();
        this.offX = e.pageX - off.left;
        this.offY = e.pageY - off.top;
        this.dragged = true;
        this.floating = true;
        this.jqDragView.addClass("dragging");
        this.jqDragView.addClass("floating");
        this.jqDragView.detach();
        this.editor.splitVer.append(this.jqDragView);
        this.jqDragView.offset({left: e.pageX - this.offX, top: e.pageY - this.offY});
    }

    onDragMove(e) {
        this.jqDragView.offset({left: e.pageX - this.offX, top: e.pageY - this.offY});
        this._updateE = e;
        if (this._updateTimer === null) {
            const self = this;
            self._updateTimer = setTimeout(t => {
                self.editor.dragMenuUpdateLine(self, self._updateE.pageX, self._updateE.pageY);
                self._updateTimer = null;
            }, 100);
        }
    }

    onDragDrop(e) {
        if (!(this.once === 2)) {
            if (this.once) this.once ++;
            else this.once = 1;
        }
        this.editor.dragDropMenu(this, e.pageX, e.pageY);
        this.onDragCancel(e);
    }

    onDragCancel(e) {
        this.dragged = false;
        this.editor.dragDropMenu();
        this.jqDragView.removeClass("dragging");
        if (this._updateTimer !== null) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }
    }
}