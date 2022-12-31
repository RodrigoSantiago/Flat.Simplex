import {SpriteTool} from "./SpriteTool.js";
import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolPencil extends SpriteToolBrush {

    ctx = null;
    min = {};
    max = {};
    color = "#000000";
    size = 5;
    prevPos = {};

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    configureContext(color) {
        super.configureContext(color);
        this.ctx.resetTransform();
        this.spacing = 0.99;
    }

    generateBrushImage() {
        if (SpriteToolPencil.brushCanvas === null) {
            SpriteToolPencil.brushCanvas = document.createElement('canvas');
            SpriteToolPencil.brushCanvas.width = 100;
            SpriteToolPencil.brushCanvas.height = 100;
            SpriteToolPencil.brushCanvas.setup = {size : 0, color : ""};
        }
        this.brushCanvas = SpriteToolPencil.brushCanvas;

        if (this.brushCanvas.setup.size !== this.size ||
            this.brushCanvas.setup.color !== this.color) {
            this.brushCanvas.setup.size = this.size;
            this.brushCanvas.setup.color = this.color;

            let ctx = SpriteToolPencil.brushCanvas.getContext("2d");

            ctx.clearRect(0, 0, 100, 100);
            ctx.fillStyle = this.color + "FF";
            let offset = this.size / 2 - 0.5;
            let r2 = this.size === 3 ? 1.2 : (this.size / 2 + 0.1) * (this.size / 2 + 0.1);
            for (let x = 0; x < this.size; x++) {
                for (let y = 0; y < this.size; y++) {
                    let dist = (x - offset) * (x - offset) + (y - offset) * (y - offset);
                    if (dist < r2) {
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }

    updateCanvasCursor(pos) {
        let config = this.editor.getBrushConfig();

        let svg = this.editor.canvasCursor.find("svg");
        let path = this.editor.canvasCursor.find("path");

        if (this._prevSize !== config.size) {
            this._prevSize = config.size;
            path.attr("d", this.generatePixelPath(config.size));
        }

        if (this._prevZoom !== this.editor.zoomStep) {
            this._prevZoom = this.editor.zoomStep;

            path.attr("transform", "scale(" + this.editor.zoomStep + ")");
            path.attr("stroke-width", 1 / this.editor.zoomStep);
        }

        let ss = Math.round((config.size) * this.editor.zoomStep + 1);
        if (this._prevViewBox !== ss) {
            this._prevViewBox = ss;
            svg.attr("viewBox", "-1 -1 " + (ss+1) + " " + (ss+1));
        }

        let pixelX = Math.floor((pos.x - this.editor.zoomPos.x) / this.editor.zoomStep);
        let pixelY = Math.floor((pos.y - this.editor.zoomPos.y) / this.editor.zoomStep);
        let posX = (pixelX + (config.size % 2 === 0 ? 0 : 0.5)) * this.editor.zoomStep + this.editor.zoomPos.x;
        let posY = (pixelY + (config.size % 2 === 0 ? 0 : 0.5)) * this.editor.zoomStep + this.editor.zoomPos.y;

        this.editor.canvasCursor.addClass("pencil");
        this.editor.canvasCursor.css({
            width: config.size * this.editor.zoomStep,
            height: config.size * this.editor.zoomStep,
            left: posX,
            top: posY
        });

        if (config.size * this.editor.zoomStep < 8) {
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            this.editor.canvasCursor.css("display", "none");
        } else if (config.size * this.editor.zoomStep > 600) {
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            this.editor.canvasCursor.css("display", "");
        } else {
            this.editor.canvasView.css("cursor", "none");
            this.editor.canvasCursor.css("display", "");
        }
    }

    drawBrush(x, y) {
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        this.ctx.drawImage(this.brushCanvas,
            0, 0, this.size, this.size,
            px, py,
            this.size, this.size);
    }

    drawBrushLine(pointA, pointB) {
        let x0 = pointA.x, y0 = pointA.y;
        let x1 = pointB.x, y1 = pointB.y;
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while(true) {
            this.drawBrush(x0, y0);

            if ((x0 === x1) && (y0 === y1)) break;
            let e2 = 2*err;
            if (e2 > -dy) { err -= dy; x0  += sx; }
            if (e2 < dx) { err += dx; y0  += sy; }
        }
    }

    generatePixelPath(size) {
        if (size <= 1) return "M0 0 L0 1 L 1 1 L 1 0 L 0 0";

        let path = "";
        let offset = size / 2 - 0.5;
        let r2 = size === 3 ? 1.2 : (size / 2 + 0.1) * (size / 2 + 0.1);

        for (let y = -1; y <= size; y++) {
            for (let x = -1; x <= size; x++) {
                let dist = (x - offset) * (x - offset) + (y - offset) * (y - offset);

                let nextX = ((x + 1) - offset) * ((x + 1) - offset) + (y - offset) * (y - offset);
                if ((dist > r2) !== (nextX > r2)) {
                    path += `M ${x + 1} ${y} L ${x + 1} ${y + 1}`;
                }
                let nextY = (x - offset) * (x - offset) + ((y + 1) - offset) * ((y + 1) - offset);
                if ((dist > r2) !== (nextY > r2)) {
                    path += `M ${x} ${y + 1} L ${x + 1} ${y + 1}`;
                }
            }
        }
        return path;
    }
}