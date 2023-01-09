import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolSelect extends SpriteTool {
    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
    }

    updateCanvasCursor(pos) {
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        this.editor.canvasCursor.css("display", "none");
    }
}