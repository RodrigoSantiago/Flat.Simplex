import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolEraser extends SpriteToolBrush {

    static brushCanvas = null;

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    updateBrushCanvas() {
        if (SpriteToolEraser.brushCanvas === null) {
            SpriteToolEraser.brushCanvas = document.createElement('canvas');
            SpriteToolEraser.brushCanvas.width = 100;
            SpriteToolEraser.brushCanvas.height = 100;
            SpriteToolEraser.brushCanvas.setup = {size : 0, hardness : 0, color : ""};
        }

        this.brushCanvas = SpriteToolEraser.brushCanvas;
        if (this.brushCanvas.setup.size !== this.size ||
            this.brushCanvas.setup.hardness !== this.hardness ||
            this.brushCanvas.setup.color !== this.color) {

            this.brushCanvas.setup.size = this.size;
            this.brushCanvas.setup.hardness = this.hardness;
            this.brushCanvas.setup.color = this.color
            if (this.hardness >= 0.99) {
                this.generatePixelImage(this.brushCanvas);
            } else {
                this.generateBrushImage(this.brushCanvas);
            }
        }
    }


    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(80, config.size);
        this.spacing = 1 - config.spacing;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.dist = this.size * this.spacing;
        this.ctx = ctx;
        this.ctx.filter = "none";

        ctx.fillStyle = "#FFFFFF";
        ctx.rect(0, 0, 80, 80);
        ctx.fill();
        this.ctx.globalCompositeOperation = "destination-out";
        this.updateBrushCanvas();
        this.drawBrush(40, 40);
        this.ctx.globalCompositeOperation = "source-over";
    }

    configureContext(color) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.spacing = 1 - config.spacing;
        this.hardness = config.hardness;
        this.color = "#000000FF";
        this.dist = 0;

        this.ctx = this.editor.getCanvas();
        this.ctx.filter = "none";
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.resetTransform();

        this.pixelMode = this.hardness >= 0.99;
        this.updateBrushCanvas();
    }

    resetContext() {
        super.resetContext();
        this.ctx.globalCompositeOperation = "source-over";
    }
}