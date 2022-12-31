import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBrush extends SpriteTool {

    static brushCanvas = null;

    ctx = null;
    min = {};
    max = {};
    size = 30;
    spacing = 0.25;
    hardness = 1.0;
    color = "#000000";

    dist = 0;

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    configureContext(color) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.spacing = config.spacing;
        this.hardness = config.hardness;
        this.color = color;
        this.dist = 0;

        this.ctx = this.editor.getCanvas();
        this.ctx.translate(0.5, 0.5);
        this.ctx.filter = "none";

        this.generateBrushImage();
    }

    generateBrushImage() {
        if (SpriteToolBrush.brushCanvas === null) {
            SpriteToolBrush.brushCanvas = document.createElement('canvas');
            SpriteToolBrush.brushCanvas.width = 100;
            SpriteToolBrush.brushCanvas.height = 100;
            SpriteToolBrush.brushCanvas.setup = {size : 0, hardness : 0, color : ""};
        }
        this.brushCanvas = SpriteToolBrush.brushCanvas;

        if (this.brushCanvas.setup.size !== this.size ||
            this.brushCanvas.setup.hardness !== this.hardness ||
            this.brushCanvas.setup.color !== this.color) {
            this.brushCanvas.setup.size = this.size;
            this.brushCanvas.setup.hardness = this.hardness;
            this.brushCanvas.setup.color = this.color;

            let ctx = this.brushCanvas.getContext("2d");

            ctx.clearRect(0, 0, 100, 100);
            if (this.hardness >= 0.99) {
                ctx.fillStyle = this.color + "FF";
                ctx.ellipse(this.size / 2, this.size / 2, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
                grd.addColorStop(this.hardness, this.color + "FF");
                grd.addColorStop(1, this.color + "00");
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 100, 100);
            }
        }
    }

    resetContext() {
        this.ctx.resetTransform();
    }

    updateCanvasCursor(pos) {
        this.editor.canvasCursor.removeClass("pencil");
        this.editor.canvasCursor.css({left: pos.x, top: pos.y});
        let config = this.editor.getBrushConfig();
        if (config.size * this.editor.zoomStep < 16) {
            this.editor.canvasCursor.css({width:0, height : 0});
            this.editor.canvasView.css("cursor", "crosshair");
        } else {
            this.editor.canvasCursor.css({
                width: config.size * this.editor.zoomStep,
                height: config.size * this.editor.zoomStep
            });
            if (config.size * this.editor.zoomStep > 600) {
                this.editor.canvasView.css("cursor", "crosshair");
            } else {
                this.editor.canvasView.css("cursor", "none");
            }
        }
    }

    mouseDown(pos, color) {
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};
        this.configureContext(color);

        this.drawBrush(pos.x, pos.y);
        this.prevPos = pos;
    }

    mouseMove(pos) {
        this.min.x = Math.min(this.min.x, pos.x - this.size);
        this.min.x = Math.min(this.min.y, pos.y - this.size);
        this.max.x = Math.max(this.max.x, pos.x + this.size);
        this.max.y = Math.max(this.max.y, pos.y + this.size);


        this.drawBrushLine(this.prevPos, pos);
        this.prevPos = pos;
    }

    mouseUp(pos) {
        this.resetContext();
    }

    drawBrush(x, y) {
        this.ctx.drawImage(this.brushCanvas,
            0, 0, this.size, this.size,
            x - this.size / 2, y - this.size / 2,
            this.size, this.size);
    }

    drawBrushLine(pointA, pointB) {
        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        if (d <= 0.001) {
            this.dist += d;
            return;
        }

        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = this.spacing * this.size;
        let pD = 0;
        while (d > spc - this.dist) {
            pD += (spc - this.dist);
            d -= (spc - this.dist);
            this.drawBrush(n.x * pD + pointA.x, n.y * pD + pointA.y);
            this.dist = 0;
        }
        this.dist += d;
    }
}