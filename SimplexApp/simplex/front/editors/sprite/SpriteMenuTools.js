import {SpriteMenu} from "./SpriteMenu.js";

export class SpriteMenuTools extends SpriteMenu {
    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        this.jqColor = jqDragView.find(".color-circle");
        this.jqAltColor = jqDragView.find(".alt-color-circle");
        this.jqColor.css("background-color", this.editor.color);
        this.jqAltColor.css("background-color", this.editor.altColor);
    }

    updateColors() {
        this.jqColor.css("background-color", this.editor.color);
        this.jqAltColor.css("background-color", this.editor.altColor);
    }
}