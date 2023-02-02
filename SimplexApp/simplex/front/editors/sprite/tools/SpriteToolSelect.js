import {SpriteToolBrush} from "./SpriteToolBrush.js";
import {Dialogs} from "../../../Dialogs.js";

const Square = 1;
const Brush = 2;
const Magic = 3;
const Transform = 4;

export class SpriteToolSelect extends SpriteToolBrush {

    animPoint = 0;
    additive = "none";
    additiveView = "none";
    started = false;
    selectMode = 1;
    boolBrush = [];

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
        this.boolBrush = new Array(100 * 100);
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

    onUnselected() {
        let config = this.getConfig();
        this.selectMode = config.selectionMode;

        if (this.editor.tsBox.isOpen) {
            this.editor.toolStart(this.color, this.alpha, false, false, false);
            this.mouseSaveTransform(this.editor.tsBox);
            this.editor.toolEnd();
        }
        super.onUnselected();
    }

    updateBrushCanvas() {
        this.brushCanvas = this.getBrushCanvas();
        this.generatePixelImage(this.brushCanvas, this.size, this.color, this.boolBrush);
    }

    generatePixelImage(canvas, size, color, boolBrush) {
        if (!boolBrush) {
            super.generatePixelImage(canvas, size, color, boolBrush);
            return;
        }

        for (let i = 0; i < 100 * 100; i++) {
            boolBrush[i] = false;
        }
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
                    boolBrush[x + y * 100] = true;
                }
            }
        }
    }

    updateCanvasCursor(pos) {
        if (this.selectMode === Brush) {
            this.cursorAsPixel(pos);
        } else {
            this.editor.canvasCursor.css("display", "none");
        }
        if ((this.drawing && this.additive === "add") || (!this.drawing && this.additiveView === "add")) {
            this.editor.canvasView.css("cursor", "url(cursor-cross-add.png) 10 10, crosshair");
        } else if ((this.drawing && this.additive === "sub") || (!this.drawing && this.additiveView === "sub")) {
            this.editor.canvasView.css("cursor", "url(cursor-cross-sub.png) 10 10, crosshair");
        } else {
            if (!this.drawing) {
                let canvasPos = this.editor.convertCanvasPosition({pageX : Dialogs.mouseX, pageY : Dialogs.mouseY});
                if (canvasPos.x >= 0 && canvasPos.x < this.editor.imageWidth &&
                    canvasPos.y >= 0 && canvasPos.y < this.editor.imageHeight) {
                    if (this.editor.selectionPixels[canvasPos.y * this.editor.imageWidth + canvasPos.x]) {
                        this.editor.canvasView.css("cursor", "move");
                        return;
                    }
                }
            }
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        }
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let flow = config.flow;
        let selectMode = config.selectionMode;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        if (selectMode === Square) {
            ctx.clearRect(10, 10, 60, 60);

        } else if (selectMode === Brush) {
            let size =  Math.min(30, config.size);

            let tempCtx = this.getSrcCanvas();
            this.resetContext(tempCtx.getContext("2d"));
            this.generatePixelImage(tempCtx, size, "#000000");

            let dist = Math.max(1, ((1 - flow) * 0.9 + 0.1) * size);

            ctx.globalCompositeOperation = "destination-out";
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
            ctx.globalCompositeOperation = "source-over";
        } else {
            let size = config.size;

            let tempCtx = this.getSrcCanvas();
            this.resetContext(tempCtx.getContext("2d"));
            this.generatePixelImage(tempCtx, size, "#000000");

            ctx.globalCompositeOperation = "destination-out";
            ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(40 - size / 2), Math.round(40 - size / 2), size, size);
            ctx.globalCompositeOperation = "source-over";
        }

        // Add Pattern
        let temp = this.getTmpCanvas().getContext("2d");
        this.resetContext(temp);
        temp.clearRect(0, 0, 80, 80);
        temp.filter = "url(#selection-border)";
        temp.drawImage(ctx.canvas, 0, 0, 80, 80, 0, 0, 80, 80);
        temp.filter = "none";
        temp.globalCompositeOperation = "destination-out";
        temp.lineWidth = 1;
        temp.strokeStyle = "#FFFFFF";
        temp.rect(0, 0, 80, 80);
        temp.stroke();
        temp.globalCompositeOperation = "source-in";
        temp.fillStyle = ctx.createPattern(this.img, "repeat");
        temp.fillRect(0, 0, 80, 80);
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(temp.canvas, 0, 0, 80, 80, 0, 0, 80, 80);

    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);
        let config = this.getConfig();
        this.align = false;
        this.alpha = 255;
        this.color = "#000000FF";
        this.clipping = false;
        this.selectMode = config.selectionMode;
        this.ctx = this.editor.getSelectionContext();
        this.ctxMagic = ctx;
        this.additive = shift ? "add" : ctrl ? "sub" : "none";
        this.tolerance = ((this.size - 1) / 99) * 128;
        this.tolerance2 = this.tolerance * this.tolerance;
        this.toleranceA2 = this.tolerance === 0 ? 0 : this.tolerance * 1.5;
        this.fillPattern = ctx.createPattern(this.img, "repeat");
        this.updateBrushCanvas();
    }

    end() {
        super.end();
    }

    mouseDown(pos) {
        if (this.editor.tsBox.isOpen) {
            this.mouseSaveTransform(this.editor.tsBox);
        }

        if (this.additive === "none" &&
            pos.x >= 0 && pos.x < this.editor.imageWidth &&
            pos.y >= 0 && pos.y < this.editor.imageHeight &&
            this.editor.selectionPixels[pos.y * this.editor.imageWidth + pos.x]) {
            this.selectMode = Transform;
            this.mouseDownTransform(pos);
        } else {

            if (this.additive === "none") {
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                this.clearSelect();
            }
            if (this.selectMode === Square) {
                this.mouseDownSquare(pos);
            } else if (this.selectMode === Brush) {
                this.mouseDownBrush(pos);
            } else if (this.selectMode === Magic) {
                this.mouseDownMagic(pos);
            }
        }
    }

    mouseMove(pos) {
        if (this.selectMode === Square) {
            this.mouseMoveSquare(pos);
        } else if (this.selectMode === Brush) {
            this.mouseMoveBrush(pos);
        } else if (this.selectMode === Magic) {
            this.mouseMoveMagic(pos);
        }
    }

    mouseUp(pos) {
        if (this.selectMode === Square) {
            this.mouseUpSquare(pos);
        } else if (this.selectMode === Brush) {
            this.mouseUpBrush(pos);
        } else if (this.selectMode === Magic) {
            this.mouseUpMagic(pos);
        }
        this.editor.toolEnd();
    }

    mouseDownTransform(pos) {
        let mix = this.imgWidth();
        let miy = this.imgHeight();
        let max = 0;
        let may = 0;
        for (let i = 0; i < this.imgHeight(); i++) {
            let p = i * this.imgWidth();
            for (let j = 0; j < this.imgWidth(); j++) {
                if (this.editor.selectionPixels[p + j]) {
                    if (j < mix) mix = j;
                    if (j > max) max = j;
                    if (i < miy) miy = i;
                    if (i > may) may = i;
                }
            }
        }
        max += 1;
        may += 1;
        this.clearSelect();
        let canvas = document.createElement('canvas');
        canvas.width = max - mix;
        canvas.height = may - miy;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.ctx.canvas, mix, miy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(this.ctxMagic.canvas, mix, miy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";

        this.ctxMagic.globalCompositeOperation = "destination-out";
        this.ctxMagic.drawImage(this.ctx.canvas, 0, 0, this.imgWidth(), this.imgHeight());
        this.ctxMagic.globalCompositeOperation = "source-over";

        let src = canvas.toDataURL();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.editor.selectionClip = false;

        this.editor.tsBox.open(pos, mix, miy, max - mix, may - miy, src);
    }

    mouseSaveTransform(tsBox) {
        let x1 = tsBox.cx - tsBox.width / 2;
        let y1 = tsBox.cy - tsBox.height / 2;
        let initW = tsBox.startWidth;
        let initH = tsBox.startHeight;

        this.ctxMagic.translate(tsBox.cx, tsBox.cy);
        this.ctxMagic.rotate(tsBox.angle);
        this.ctxMagic.imageSmoothingEnabled = false;
        this.ctxMagic.imageSmoothingQuality = 'low';
        let inX = (tsBox.signX === 1) ? 0 : initW;
        let inY = (tsBox.signX === 1) ? 0 : initH;
        this.ctxMagic.drawImage(tsBox.jqImg[0], inX, inY, initW - inX, initH - inY, -tsBox.width/2, -tsBox.height/2, tsBox.width, tsBox.height);
        this.ctxMagic.imageSmoothingQuality = 'high';
        this.ctxMagic.imageSmoothingEnabled = true;
        this.ctxMagic.resetTransform();
        this.editor.tsBox.close();
    }

    mouseDownSquare(pos) {
        this.initPos = pos;
        this.editor.canvasView.append(this.jqBox);
        let w = this.ctx.canvas.width;
        let h = this.ctx.canvas.height;
        let offset = this.editor.canvasPos.offset();
        offset.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
        offset.top += (this.initPos.y - h / 2) * this.editor.zoomStep;
        this.jqBox.offset(offset);
        this.jqBox.css({width : 0, height : 0});
    }

    mouseMoveSquare(pos) {
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
    }

    mouseUpSquare(pos) {
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
                this.subBlock(x1, y1, w, h);
            } else {
                this.addBlock(x1, y1, w, h);
            }
            this.ctx.fillStyle = this.fillPattern;
            this.ctx.fillRect(x1, y1, w, h);
        } else if (this.additive === "none") {
            this.editor.selectionClip = false;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }

        this.isClear();
    }

    mouseDownBrush(pos) {
        super.mouseDown(pos);
    }

    mouseMoveBrush(pos) {
        super.mouseMove(pos);
    }

    mouseUpBrush(pos) {
        this.editor.selectionClip = true;
        this.editor.toolEnd();
    }

    mouseDownMagic(pos) {
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
                this.editor.selectionPixels[i / 4] = !!val;
            }
            if (dataA[i + 3] !== 0) {
                clear = false;
            }
        }
        this.ctx.putImageData(imageDataA, 0, 0);
        this.editor.selectionClip = !clear;
    }

    mouseMoveMagic(pos) {

    }

    mouseUpMagic(pos) {
        this.isClear();
    }

    drawBrush(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        if (this.additive === "sub") {
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
            this.ctx.globalCompositeOperation = "source-over";
            this.subBrush(px, py, this.size, this.size);
        } else {
            let brCtx = this.brushCanvas.getContext("2d");
            brCtx.translate(this.animPoint, 0);
            brCtx.globalCompositeOperation = "source-in";
            brCtx.fillStyle = this.fillPattern;
            brCtx.fillRect(-8, -8, this.brushCanvas.width + 16, this.brushCanvas.height + 16);
            brCtx.globalCompositeOperation = "source-over";
            brCtx.translate(-this.animPoint, 0);
            this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
            this.addBrush(px, py, this.size, this.size);
        }
    }

    clip() {

    }

    isClear() {
        if (this.additive === "sub" && this.editor.selectionClip) {
            for (let i = 0, l = this.ctx.canvas.width * this.ctx.canvas.height; i < l; i++) {
                if (this.editor.selectionPixels[i]) {
                    this.editor.selectionClip = true;
                    return;
                }
            }
            this.editor.selectionClip = false;
        }
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

    clearSelect() {
        for (let i = 0, l = this.ctx.canvas.width * this.ctx.canvas.height; i < l; i++) {
            this.editor.selectionPixels[i] = false;
        }
    }

    addBlock(x, y, w, h) {
        for (let j = y; j < y + h; j++) {
            let p = j * this.editor.imageWidth;
            for (let i = x; i < x + w; i++) {
                this.editor.selectionPixels[p + i] = true;
            }
        }
    }

    subBlock(x, y, w, h) {
        for (let j = y; j < y + h; j++) {
            let p = j * this.editor.imageWidth;
            for (let i = x; i < x + w; i++) {
                this.editor.selectionPixels[p + i] = false;
            }
        }
    }

    addBrush(x, y, w, h) {
        for (let j = y; j < y + h; j++) {
            let p = j * this.editor.imageWidth;
            let p2 = (j - y) * 100;
            for (let i = x; i < x + w; i++) {
                if (this.boolBrush[p2 + i - x]) {
                    this.editor.selectionPixels[p + i] = true;
                }
            }
        }
    }

    subBrush(x, y, w, h) {
        for (let j = y; j < y + h; j++) {
            let p = j * this.editor.imageWidth;
            let p2 = (j - y) * 100;
            for (let i = x; i < x + w; i++) {
                if (this.boolBrush[p2 + i - x]) {
                    this.editor.selectionPixels[p + i] = false;
                }
            }
        }
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