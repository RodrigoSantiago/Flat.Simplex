import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolPencil extends SpriteToolBrush {

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.pixelMode = true;
        this.size = 1;
        this.flow = 1.00;
        this.hardness = 1.00;
    }

    onSelected() {
        this.brushData = {};
        this.editor.brushMenu.setSize(this.size);
        this.editor.brushMenu.setSizeEnabled(true);
        this.editor.brushMenu.setFlow(this.flow);
        this.editor.brushMenu.setFlowEnabled(false);
        this.editor.brushMenu.setHardness(this.hardness);
        this.editor.brushMenu.setHardnessEnabled(false);
        this.editor.brushMenu.setOptionMode("Replace", false);
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.ctx = ctx;
        this.ctx.filter = "url(#stroke-alpha-1)";

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        this.updateBrushCanvas();

        if (this.size < 20) {
            let pSize = this.size === 1 ? 30 : 60 / this.size;
            let off = 10 + Math.round((60 - pSize * this.size) / 2);

            let before = Math.ceil(15 / pSize);
            let init = off - before * pSize;
            for (let x = 0; x < this.size + before * 2; x++) {
                for (let y = 0; y < this.size + before * 2; y++) {
                    ctx.fillStyle = x % 2 === y % 2 ? "#FFFFFF" : "#EEEEEE";
                    ctx.beginPath();
                    ctx.rect(init + x * pSize, init + y * pSize, pSize, pSize);
                    ctx.fill();
                }
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, off, off, pSize * this.size, pSize * this.size);
        } else {
            ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, 10, 10, 60, 60);
        }
    }

    start(color, ctx, ctxTemp) {
        super.start(color, ctx, ctxTemp);
        this.ctx.filter = "url(#stroke-alpha-1)";
    }
}