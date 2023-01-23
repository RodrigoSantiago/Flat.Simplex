import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolEraser extends SpriteToolBrush {

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
    }

    updateCanvasCursor(pos) {
        if (this.getConfig().hardness >= 0.99) {
            this.cursorAsPixel(pos);
        } else {
            this.cursorAsCircle(pos);
        }
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let size = Math.min(30, config.size);
        let flow = config.flow;
        let hardness = config.hardness;
        let pixelMode = hardness >= 0.99;

        let tempCtx = this.getSrcCanvas();
        this.resetContext(tempCtx.getContext("2d"));
        if (pixelMode) {
            this.generatePixelImage(tempCtx, size, "#000000FF");
        } else {
            this.generateBrushImage(tempCtx, size, hardness, "#000000FF");
        }

        if (pixelMode) {
            let pSize = size === 1 ? 30 : 60 / size;
            let off = 10 + Math.round((60 - pSize * size) / 2);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 80, 80);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCtx, 0, 0, size, size, off, off - 1, pSize * size, pSize * size);
            ctx.drawImage(tempCtx, 0, 0, size, size, off - 1, off, pSize * size, pSize * size);
            ctx.drawImage(tempCtx, 0, 0, size, size, off, off + 1, pSize * size, pSize * size);
            ctx.drawImage(tempCtx, 0, 0, size, size, off + 1, off, pSize * size, pSize * size);

            ctx.globalCompositeOperation = "destination-out";
            ctx.drawImage(tempCtx, 0, 0, size, size, off, off, pSize * size, pSize * size);

        } else {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 80, 80);

            ctx.globalCompositeOperation = "destination-out";

            let dist = -1;
            let off = size / 2 + 1;
            let d = 80 - off * 2;
            for (let i = 0; i < 1; i += 0.1) {
                dist = SpriteToolBrush.drawBrushLineCustom(
                    {x: i * d + off, y: this.apply(i) * d + off},
                    {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off},
                    dist,
                    Math.max(1, ((1 - flow) * 0.9 + 0.1) * size),
                    (x, y) => ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size)
                );
            }
        }
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);

        let config = this.getConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.dist = 0;
        this.clipping = this.editor.selectionClip;

        this.ctx = ctx;
        this.ctxFinal = null;
        this.ctx.globalCompositeOperation = "destination-out";
        this.pixelMode = this.hardness >= 0.99;
        this.resetContext(this.getTmpCanvas().getContext("2d"));
        this.updateBrushCanvas();
    }

    drawBrush(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        if (this.clipping) {
            let tmp = this.getTmpCanvas().getContext("2d");
            tmp.clearRect(0, 0, this.size, this.size);
            tmp.drawImage(this.brushCanvas, 0, 0, this.size, this.size, 0, 0, this.size, this.size);
            tmp.globalCompositeOperation = "destination-in";
            tmp.drawImage(this.editor.getSelectionContext().canvas, px, py, this.size, this.size, 0, 0, this.size, this.size);
            tmp.globalCompositeOperation = "source-over";

            this.ctx.drawImage(tmp.canvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
        } else {
            this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);
        }
    }

    clip() {

    }
}