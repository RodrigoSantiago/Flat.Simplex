import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBrush extends SpriteTool {

    ctx = null;
    min = {};
    max = {};
    size = 5;
    path = "";

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    configureContext() {
        this.ctx.translate(0.5, 0.5);
        this.ctx.fillStyle = '#000000';
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap  = 'round';
        this.ctx.lineJoin  = 'bevel';
        this.ctx.filter = "none";
    }

    resetContext() {
        this.ctx.translate(-0.5, -0.5);
    }

    mouseDown(pos) {
        if (this.ctx === null) {
            this.ctx = this.editor.getCanvas().getContext("2d");
        }
        this.min = {x:pos.x - this.size, y:pos.y - this.size};
        this.max = {x:pos.x + this.size, y:pos.y + this.size};
        this.configureContext();

        this.path = "M " + pos.x + ", " + pos.y + " ";
        this.prevPos = pos;
        this.updatePath();
    }

    mouseMove(pos) {
        this.min.x = Math.min(this.min.x, pos.x - this.size);
        this.min.x = Math.min(this.min.y, pos.y - this.size);
        this.max.x = Math.max(this.max.x, pos.x + this.size);
        this.max.y = Math.max(this.max.y, pos.y + this.size);

        this.path += "L " + pos.x + ", " + pos.y + " ";
        this.prevPos = pos;
        this.updatePath();
    }

    mouseUp(pos) {
        this.resetContext();
    }

    updatePath() {
        this.ctx.clearRect(this.min.x, this.min.y, this.max.x - this.min.x, this.max.y - this.min.y);
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', this.path);
        let length = p.getTotalLength();
        for (let i = 0; i < length; i += this.size * 0.5) {
            let point = p.getPointAtLength(i);
            this.ctx.beginPath();
            this.ctx.ellipse(point.x, point.y, this.size, this.size, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}