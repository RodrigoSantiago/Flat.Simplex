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
        this.size = this.editor.brushSize;
        this.spacing = this.editor.brushSpacing;
        this.hardness = this.editor.brushHardness;
        this.color = color;
        this.ctx.translate(0.5, 0.5);
        this.ctx.filter = "none";

        if (SpriteToolBrush.brushCanvas === null) {
            SpriteToolBrush.brushCanvas = document.createElement('canvas');
            SpriteToolBrush.brushCanvas.width = 100;
            SpriteToolBrush.brushCanvas.height = 100;
        }
        let ctx = SpriteToolBrush.brushCanvas.getContext("2d");

        ctx.clearRect(0, 0, 100, 100);
        if (this.hardness >= 0.99) {
            ctx.fillStyle = this.color + "FF";
            ctx.ellipse(this.size / 2, this.size / 2, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
            let soft = 1 - this.hardness;
            grd.addColorStop(this.hardness, this.color + "FF");
            grd.addColorStop(this.hardness + soft * 0.2, this.color + "F1");
            grd.addColorStop(this.hardness + soft * 0.4, this.color + "AF");
            grd.addColorStop(this.hardness + soft * 0.6, this.color + "51");
            grd.addColorStop(this.hardness + soft * 0.8, this.color + "0F");
            grd.addColorStop(1, this.color + "00");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 100, 100);
        }
        this.dist = 0;
    }

    resetContext() {
        this.ctx.translate(-0.5, -0.5);
    }

    updateCanvasCursor(pos) {
        this.editor.canvasCursor.css({
            width : this.editor.brushSize * this.editor.zoomStep,
            height : this.editor.brushSize * this.editor.zoomStep
        });
        this.editor.canvasView.css("cursor", "none");
    }

    mouseDown(pos, color) {
        if (this.ctx === null) {
            this.ctx = this.editor.getCanvas().getContext("2d");
        }
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};
        this.configureContext(color);

        this.drawBrush(pos);
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

    drawBrush(point) {
        this.ctx.drawImage(SpriteToolBrush.brushCanvas,
            0, 0, this.size, this.size,
            point.x - this.size / 2, point.y - this.size / 2,
            this.size, this.size);
    }

    drawBrushLine(pointA, pointB) {
        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        if (d <= 0.001) {
            this.dist += d;
            return;
        }

        let temp = {x: 0, y: 0};
        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = this.spacing * this.size;
        let pD = 0;
        while (d > spc - this.dist) {
            pD += (spc - this.dist);
            d -= (spc - this.dist);
            temp.x = n.x * pD + pointA.x;
            temp.y = n.y * pD + pointA.y;
            this.drawBrush(temp);
            this.dist = 0;
        }
        this.dist += d;
    }
}