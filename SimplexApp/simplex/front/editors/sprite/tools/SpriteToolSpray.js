import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolSpray extends SpriteToolBrush {

    static brushCanvas = null;

    interval = null;
    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    updateBrushCanvas() {
        if (SpriteToolSpray.brushCanvas === null) {
            SpriteToolSpray.brushCanvas = document.createElement('canvas');
            SpriteToolSpray.brushCanvas.width = 100;
            SpriteToolSpray.brushCanvas.height = 100;
            SpriteToolSpray.brushCanvas.setup = {size : 0, hardness : 0, color : ""};
            SpriteToolSpray.brTemp = document.createElement('canvas');
            SpriteToolSpray.brTemp.width = 100;
            SpriteToolSpray.brTemp.height = 100;
        }

        this.brushCanvas = SpriteToolSpray.brushCanvas;
        this.brTemp = SpriteToolSpray.brTemp;
        if (this.brushCanvas.setup.size !== this.size ||
            this.brushCanvas.setup.hardness !== this.hardness ||
            this.brushCanvas.setup.color !== this.color) {

            this.brushCanvas.setup.size = this.size;
            this.brushCanvas.setup.hardness = this.hardness;
            this.brushCanvas.setup.color = this.color;

            this.generateBrushImage(this.brushCanvas);
        }
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(40, config.size);
        this.spacing = 0.15;
        this.hardness = config.hardness * 0.5;
        this.color = "#000000" + Math.round(255 * (config.spacing * 0.5 + 0.25)).toString(16);
        this.dist = this.size * this.spacing;
        this.updateBrushCanvas();

        this.ctx = this.brTemp.getContext("2d");
        this.ctx.clearRect(0, 0, 100, 100);
        this.ctxFinal = ctx;
        this.ctxFinal.filter = "none";

        let off = this.size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 1; i += 0.1) {
            this.drawBrushLine({x: i * d + off, y: this.apply(i) * d + off}, {
                x: (i + 0.1) * d + off,
                y: this.apply(i + 0.1) * d + off
            });
        }

        clearTimeout(this.interval);
        this.interval = null;

        for (let i = 0; i < 5; i++) {
            super.drawBrush(d + off, d + off);
        }

        this.ctxFinal.fillStyle = "#FFFFFF";
        this.ctxFinal.rect(0, 0, 80, 80);
        this.ctxFinal.fill();
        this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
    }

    configureContext(color) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.spacing = 0.15;
        this.hardness = config.hardness * 0.5;
        let hex = color.length === 9 ? color : color + "FF";
        let a = parseInt(hex.slice(7, 9), 16);
        this.color = hex.substring(0, 7) + Math.round(a * (config.spacing * 0.5 + 0.25)).toString(16);
        this.dist = 0;

        this.ctx = this.editor.getCanvasB();
        this.ctxFinal = this.editor.getCanvas();
        this.ctx.filter = "none";
        this.ctx.globalCompositeOperation = "source-over";
        this.updateBrushCanvas();
    }

    mouseUp(pos) {
        this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        super.mouseUp(pos);
        if (this.interval !== null) {
            clearTimeout(this.interval);
            this.interval = null;
        }
    }

    drawBrush(x, y) {
        super.drawBrush(x, y);
        this.ctx.globalCompositeOperation = "lighter";
        this.ctx.fillStyle = "#00000001";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2 - 2, this.size / 2 - 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.fillStyle = this.color.substring(0, 7) + "FF";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2 - 1, this.size / 2 - 1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-over";


        if (this.interval !== null) {
            clearTimeout(this.interval);
        }

        this.interval = setTimeout((e) => this.drawBrush(this.prevPos.x, this.prevPos.y), 50);
    }
}