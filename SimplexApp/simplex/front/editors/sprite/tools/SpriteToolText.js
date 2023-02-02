import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolText extends SpriteTool {

    /** @type{{x, y}} */ initPos = {x:0, y:0};
    /** @type{{x, y}} */ endPos = {x:0, y:0};

    constructor(editor, jqButton, configMenu)  {
        super(editor, jqButton, configMenu);
    }

    mouseDown(pos) {
        this.initPos = pos;
    }

    mouseMove(pos) {
        this.endPos = pos;
    }

    mouseUp(pos) {
        this.editor.tsBox.onUpdate = (x1, y1, x2, y2, a, signX, signY, handleA, handleB) =>
            this.boxUpdate(x1, y1, x2, y2, a, signX, signY, handleA, handleB);

        this.editor.tsBox.open(pos,
            Math.min(this.initPos.x, this.endPos.x),
            Math.min(this.initPos.y, this.endPos.y),
            Math.abs(this.initPos.x - this.endPos.x),
            Math.abs(this.initPos.y - this.endPos.y), null);
    }

    boxUpdate(x1, y1, x2, y2, a, signX, signY, handleA, handleB) {

    }
}