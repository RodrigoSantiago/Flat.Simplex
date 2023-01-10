import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolSelect extends SpriteTool {

    animPoint = 0;

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.jqBox = $("<div class='sprite-selection-box'></div>");
        this.img = new Image();
        this.img.src = "pages/selection-bg.png";
    }

    updateCanvasCursor(pos) {
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        this.editor.canvasCursor.css("display", "none");
    }

    start(color, alpha, ctx, ctxTemp) {
        this.ctx = ctx;
    }

    end() {

    }

    mouseDown(pos) {
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

    mouseMove(pos) {
        let w = this.ctx.canvas.width;
        let h = this.ctx.canvas.height;
        if (pos.x > this.initPos.x) pos.x ++;
        if (pos.y > this.initPos.y) pos.y ++;

        let currentOff = this.editor.canvasPos.offset();
        currentOff.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
        currentOff.top += (this.initPos.y - h / 2) * this.editor.zoomStep;

        let offset = this.editor.canvasPos.offset();
        offset.left += (pos.x - w / 2) * this.editor.zoomStep;
        offset.top += (pos.y - h / 2) * this.editor.zoomStep;

        this.jqBox.offset({left : Math.min(offset.left, currentOff.left), top : Math.min(offset.top, currentOff.top)});

        let distW = Math.abs(offset.left - currentOff.left);
        let distH = Math.abs(offset.top - currentOff.top);
        this.jqBox.css({width : distW, height : distH});
    }

    mouseUp(pos) {
        this.jqBox.detach();
        if (pos.x > this.initPos.x) pos.x ++;
        if (pos.y > this.initPos.y) pos.y ++;
        let x1 = Math.min(this.initPos.x, pos.x);
        let w = Math.abs(this.initPos.x - pos.x);
        let y1 = Math.min(this.initPos.y, pos.y);
        let h = Math.abs(this.initPos.y - pos.y);
        let ctx = this.editor.getSelectionContext();
        if (w > 1 && h > 1) {
            this.editor.selectionClip = true;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = ctx.createPattern(this.img, "repeat");
            ctx.fillRect(x1, y1, w, h);
        } else {
            this.editor.selectionClip = false;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    animate() {
        if (!this.editor.selectionClip) return;

        this.animPoint++;
        if (this.animPoint >= 6) {
            this.animPoint = 0;
        }
        let ctx = this.editor.getSelectionContext();
        ctx.fillStyle = ctx.createPattern(this.img, "repeat");
        ctx.translate(this.animPoint, 0);
        ctx.globalCompositeOperation = "source-in";
        ctx.fillRect(-16, -16, ctx.canvas.width + 32, ctx.canvas.height + 32);
        ctx.globalCompositeOperation = "source-over";
        ctx.resetTransform();
    }
}