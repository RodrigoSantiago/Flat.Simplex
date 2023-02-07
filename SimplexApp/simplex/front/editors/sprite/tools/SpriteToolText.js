import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolText extends SpriteTool {

    /** @type{{x, y}} */ initPos = {x:0, y:0};
    /** @type{{x, y}} */ endPos = {x:0, y:0};

    writeState = false;

    constructor(editor, jqButton, configMenu)  {
        super(editor, jqButton, configMenu);
    }

    updateCanvasCursor(pos) {
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        this.editor.canvasCursor.css("display", "none");
    }

    onUnselected() {
        if (this.writeState) {
            this.drawTextBox();
            this.editor.tsBox.close();
        }
        super.onUnselected();
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);
        let config = this.getConfig();
        this.size = config.size;
        this.font = config.font.name;
        this.bold = config.bold;
        this.italic = config.italic;
        this.color = (color.length === 9 ? color : color + "FF");
        this.alpha = alpha;
        this.dist = -1;
        this.clipping = this.editor.selectionClip;

        this.ctx = ctxTemp;
        this.ctxFinal = ctx;
    }

    mouseDown(pos) {
        if (this.editor.tsBox.isOpen) {
            this.drawTextBox();
            this.editor.tsBox.close();
        }

        this.initPos = pos;
    }

    mouseMove(pos) {
        this.endPos = pos;
        let x1 = Math.min(this.initPos.x, this.endPos.x);
        let y1 = Math.min(this.initPos.y, this.endPos.y);
        let w = Math.abs(this.initPos.x - this.endPos.x);
        let h = Math.abs(this.initPos.y - this.endPos.y);

        if (w > 8 && h > 8 && !this.editor.tsBox.isOpen) {
            this.editor.tsBox.openText(pos, x1, y1, w, h, this.size, this.font, this.bold, this.italic);
            this.editor.tsBox.pivot = 9;
        }
    }

    mouseUp(pos) {
        if (!this.editor.tsBox.isOpen) {
            this.editor.toolEnd();
        }
    }
    drawTextBox() {
        if (!this.editor.tsBox.textEdited) return;

        let x1 = this.editor.tsBox.rx1 + 8;
        let x2 = this.editor.tsBox.rx2 - 8;
        let y1 = this.editor.tsBox.ry1 + 8;
        let y2 = this.editor.tsBox.ry2 - 8;
        let w = (x2 - x1);
        let h = (y2 - y1);
        let w2 = (x2 - x1) / 2;
        let h2 = (y2 - y1) / 2;

        this.ctx.font = (this.bold ? "bold " : "") + (this.italic ? "italic " : "") + this.size + "px " + this.font;
        this.ctx.textBaseline = "bottom";

        this.editor.tsBox.update();
        let lines = this.editor.tsBox.getLines();

        this.ctx.clearRect(0, 0, this.imgWidth(), this.imgHeight());
        if (this.editor.tsBox.rAngle === 0) {
            let yPos = y1;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                yPos = y1 + line.height;
                this.ctx.fillText(line.text, x1, yPos);
            }

            let p = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.fillRect(x1, y1, w, h);
            this.ctx.globalCompositeOperation = p;
        } else {

            this.ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
            this.ctx.rotate(this.editor.tsBox.rAngle);
            let yPos = -h2;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                yPos = y1 + line.height;
                this.ctx.fillText(line.text, -w2, yPos);
            }

            let p = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.fillRect(-w2, -h2, w, h);
            this.ctx.globalCompositeOperation = p;

            this.ctx.resetTransform();
        }

        this.clip();
        if (this.ctxFinal) {
            this.ctxFinal.globalAlpha = this.alpha / 255;
            this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
            this.ctxFinal.globalAlpha = 1;
            this.ctxFinal = null;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
    }

    clip() {
        if (this.clipping) {
            let p = this.ctx.globalCompositeOperation;
            this.ctx.globalCompositeOperation = "destination-in";
            this.ctx.drawImage(this.editor.getSelectionContext().canvas, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.globalCompositeOperation = p;
        }
    }
}