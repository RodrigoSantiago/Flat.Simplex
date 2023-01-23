import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolPencil extends SpriteToolBrush {

    replace = false;

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
        this.editor.brushMenu.setOptionMode("Replace", this.replace);
    }

    onUnselected() {
        this.replace = this.getConfig().option;
        super.onUnselected();
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let size = config.size;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);
        ctx.filter = "url(#stroke-alpha-1)";

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        let tempCtx = this.getSrcCanvas();
        this.resetContext(tempCtx.getContext("2d"));
        this.generatePixelImage(tempCtx, size, "#000000");

        if (size < 20) {
            let pSize = size === 1 ? 30 : 60 / size;
            let off = 10 + Math.round((60 - pSize * size) / 2);

            let before = Math.ceil(15 / pSize);
            let init = off - before * pSize;
            for (let x = 0; x < size + before * 2; x++) {
                for (let y = 0; y < size + before * 2; y++) {
                    ctx.fillStyle = x % 2 === y % 2 ? "#FFFFFF" : "#EEEEEE";
                    ctx.beginPath();
                    ctx.rect(init + x * pSize, init + y * pSize, pSize, pSize);
                    ctx.fill();
                }
            }

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCtx, 0, 0, size, size, off, off, pSize * size, pSize * size);
        } else {
            ctx.drawImage(tempCtx, 0, 0, size, size, 10, 10, 60, 60);
        }
    }

    start(color, alpha, ctx, ctxTemp) {
        super.start(color, alpha, ctx, ctxTemp);

        this.replace = this.getConfig().option;
        this.ctx.filter = "url(#stroke-alpha-1)";
    }
}