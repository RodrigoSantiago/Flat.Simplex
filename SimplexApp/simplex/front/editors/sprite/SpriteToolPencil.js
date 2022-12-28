import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolPencil extends SpriteTool {

    ctx = null;
    min = {};
    max = {};
    size = 5;
    prevPos = {};

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    configureContext() {
        this.ctx.translate(0.5, 0.5);
        this.ctx.fillStyle = '#000000';
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap  = 'round';
        this.ctx.lineJoin  = 'bevel';
        if (this.size <= 2) {
            this.ctx.filter = 'url(#stroke-alpha-1)';
        } else {
            this.ctx.filter = 'url(#stroke-alpha-2)';
        }
    }

    resetContext() {
        this.ctx.filter = "";
        this.ctx.translate(-0.5, -0.5);
    }

    mouseDown(pos) {
        if (this.ctx === null) {
            this.ctx = this.editor.getCanvas().getContext("2d");
        }
        this.min = {x:pos.x - this.size, y:pos.y - this.size};
        this.max = {x:pos.x + this.size, y:pos.y + this.size};
        this.configureContext();

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();

        this.prevPos = pos;
    }

    mouseMove(pos) {
        this.min.x = Math.min(this.min.x, pos.x - this.size);
        this.min.y = Math.min(this.min.y, pos.y - this.size);
        this.max.x = Math.max(this.max.x, pos.x + this.size);
        this.max.y = Math.max(this.max.y, pos.y + this.size);

        this.ctx.beginPath();
        this.ctx.moveTo(this.prevPos.x, this.prevPos.y);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();

        this.prevPos = pos;
    }

    mouseUp(pos) {
        this.resetContext();
    }
}