import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBrush extends SpriteTool {

    static brushCanvas = null;

    ctx = null;
    min = {};
    max = {};
    size = 30;
    spacing = 0.25;
    hardness = 1.0;
    color = "#000000";

    dist = 0;
    prevPos = {};

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    updateBrushCanvas() {
        if (SpriteToolBrush.brushCanvas === null) {
            SpriteToolBrush.brushCanvas = document.createElement('canvas');
            SpriteToolBrush.brushCanvas.width = 100;
            SpriteToolBrush.brushCanvas.height = 100;
            SpriteToolBrush.brushCanvas.setup = {size : 0, hardness : 0, color : ""};
        }

        this.brushCanvas = SpriteToolBrush.brushCanvas;
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
        this.size = Math.min(30, config.size);
        this.spacing = 1 - config.spacing;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.dist = this.size * this.spacing;

        this.ctx = ctx;
        this.ctx.filter = "none";

        ctx.fillStyle = "#FFFFFF";
        ctx.rect(0, 0, 80, 80);
        ctx.fill();

        this.updateBrushCanvas();

        let off = this.size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 1; i += 0.1) {
            this.drawBrushLine({x: i * d + off, y: this.apply(i) * d + off}, {
                x: (i + 0.1) * d + off,
                y: this.apply(i + 0.1) * d + off
            });
        }
    }

    apply (a) {
        return a * a * a * (a * (a * 6 - 15) + 10);
    }

    configureContext(color) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.spacing = 1 - config.spacing;
        this.hardness = config.hardness;
        this.color = color.length === 9 ? color : color + "FF";
        this.dist = 0;

        this.ctx = this.editor.getCanvas();
        this.ctx.filter = "none";

        this.updateBrushCanvas();
    }

    generateBrushImage(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
        grd.addColorStop(Math.min(0.99, this.hardness), this.color);
        grd.addColorStop(1, this.color.substring(0, 7) + "00");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
    }

    generatePixelImage(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);
        ctx.fillStyle = this.color;
        let offset = this.size / 2 - 0.5;
        let r2 = this.size === 3 ? 1.2 : (this.size / 2 + 0.1) * (this.size / 2 + 0.1);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let dist = (x - offset) * (x - offset) + (y - offset) * (y - offset);
                if (dist < r2) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    resetContext() {
        this.ctx.resetTransform();
        this.ctx.filter = "none";
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.globalAlpha = 1;
    }

    mouseDown(pos, color) {
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};
        this.configureContext(color);

        this.prevPos = pos;
        if (this.pixelMode) {
            this.drawPixels(pos.x, pos.y);
        } else {
            this.drawBrush(pos.x, pos.y);
        }
    }

    mouseMove(pos) {
        this.min.x = Math.min(this.min.x, pos.x - this.size);
        this.min.x = Math.min(this.min.y, pos.y - this.size);
        this.max.x = Math.max(this.max.x, pos.x + this.size);
        this.max.y = Math.max(this.max.y, pos.y + this.size);


        if (this.pixelMode) {
            this.drawPixelLine(this.prevPos, pos);
        } else {
            this.drawBrushLine(this.prevPos, pos);
        }
        this.prevPos = pos;
    }

    mouseUp(pos) {
        this.resetContext();
    }

    drawBrush(x, y) {
        this.ctx.drawImage(this.brushCanvas,
            0, 0, this.size, this.size,
            x - this.size / 2, y - this.size / 2,
            this.size, this.size);
    }

    drawPixels(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        this.ctx.drawImage(this.brushCanvas,
            0, 0, this.size, this.size,
            px, py,
            this.size, this.size);
    }

    drawBrushLine(pointA, pointB) {
        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        if (d <= 0.001) {
            this.dist += d;
            return;
        }

        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = Math.max(1, this.spacing * this.size);
        let pD = 0;
        while (d > spc - this.dist) {
            pD += (spc - this.dist);
            d -= (spc - this.dist);
            this.drawBrush(n.x * pD + pointA.x, n.y * pD + pointA.y);
            this.dist = 0;
        }
        this.dist += d;
    }

    drawPixelLine(pointA, pointB) {
        let x0 = pointA.x, y0 = pointA.y;
        let x1 = pointB.x, y1 = pointB.y;
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let nanBlock = 99999;
        while(nanBlock-- > 0) {
            this.drawPixels(x0, y0);

            if ((x0 === x1) && (y0 === y1)) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
}