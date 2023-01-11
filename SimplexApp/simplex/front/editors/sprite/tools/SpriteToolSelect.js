import {SpriteTool} from "./SpriteTool.js";
import {SpriteToolBrush} from "./SpriteToolBrush.js";

const Square = 1;
const Brush = 2;
const Magic = 3;

export class SpriteToolSelect extends SpriteToolBrush {

    animPoint = 0;
    additive = "none";
    additiveView = "none";
    started = false;
    selectMode = 1;

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.pixelMode = true;
        this.jqBox = $("<div class='sprite-selection-box'></div>");
        this.img = new Image();
        this.img.src = "pages/selection-bg.png";
        this.editor.addWindowListener("keydown", (e) => {
            if (this.additiveView === "none" && e.shiftKey) {
                this.additiveView = "add";
            } else if (this.additiveView === "none" && e.ctrlKey) {
                this.additiveView = "sub";
            }
        });
        this.editor.addWindowListener("keyup", (e) => {
            if (this.additiveView === "add" && e.key === "Shift") {
                this.additiveView = "none";
            } else if (this.additiveView === "sub" && e.key === "Control") {
                this.additiveView = "none";
            }
        });
    }

    onSelected() {
        this.brushData = {};
        this.editor.brushMenu.setSize(this.size);
        this.editor.brushMenu.setSizeEnabled(true);
        this.editor.brushMenu.setFlow(100);
        this.editor.brushMenu.setFlowEnabled(false);
        this.editor.brushMenu.setHardness(100);
        this.editor.brushMenu.setHardnessEnabled(false);
        this.editor.brushMenu.setSelectionMode(this.selectMode);
    }

    updateBrushCanvas() {
        this.brushCanvas = this.getBrushCanvas();
        this.generatePixelImage(this.brushCanvas);
    }

    updateCanvasCursor(pos) {
        if (this.selectMode === Brush) {
            this.cursorAsPixel(pos);
        } else {
            this.editor.canvasCursor.css("display", "none");
        }
        if ((this.started && this.additive === "add") || (!this.started && this.additiveView === "add")) {
            this.editor.canvasView.css("cursor", "url(cursor-cross-add.png) 10 10, crosshair");
        } else if ((this.started && this.additive === "sub") || (!this.started && this.additiveView === "sub")) {
            this.editor.canvasView.css("cursor", "url(cursor-cross-sub.png) 10 10, crosshair");
        } else {
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        }
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        let config = this.editor.getBrushConfig();
        this.started = true;
        this.size = config.size;
        this.alpha = 255;
        this.hardness = config.hardness;
        this.flow = config.flow;
        this.color = "#000000FF";
        this.clipping = false;
        this.selectMode = config.selectionMode;
        this.ctx = this.editor.getSelectionContext();
        this.ctxMagic = ctx;
        this.additive = shift ? "add" : ctrl ? "sub" : "none";
        this.tolerance = ((this.size - 1) / 99) * 128;
        this.tolerance2 = this.tolerance * this.tolerance;
        this.toleranceA2 = this.tolerance === 0 ? 0 : this.tolerance * 1.5;
        this.updateBrushCanvas();
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.hardness = config.hardness;
        this.flow = config.flow;
        this.alpha = 255;
        this.color = "#000000FF";
        this.clipping = false;
        this.selectMode = config.selectionMode;

        this.ctx = ctx;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        this.fillPattern = this.ctx.createPattern(this.img, "repeat");

        this.additive = "sub";
        if (this.selectMode === Square) {
            this.ctx.clearRect(10, 10, 60, 60);

        } else if (this.selectMode === Brush) {
            this.size = Math.min(30, config.size);
            this.updateBrushCanvas();
            this.dist = Math.max(1, ((1 - this.flow) * 0.9 + 0.1) * this.size);

            let off = this.size / 2 + 1;
            let d = 80 - off * 2;
            for (let i = 0; i < 0.99; i += 0.1) {
                super.drawBrushLine(
                    {x: i * d + off        , y: this.apply(i) * d + off},
                    {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off});
            }
            this.size = config.size;
        } else {
            this.updateBrushCanvas();
            this.drawBrush(40, 40);
        }
        this.additive = "none";

        // Add Pattern
        let temp = this.getTmpCanvas().getContext("2d");
        this.resetContext(temp);
        temp.clearRect(0, 0, 80, 80);
        temp.filter = "url(#selection-border)";
        temp.drawImage(this.ctx.canvas, 0, 0, 80, 80, 0, 0, 80, 80);
        temp.filter = "none";
        temp.globalCompositeOperation = "destination-out";
        temp.lineWidth = 1;
        temp.strokeStyle = "#FFFFFF";
        temp.rect(0, 0, 80, 80);
        temp.stroke();
        temp.globalCompositeOperation = "source-in";
        temp.fillStyle = this.fillPattern;
        temp.fillRect(0, 0, 80, 80);
        this.ctx.globalCompositeOperation = "copy";
        this.ctx.drawImage(temp.canvas, 0, 0, 80, 80, 0, 0, 80, 80);

    }

    end() {
        super.end();
        this.started = false;
    }

    mouseDown(pos) {
        if (this.additive === "none") {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        if (this.selectMode === Square) {
            this.initPos = pos;
            this.editor.canvasView.append(this.jqBox);
            let w = this.ctx.canvas.width;
            let h = this.ctx.canvas.height;
            let offset = this.editor.canvasPos.offset();
            offset.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
            offset.top += (this.initPos.y - h / 2) * this.editor.zoomStep;
            this.jqBox.offset(offset);
            this.jqBox.css({width : 0, height : 0});

        } else if (this.selectMode === Brush) {
            super.mouseDown(pos);

        } else {
            let w = this.ctx.canvas.width;
            let h = this.ctx.canvas.height;
            let imageDataA = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            let dataA = imageDataA.data;
            let imageDataB = this.ctxMagic.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            let dataB = imageDataB.data;

            let clear = true;
            let p = pos.x * 4 + (pos.y * this.ctxMagic.canvas.width * 4);
            this.pointR = dataB[p];
            this.pointG = dataB[p + 1];
            this.pointB = dataB[p + 2];
            this.pointA = dataB[p + 3];

            let val = this.additive === "sub" ? 0 : 255;
            let wh =  w * h * 4;
            for (let i = 0; i < wh; i += 4) {
                let r = dataB[i];
                let g = dataB[i + 1];
                let b = dataB[i + 2];
                let a = dataB[i + 3];
                if (this.isTolerable(r, g, b, a)) {
                    dataA[i] = val;
                    dataA[i + 1] = val;
                    dataA[i + 2] = val;
                    dataA[i + 3] = val;
                }
                if (dataA[i + 3] !== 0) {
                    clear = false;
                }
            }
            this.ctx.putImageData(imageDataA, 0, 0);
            this.editor.selectionClip = !clear;
        }
    }

    mouseMove(pos) {
        if (this.selectMode === Square) {
            let w = this.ctx.canvas.width;
            let h = this.ctx.canvas.height;
            if (pos.x > this.initPos.x) pos.x++;
            if (pos.y > this.initPos.y) pos.y++;

            let currentOff = this.editor.canvasPos.offset();
            currentOff.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
            currentOff.top += (this.initPos.y - h / 2) * this.editor.zoomStep;

            let offset = this.editor.canvasPos.offset();
            offset.left += (pos.x - w / 2) * this.editor.zoomStep;
            offset.top += (pos.y - h / 2) * this.editor.zoomStep;

            this.jqBox.offset({
                left: Math.min(offset.left, currentOff.left),
                top: Math.min(offset.top, currentOff.top)
            });

            let distW = Math.abs(offset.left - currentOff.left);
            let distH = Math.abs(offset.top - currentOff.top);
            this.jqBox.css({width: distW, height: distH});
        } else if (this.selectMode === Brush) {
            super.mouseMove(pos);
        } else {
            // Already Done
        }
    }

    mouseUp(pos) {
        if (this.selectMode === Square) {
            this.jqBox.detach();
            if (pos.x > this.initPos.x) pos.x++;
            if (pos.y > this.initPos.y) pos.y++;
            let x1 = Math.min(this.initPos.x, pos.x);
            let w = Math.abs(this.initPos.x - pos.x);
            let y1 = Math.min(this.initPos.y, pos.y);
            let h = Math.abs(this.initPos.y - pos.y);
            if (w > 1 && h > 1) {
                this.editor.selectionClip = true;
                if (this.additive === "sub") {
                    this.ctx.globalCompositeOperation = "destination-out";
                }
                this.ctx.fillStyle = this.fillPattern;
                this.ctx.fillRect(x1, y1, w, h);
            } else if (this.additive === "none") {
                this.editor.selectionClip = false;
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
        } else if (this.selectMode === Brush) {
            this.editor.selectionClip = true;
            super.mouseUp(pos);
        } else {
            return;
        }

        if (this.additive === "sub" && this.editor.selectionClip) {
            let imageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            let data = imageData.data;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] !== 0) {
                    return;
                }
            }
            this.editor.selectionClip = false;
        }
    }

    drawBrush(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        if (this.additive === "sub") {
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
            this.ctx.globalCompositeOperation = "source-over";
        } else {
            let brCtx = this.brushCanvas.getContext("2d");
            brCtx.translate(this.animPoint, 0);
            brCtx.globalCompositeOperation = "source-in";
            brCtx.fillStyle = this.fillPattern;
            brCtx.fillRect(-8, -8, this.brushCanvas.width + 16, this.brushCanvas.height + 16);
            brCtx.globalCompositeOperation = "source-over";
            brCtx.translate(-this.animPoint, 0);
            this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
        }
    }

    clip() {

    }

    isTolerable(r, g, b, a) {
        let dist = (
            (r - this.pointR) * (r - this.pointR) +
            (g - this.pointG) * (g - this.pointG) +
            (b - this.pointB) * (b - this.pointB)
        );
        if (dist <= this.tolerance2) {
            return Math.abs(a - this.pointA) <= this.toleranceA2;
        }
        return false;
    }

    animate() {
        if (!this.editor.selectionClip) {
            return;
        }

        this.animPoint++;
        if (this.animPoint >= 6) {
            this.animPoint = 0;
        }
        let ctx = this.editor.getSelectionContext();
        ctx.fillStyle = ctx.createPattern(this.img, "repeat");
        ctx.translate(this.animPoint, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillRect(-8, -8, ctx.canvas.width + 16, ctx.canvas.height + 16);
        ctx.globalCompositeOperation = "source-over";
        ctx.resetTransform();
    }
}