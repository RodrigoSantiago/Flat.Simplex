import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBrush extends SpriteTool {

    // Brushe
    size = 8;
    flow = 0.95;
    hardness = 0.85;
    color = "#000000";

    // Temp
    dist = 0;
    prevPos = {};
    brushData = {};

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
    }

    onSelected() {
        this.brushData = {};
        this.editor.brushMenu.setSize(this.size);
        this.editor.brushMenu.setSizeEnabled(true);
        this.editor.brushMenu.setFlow(this.flow);
        this.editor.brushMenu.setFlowEnabled(true);
        this.editor.brushMenu.setHardness(this.hardness);
        this.editor.brushMenu.setHardnessEnabled(true);
        this.editor.brushMenu.setImageMode();
    }

    updateBrushCanvas() {
        this.brushCanvas = this.getBrushCanvas();
        if (this.brushData.size !== this.size ||
            this.brushData.hardness !== this.hardness ||
            this.brushData.color !== this.color ||
            this.brushData.pixelMode !== this.pixelMode) {

            this.brushData.size = this.size;
            this.brushData.hardness = this.hardness;
            this.brushData.color = this.color;
            this.brushData.pixelMode = this.pixelMode;

            if (this.pixelMode) {
                this.generatePixelImage(this.brushCanvas);
            } else {
                this.generateBrushImage(this.brushCanvas);
            }
        }
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(30, config.size);
        this.hardness = config.hardness;
        this.flow = config.flow;
        this.color = "#000000FF";
        this.clipping = false;

        this.ctx = ctx;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        this.updateBrushCanvas();
        this.dist = Math.max(1, ((1 - this.flow) * 0.9 + 0.1) * this.size);

        let off = this.size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 0.99; i += 0.1) {
            this.drawBrushLine(
                {x: i * d + off        , y: this.apply(i) * d + off},
                {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off});
        }
        this.size = config.size;
    }

    apply (a) {
        return a * a * a * (a * (a * 6 - 15) + 10);
    }

    generateBrushImage(canvas) {
        let ctx = canvas.getContext("2d");
        this.resetContext(ctx);
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
        grd.addColorStop(Math.min(0.99, this.hardness), this.color);
        grd.addColorStop(1, this.color.substring(0, 7) + "00");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
    }

    generatePixelImage(canvas) {
        let ctx = canvas.getContext("2d");
        this.resetContext(ctx);
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

    start(color, alpha, ctx, ctxTemp) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = color.length === 9 ? color : color + "FF";
        this.alpha = alpha;
        this.dist = 0;
        this.clipping = this.editor.selectionClip;

        this.ctx = ctxTemp;
        this.ctxFinal = ctx;
        this.updateBrushCanvas();
    }

    end() {
        super.end();

        if (this.ctxFinal) {
            this.ctxFinal.globalAlpha = this.alpha / 255;
            this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
            this.ctxFinal.globalAlpha = 1;
            this.ctxFinal = null;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    }

    mouseDown(pos) {
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};

        this.prevPos = pos;
        this.drawBrush(pos.x, pos.y);
        this.clip();
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
        this.clip();
    }

    mouseUp(pos) {

    }

    clip() {
        if (this.clipping) {
            let p = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.drawImage(this.editor.getSelectionContext().canvas, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.globalCompositeOperation = p;
        }
    }

    drawBrush(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
        if (this.ctxFinal && !this.pixelMode) {
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.fillStyle = this.color.substring(0, 7) + "FF";
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalCompositeOperation = "source-over";
        }
    }

    drawBrushLine(pointA, pointB) {
        if (pointA.x === pointB.x && pointA.y === pointB.y) {
            return;
        }

        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));

        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = Math.max(1, ((1 - this.flow) * 0.9 + 0.1) * this.size);
        let pD = 0;
        while (d >= spc - this.dist) {
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
            this.drawBrush(x0, y0);

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