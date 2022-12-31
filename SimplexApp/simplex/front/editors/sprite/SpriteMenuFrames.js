import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteFrame} from "./SpriteFrame.js";

export class SpriteMenuFrames extends SpriteMenu {
    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        const self = this;

        this.jqContainer = jqDragView.find(".frames-container");
        this.jqAddBtn = jqDragView.find(".frame-add");

        this.jqAddBtn.click(function (e) {
            self.editor.frameAdd();
        });
    }

    frameAdd() {
        let frame = new SpriteFrame(this.editor);

        this.editor.frames.push(frame);
        this.jqContainer.append(frame.jqFrameBtn);
        this.frameSelect(frame);
    }

    frameRemove(frame) {
        let index = this.editor.frames.indexOf(frame);
        this.editor.frames.splice(index, 1);

        if (this.editor.frames.length === 0) {
            this.editor.frameAdd();
        }

        if (this.editor.selectedFrame === frame) {
            this.frameSelect(this.editor.frames[Math.max(0, index - 1)]);
        }
        frame.jqFrameBtn.remove();
    }

    frameSelect(frame) {
        let before = this.editor.layers;
        this.editor.layers = frame.layers;
        if (frame.layers.length === 0) {
            this.editor.layerAdd();
        }

        if (this.editor.selectedFrame !== null) {
            this.editor.selectedFrame.jqFrameBtn.removeClass("selected");
        }
        this.editor.selectedFrame = frame;
        this.editor.selectedFrame.jqFrameBtn.addClass("selected");

        this.editor.layersMenu.resetApearence(before, frame.layers);
        this.editor.layersMenu.layerSelect(frame.layers[0]);
    }
}