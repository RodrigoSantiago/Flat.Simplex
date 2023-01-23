import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBrush extends SpriteTool {

    // Brushe
    flow = 0.95;
    hardness = 0.85;

    // Temp
    dist = 0;
    prevPos = {};
    brushData = {};

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.size = 8;
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

    onUnselected() {
        let config = this.getConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        super.onUnselected();
    }

    generateBrushImage(canvas, size, hardness, color) {
        let ctx = canvas.getContext("2d");
        this.resetContext(ctx);
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grd.addColorStop(Math.min(0.99, hardness), color);
        grd.addColorStop(1, color.substring(0, 7) + "00");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
    }

    generatePixelImage(canvas, size, color) {
        let ctx = canvas.getContext("2d");
        this.resetContext(ctx);
        ctx.clearRect(0, 0, 100, 100);
        ctx.fillStyle = color;

        let offset = size / 2 - 0.5;
        let r2 = size === 3 ? 1.2 : (size / 2 + 0.1) * (size / 2 + 0.1);
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let dist = (x - offset) * (x - offset) + (y - offset) * (y - offset);
                if (dist < r2) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
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
                this.generatePixelImage(this.brushCanvas, this.size, this.color);
            } else {
                this.generateBrushImage(this.brushCanvas, this.size, this.hardness, this.color);
            }
        }
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let size = Math.min(30, config.size);
        let hardness = config.hardness;
        let flow = config.flow;
        let dist = -1;

        let tempCtx = this.getSrcCanvas();
        this.resetContext(tempCtx.getContext("2d"));
        this.generateBrushImage(tempCtx, size, hardness, "#000000");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        let off = size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 0.99; i += 0.1) {
            dist = SpriteToolBrush.drawBrushLineCustom(
                {x: i * d + off, y: this.apply(i) * d + off},
                {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off},
                dist,
                Math.max(1, ((1 - flow) * 0.9 + 0.1) * size),
                (x, y) => ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size)
            );
        }
    }

    apply (a) {
        return a * a * a * (a * (a * 6 - 15) + 10);
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);

        let config = this.getConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = (color.length === 9 ? color : color + "FF");
        this.alpha = alpha;
        this.dist = -1;
        this.clipping = this.editor.selectionClip;
        this.align = shift;
        this.alignPoint = 0;

        this.ctx = ctxTemp;
        this.ctxFinal = ctx;
        this.updateBrushCanvas();
    }

    mouseDown(pos) {
        this.resetBoundingChanges(pos, this.size + 1);

        this.initPos = pos;
        this.prevPos = pos;
        if (!this.pixelMode) {
            this.drawBrushLine(this.prevPos, pos);
        } else {
            this.drawPixelLine(this.prevPos, pos);
        }
        this.clip();
    }

    mouseMove(pos) {
        this.computeAlign(pos);
        this.updateBoundingChanges(pos, this.size + 1);

        if (!this.pixelMode) {
            this.drawBrushLine(this.prevPos, pos);
        } else if (this.prevPos.x !== pos.x || this.prevPos.y !== pos.y) {
            this.drawPixelLine(this.prevPos, pos);
        }
        this.prevPos = pos;
        this.clip();
    }

    mouseUp(pos) {
        if (this.ctxFinal) {
            this.ctxFinal.globalAlpha = this.alpha / 255;
            this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
            this.ctxFinal.globalAlpha = 1;
            this.ctxFinal = null;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        this.editor.toolEnd();
    }

    clip() {
        if (this.clipping) {
            let p = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.drawImage(this.editor.getSelectionContext().canvas, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.globalCompositeOperation = p;
        }
    }

    computeAlign(pos) {
        if (this.align) {
            if (this.alignPoint === 0) {
                if (Math.abs(pos.x - this.initPos.x) > Math.abs(pos.y - this.initPos.y)) {
                    this.alignPoint = 1;
                } else if (Math.abs(pos.x - this.initPos.x) < Math.abs(pos.y - this.initPos.y)) {
                    this.alignPoint = 2;
                }
            } else if (this.alignPoint === 1) {
                pos.y = this.initPos.y;
            } else if (this.alignPoint === 2) {
                pos.x = this.initPos.x;
            }
        }
    }

    drawBrush(x, y) {
        if (this.align && this.alignPoint === 0 && x !== this.initPos.x || y !== this.initPos.y) {
            this.computeAlign({x, y});
        }

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
        let spacing = Math.max(1, ((1 - this.flow) * 0.9 + 0.1) * this.size);
        this.dist = SpriteToolBrush.drawBrushLineCustom(pointA, pointB, this.dist, spacing, (x, y) => this.drawBrush(x, y));
    }

    drawPixelLine(pointA, pointB) {
        let x0 = Math.round(pointA.x), y0 = Math.round(pointA.y);
        let x1 = Math.round(pointB.x), y1 = Math.round(pointB.y);
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let nanBlock = 99999;
        while (nanBlock-- > 0) {
            this.drawBrush(x0, y0);

            if (x0 === x1 && y0 === y1) break;
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

    static drawBrushLineCustom(pointA, pointB, dist, spacing, drawBrush) {
        if (dist < 0) {
            dist = 0;
            drawBrush(pointA.x, pointA.y);
        }
        if (pointA.x === pointB.x && pointA.y === pointB.y) {
            return dist;
        }

        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));

        let nx = (pointB.x - pointA.x) / d;
        let ny = (pointB.y - pointA.y) / d;
        let pD = 0;
        while (d >= spacing - dist) {
            pD += (spacing - dist);
            d -= (spacing - dist);
            drawBrush(nx * pD + pointA.x, ny * pD + pointA.y);
            dist = 0;
        }
        return dist + d;
    }

    static drawPixelLineCustom(pointA, pointB, drawBrush) {
        let x0 = Math.round(pointA.x), y0 = Math.round(pointA.y);
        let x1 = Math.round(pointB.x), y1 = Math.round(pointB.y);
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        let nanBlock = 99999;
        while (nanBlock-- > 0) {
            drawBrush(x0, y0);

            if (x0 === x1 && y0 === y1) break;
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