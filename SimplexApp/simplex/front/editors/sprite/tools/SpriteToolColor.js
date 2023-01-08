import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolColor extends SpriteTool {
    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.jqButton.off('click');
        this.jqButton.on("click", (e) => configMenu.show());
    }
}