import {SpriteTool} from "./SpriteTool.js";

export class SpriteToolBucket extends SpriteTool {

    static painted = null;
    
    imageData = null;
    temp = {r: 0, g : 0, b : 0};

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.jqLine = $("<div class='sprite-grab-line'><div class='grab-in'><div class='grab-radius'></div></div><div class='grab-out'></div></div>");
        this.jqLineRadius = this.jqLine.find(".grab-radius");
    }

    updateCanvasCursor(pos) {
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        this.editor.canvasCursor.css("display", "none");
    }

    start(color, alpha, ctx, ctxTemp) {
        super.start(color, alpha, ctx, ctxTemp);
        this.colorR = parseInt(color.substring(1, 3), 16);
        this.colorG = parseInt(color.substring(3, 5), 16);
        this.colorB = parseInt(color.substring(5, 7), 16);
        this.colorA = alpha;
        this.ctx = ctx;
        this.ctxTemp = ctxTemp;
        this.tolerance = this.configMenu.tolerance;
        this.contiguous = this.configMenu.contiguous;
        this.blendAlpha = this.configMenu.blendAlpha;
        this.useGradient = this.configMenu.useGradient;
        this.radial = this.configMenu.radial;
        this.palette = this.configMenu.palette;
        this.gradient = this.configMenu.getGradient();
        this.clipping = this.editor.selectionClip;
        this.tolerance2 = this.tolerance * this.tolerance;
        this.toleranceA2 = this.tolerance === 0 ? 0 : this.tolerance * 1.5;
    }

    end() {
        super.end();
        this.jqLine.detach();

        this.imageA = null;
        this.imageB = null;
        this.imageC = null;
        this.imageData = null;
        this.imageDataB = null;
        this.imageData = null;
        this.imageDataC = null;
    }

    mouseDown(pos) {
        this.initPos = pos;
        this.editor.canvasView.append(this.jqLine);

        if (this.useGradient) {
            let w = this.ctx.canvas.width;
            let h = this.ctx.canvas.height;
            let offset = this.editor.canvasPos.offset();
            offset.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
            offset.top += (this.initPos.y - h / 2) * this.editor.zoomStep;
            this.jqLine.css({width : "2px", transform :""});
            this.jqLine.offset(offset);
            if (this.radial) {
                this.jqLineRadius.css({width : 0, height : 0, display : "flex"});
            } else {
                this.jqLineRadius.css({display : "none"});
            }
        }
    }

    mouseMove(pos) {
        super.mouseMove(pos);

        if (this.useGradient) {
            let w = this.ctx.canvas.width;
            let h = this.ctx.canvas.height;

            let currentOff = this.editor.canvasPos.offset();
            currentOff.left += (this.initPos.x - w / 2) * this.editor.zoomStep;
            currentOff.top += (this.initPos.y - h / 2) * this.editor.zoomStep;
            this.jqLine.css({width: "2px", transform: ""});
            this.jqLine.offset(currentOff);

            let offset = this.editor.canvasPos.offset();
            offset.left += (pos.x - w / 2) * this.editor.zoomStep;
            offset.top += (pos.y - h / 2) * this.editor.zoomStep;

            let dist = Math.sqrt((offset.left - currentOff.left) * (offset.left - currentOff.left) +
                (offset.top - currentOff.top) * (offset.top - currentOff.top));
            let angle = Math.atan2(offset.top - currentOff.top, -(currentOff.left - offset.left));

            this.jqLine.css({width: dist, transform: "rotate(" + angle + "rad)"});
            if (this.radial) {
                this.jqLineRadius.css({width: dist * 2, height: dist * 2});
            }
        }
    }

    mouseUp(pos) {
        let w = this.ctx.canvas.width;
        let h = this.ctx.canvas.height;
        this.endPos = pos;
        if (this.contiguous && (this.initPos.x < 0 || this.initPos.x >= w || this.initPos.y < 0 || this.initPos.y >= h)) {
            return;
        }

        if (this.contiguous) {
            let len = this.ctx.canvas.width * this.ctx.canvas.height;
            if (!SpriteToolBucket.painted || SpriteToolBucket.painted.length < len) {
                SpriteToolBucket.painted = new Array(len);
            } else {
                for (let i = 0; i < len; i++) {
                    SpriteToolBucket.painted[i] = false;
                }
            }
        }

        this.imageA = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.imageData = this.imageA.data;

        let p = this.initPos.x * 4 + (this.initPos.y * this.ctx.canvas.width * 4);
        this.pointR = this.imageData[p];
        this.pointG = this.imageData[p + 1];
        this.pointB = this.imageData[p + 2];
        this.pointA = this.imageData[p + 3];

        if (this.useGradient) {
            let radius = Math.sqrt((this.initPos.x - this.endPos.x) * (this.initPos.x - this.endPos.x) +
                (this.initPos.y - this.endPos.y) * (this.initPos.y - this.endPos.y));

            let grd;
            if (this.radial) {
                grd = this.ctxTemp.createRadialGradient(this.initPos.x, this.initPos.y, 0, this.initPos.x, this.initPos.y, radius);
            } else {
                grd = this.ctx.createLinearGradient(this.initPos.x, this.initPos.y, this.endPos.x, this.endPos.y,);
            }
            for (let node of this.gradient) {
                grd.addColorStop(node.pos, node.col);
            }

            this.ctxTemp.clearRect(0, 0, this.ctxTemp.canvas.width, this.ctxTemp.canvas.height);
            this.ctxTemp.fillStyle = grd;
            this.ctxTemp.fillRect(0, 0, this.ctxTemp.canvas.width, this.ctxTemp.canvas.height);

            this.imageB = this.ctxTemp.getImageData(0, 0, this.ctxTemp.canvas.width, this.ctxTemp.canvas.height);
            this.imageDataB = this.imageB.data;
            this.ctxTemp.clearRect(0, 0, this.ctxTemp.canvas.width, this.ctxTemp.canvas.height);
        }
        if (this.contiguous) {
            this.contiguousFill(this.initPos);
        } else {
            this.fill();
        }
        this.ctx.putImageData(this.imageA, 0, 0);

        this.editor.toolEnd();
    }

    fill() {
        let w = this.ctx.canvas.width;
        let h = this.ctx.canvas.height;
        let wh = w * h * 4;
        for (let i = 0; i < wh; i+= 4) {
            let r = this.imageData[i];
            let g = this.imageData[i + 1];
            let b = this.imageData[i + 2];
            let a = this.imageData[i + 3];
            if (this.isTolerable(r, g, b, a)) {
                this.setColor(i);
            }
        }
    }

    contiguousFill(pos) {
        let w = this.ctx.canvas.width;
        let h = this.ctx.canvas.height;
        let dots = [pos];
        while (dots.length > 0) {
            let dot = dots.pop();
            let p = dot.x * 4 + (dot.y * w * 4);
            let r = this.imageData[p];
            let g = this.imageData[p + 1];
            let b = this.imageData[p + 2];
            let a = this.imageData[p + 3];
            if (this.isTolerable(r, g, b, a)) {
                this.setColor(p);
                SpriteToolBucket.painted[dot.x + dot.y * w] = true;
                if (dot.x + 1 < w && !SpriteToolBucket.painted[dot.x + 1 + dot.y * w]) {
                    dots.push({x: dot.x + 1, y: dot.y});
                }
                if (dot.x - 1 >= 0 && !SpriteToolBucket.painted[dot.x - 1 + dot.y * w]) {
                    dots.push({x: dot.x - 1, y: dot.y});
                }
                if (dot.y + 1 < h && !SpriteToolBucket.painted[dot.x + (dot.y + 1) * w]) {
                    dots.push({x: dot.x, y: dot.y + 1});
                }
                if (dot.y - 1 >= 0 && !SpriteToolBucket.painted[dot.x + (dot.y - 1) * w]) {
                    dots.push({x: dot.x, y: dot.y - 1});
                }
            }
        }
    }

    setColor(p) {
        if (this.clipping) {
            if (!this.imageC) {
                this.imageC = this.editor.canvasC[0].getContext("2d").getImageData(0, 0, this.ctxTemp.canvas.width, this.ctxTemp.canvas.height);
                this.imageDataC = this.imageC.data;
            }
            if (this.imageDataC[p] === 0) {
                return;
            }
        }

        if (this.useGradient) {
            if (this.palette) {
                this.temp.r = this.imageDataB[p];
                this.temp.g = this.imageDataB[p + 1];
                this.temp.b = this.imageDataB[p + 2];

                let col = this.editor.colorMenu.getPaletteBestColor(this.temp);
                this.imageData[p] = col.r;
                this.imageData[p + 1] = col.g;
                this.imageData[p + 2] = col.b;
                if (!this.blendAlpha) {
                    this.imageData[p + 3] = 255;
                }

            } else {
                this.imageData[p] = this.imageDataB[p];
                this.imageData[p + 1] = this.imageDataB[p + 1];
                this.imageData[p + 2] = this.imageDataB[p + 2];
                if (!this.blendAlpha) {
                    this.imageData[p + 3] = this.imageDataB[p + 3];
                }
            }
        } else {
            this.imageData[p] = this.colorR;
            this.imageData[p + 1] = this.colorG;
            this.imageData[p + 2] = this.colorB;
            if (!this.blendAlpha) {
                this.imageData[p + 3] = this.colorA;
            }
        }
    }

    isTolerable(r, g, b, a) {
        let dist = (
            (r - this.pointR) * (r - this.pointR) +
            (g - this.pointG) * (g - this.pointG) +
            (b - this.pointB) * (b - this.pointB)
        );
        if (dist <= this.tolerance2) {
            return this.blendAlpha || Math.abs(a - this.pointA) <= this.toleranceA2;
        }
        return false;
    }
}