import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBucket extends SpriteTool {

    imageData = null;
    painted = null;

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
    }

    updateCanvasCursor(pos) {
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        this.editor.canvasCursor.css("display", "none");
    }

    start(color, ctx, ctxTemp) {
        this.colorR = parseInt(color.substring(1, 3), 16);
        this.colorG = parseInt(color.substring(3, 5), 16);
        this.colorB = parseInt(color.substring(5, 7), 16);
        this.colorA = color.length < 9 ? 255 : parseInt(color.substring(5, 7), 16);
        this.ctx = ctx;
        this.imageA = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.imageData = this.imageA.data;
        this.painted = new Array(this.ctx.canvas.width * this.ctx.canvas.height);
    }

    end() {

    }

    mouseDown(pos) {
        let colorR = this.imageData[pos.x * 4 + (pos.y * this.ctx.canvas.width * 4)];
        let colorG = this.imageData[pos.x * 4 + (pos.y * this.ctx.canvas.width * 4) + 1];
        let colorB = this.imageData[pos.x * 4 + (pos.y * this.ctx.canvas.width * 4) + 2];
        let colorA = this.imageData[pos.x * 4 + (pos.y * this.ctx.canvas.width * 4) + 3];
        let dots = [pos];
        while (dots.length > 0) {
            let dot = dots.pop();
            let p = dot.x * 4 + (dot.y * this.ctx.canvas.width * 4);
            let r = this.imageData[p];
            let g = this.imageData[p + 1];
            let b = this.imageData[p + 2];
            let a = this.imageData[p + 3];
            let dist = Math.abs(r - colorR) + Math.abs(g - colorG) + Math.abs(b - colorB);// + Math.abs(a - colorA);
            if (dist <= 15) {
                this.imageData[p] = this.colorR;
                this.imageData[p + 1] = this.colorG;
                this.imageData[p + 2] = this.colorB;
                //this.imageData[p + 3] = this.colorA;
                this.painted[dot.x + dot.y * this.ctx.canvas.width] = true;
                if (dot.x + 1 < this.ctx.canvas.width && !this.painted[dot.x + 1 + dot.y * this.ctx.canvas.width]) {
                    dots.push({x: dot.x + 1, y: dot.y});
                }
                if (dot.x - 1 >= 0 && !this.painted[dot.x - 1 + dot.y * this.ctx.canvas.width]) {
                    dots.push({x: dot.x - 1, y: dot.y});
                }
                if (dot.y + 1 < this.ctx.canvas.height && !this.painted[dot.x + (dot.y + 1) * this.ctx.canvas.width]) {
                    dots.push({x: dot.x, y: dot.y + 1});
                }
                if (dot.y - 1 >= 0 && !this.painted[dot.x + (dot.y - 1) * this.ctx.canvas.width]) {
                    dots.push({x: dot.x, y: dot.y - 1});
                }
            }
        }
        this.ctx.putImageData(this.imageA, 0, 0);
    }
}