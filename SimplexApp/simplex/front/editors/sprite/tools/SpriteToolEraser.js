import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolEraser extends SpriteToolBrush {

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(30, config.size);
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.ctx = ctx;
        this.pixelMode = this.hardness >= 0.99;
        this.clipping = false;


        this.updateBrushCanvas();
        this.dist = Math.max(1, ((1 - this.flow) * 0.9 + 0.1) * this.size);

        if (this.pixelMode) {
            let pSize = this.size === 1 ? 30 : 60 / this.size;
            let off = 10 + Math.round((60 - pSize * this.size) / 2);

            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 80, 80);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off, off - 1, pSize * this.size, pSize * this.size);
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off - 1, off, pSize * this.size, pSize * this.size);
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off, off + 1, pSize * this.size, pSize * this.size);
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off + 1, off, pSize * this.size, pSize * this.size);

            ctx.globalCompositeOperation = "destination-out";
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off, off, pSize * this.size, pSize * this.size);

        } else {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 80, 80);

            ctx.globalCompositeOperation = "destination-out";
            let off = this.size / 2 + 1;
            let d = 80 - off * 2;
            for (let i = 0; i < 1; i += 0.1) {
                this.drawBrushLine(
                    {x: i * d + off, y: this.apply(i) * d + off},
                    {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off});
            }
        }
        this.size = config.size;
    }


    start(color, alpha, ctx, ctxTemp) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.dist = 0;
        this.clipping = true;

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