import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolSmudge extends SpriteToolBrush {

    static brushCanvas = null;

    constructor(editor, jqButton) {
        super(editor, jqButton);
    }

    updateBrushCanvas() {
        if (!SpriteToolSmudge.brushCanvas) {
            SpriteToolSmudge.brushCanvas = document.createElement('canvas');
            SpriteToolSmudge.brushCanvas.width = 100;
            SpriteToolSmudge.brushCanvas.height = 100;
            SpriteToolSmudge.brushCanvas.setup = {size : 0, color :"", hardness : 0};
            SpriteToolSmudge.brSrc = document.createElement('canvas');
            SpriteToolSmudge.brSrc.width = 100;
            SpriteToolSmudge.brSrc.height = 100;
            SpriteToolSmudge.brDst = document.createElement('canvas');
            SpriteToolSmudge.brDst.width = 100;
            SpriteToolSmudge.brDst.height = 100;
            SpriteToolSmudge.brTemp = document.createElement('canvas');
            SpriteToolSmudge.brTemp.width = 100;
            SpriteToolSmudge.brTemp.height = 100;
        }

        this.brushCanvas = SpriteToolSmudge.brushCanvas;
        this.brSrc = SpriteToolSmudge.brSrc;
        this.brDst = SpriteToolSmudge.brDst
        this.brTemp = SpriteToolSmudge.brTemp;
        if (this.brushCanvas.setup.size !== this.size ||
            this.brushCanvas.setup.hardness !== this.hardness ||
            this.brushCanvas.setup.color !== this.color) {

            this.brushCanvas.setup.size = this.size;
            this.brushCanvas.setup.hardness = this.hardness;
            this.brushCanvas.setup.color = this.color;

            this.generateBrushImage(this.brushCanvas);
        }
    }

    generateBrushImage(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
        grd.addColorStop(Math.min(0.99, this.hardness), this.color);
        grd.addColorStop(1, "#000000FF");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(30, config.size);
        this.spacing = 0.15;
        this.hardness = config.hardness * 0.85;
        this.color = "#000000" + Math.round(( (1 - config.spacing) / 2 + 0.25) * 255).toString(16);
        this.dist = Math.max(1, this.size / 10);
        this.updateBrushCanvas();

        this.ctx = ctx;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                ctx.fillStyle = x % 2 === y % 2 ? "#FFFFFF" : "#BBBBBB";
                ctx.beginPath();
                ctx.rect(x * 10, y * 10, 10, 10);
                ctx.fill();
            }
        }

        this.lastP = null;
        let off = this.size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 1; i += 0.1) {
            this.drawBrushLine({x: i * d + off, y: this.apply(i) * d + off}, {
                x: (i + 0.1) * d + off,
                y: this.apply(i + 0.1) * d + off
            });
        }

    }

    configureContext(color) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.spacing = 0.15;
        this.hardness = config.hardness * 0.85;
        this.color = "#000000" + Math.round(( (1 - config.spacing) / 2 + 0.25) * 255).toString(16);
        this.dist = 0;

        this.ctx = this.editor.getCanvas();
        this.lastP = null;
        this.updateBrushCanvas();
    }

    drawBrush(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        if (!this.lastP) {
            this.lastP = {x: x, y: y};
            return;
        }
        let x1 = x - Math.ceil(this.size / 2);
        let y1 = y - Math.ceil(this.size / 2);
        let x2 = x + Math.ceil(this.size / 2);
        let y2 = y + Math.ceil(this.size / 2);

        let px1 = this.lastP.x - Math.ceil(this.size / 2);
        let py1 = this.lastP.y - Math.ceil(this.size / 2);
        let px2 = this.lastP.x + Math.ceil(this.size / 2);
        let py2 = this.lastP.y + Math.ceil(this.size / 2);

        let w = x2 - x1;
        let h = y2 - y1;

        // Mixing Alpha

        // Create a black-white from old position
        let src = this.brSrc.getContext("2d");
        src.globalCompositeOperation = "source-over";
        src.clearRect(0, 0, w, h);
        src.filter = "url(#alpha-to-color)";
        src.drawImage(this.ctx.canvas, px1, py1, w, h, 0, 0, w, h);
        src.filter = "none";

        // Create an alpha brush, reasing the oposite of the brush shape
        src.globalCompositeOperation = "destination-out";
        src.drawImage(this.brushCanvas, 0, 0);

        // Create a black-white from new position
        let dst = this.brDst.getContext("2d");
        dst.globalCompositeOperation = "source-over";
        dst.clearRect(0, 0, w, h);
        dst.filter = "url(#alpha-to-color)";
        dst.drawImage(this.ctx.canvas, x1, y1, w, h, 0, 0, w, h);
        dst.filter = "none";
        // Draw the alpha brush
        dst.drawImage(src.canvas, 0, 0);

        // Transform back black-white into alpha
        src.globalCompositeOperation = "source-over";
        src.clearRect(0, 0, w, h);
        src.filter = "url(#color-to-alpha)";
        src.drawImage(dst.canvas, 0, 0);
        src.filter = "none";

        // SRC is now the correct Alpha

        // Draw the old position
        dst.globalCompositeOperation = "source-over";
        dst.clearRect(0, 0, w, h);
        dst.drawImage(this.ctx.canvas, px1, py1, w, h, 0, 0, w, h);

        // Create a color brush, reasing the oposite of the brush shape
        dst.globalCompositeOperation = "destination-out";
        dst.drawImage(this.brushCanvas, 0, 0);

        // Draw the new position as background
        dst.globalCompositeOperation = "destination-over";
        dst.drawImage(this.ctx.canvas, x1, y1, w, h, 0, 0, w, h);

        let tmp = this.brTemp.getContext("2d");
        tmp.globalCompositeOperation = "source-over";
        tmp.clearRect(0, 0, w, h);
        tmp.filter = "url(#alpha-to-opaque)";
        tmp.drawImage(dst.canvas, 0, 0);
        tmp.filter = "none";

        src.globalCompositeOperation = "source-atop";
        src.drawImage(tmp.canvas, 0, 0);

        this.ctx.clearRect(x1, y1, w, h);
        this.ctx.drawImage(src.canvas, 0, 0, w, h, x1, y1, w, h);

        this.lastP.x = x;
        this.lastP.y = y;
    }

    _toBlackWhite(ctx, w, h) {
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "#FFFFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#000000FF";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
    }

    drawBrushLine(pointA, pointB) {
        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        if (d <= 0.001) {
            this.dist += d;
            return;
        }

        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = Math.min(5, this.size < 10 ? 1 : this.size / 10);
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