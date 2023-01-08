import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolSmudge extends SpriteToolBrush {

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.size = 16;
        this.flow = 0.85;
        this.opacity = 0.60;
        this.hardness = 0.50;
    }

    generateBrushImage(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
        grd.addColorStop(Math.min(0.99, this.hardness * 0.85), this.color);
        grd.addColorStop(1, "#000000FF");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
    }

    getBrushCanvas() {
        return super.getBrushCanvas();
    }

    onSelected() {
        this.brushData = {};
        this.editor.brushMenu.setSize(this.size);
        this.editor.brushMenu.setSizeEnabled(true);
        this.editor.brushMenu.setFlow(this.opacity);
        this.editor.brushMenu.setFlowEnabled(true);
        this.editor.brushMenu.setHardness(this.hardness);
        this.editor.brushMenu.setHardnessEnabled(true);
        this.editor.brushMenu.setImageMode();
    }

    updatePreview(ctx) {
        let config = this.editor.getBrushConfig();
        this.size = Math.min(30, config.size);
        this.flow = 0.85;
        this.opacity = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000" + Math.round(((1 - config.flow) * 0.5 + 0.25) * 255).toString(16);
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

    start(color, ctx, ctxTemp) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.flow = 0.85;
        this.opacity = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000" + Math.round(((1 - this.opacity) * 0.5 + 0.25) * 255).toString(16);
        this.dist = 0;
        this.resetContext(this.getSrcCanvas().getContext("2d"));
        this.resetContext(this.getDstCanvas().getContext("2d"));
        this.resetContext(this.getTmpCanvas().getContext("2d"));

        this.ctx = ctx;
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
        let src = this.getSrcCanvas().getContext("2d");
        src.globalCompositeOperation = "source-over";
        src.clearRect(0, 0, w, h);
        src.filter = "url(#alpha-to-color)";
        src.drawImage(this.ctx.canvas, px1, py1, w, h, 0, 0, w, h);
        src.filter = "none";

        // Create an alpha brush, reasing the oposite of the brush shape
        src.globalCompositeOperation = "destination-out";
        src.drawImage(this.brushCanvas, 0, 0);

        // Create a black-white from new position
        let dst = this.getDstCanvas().getContext("2d");
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

        let tmp = this.getTmpCanvas().getContext("2d");
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

    drawBrushLine(pointA, pointB) {
        let d = Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
        if (d <= 0.001) {
            this.dist += d;
            return;
        }

        let n = {x: (pointB.x - pointA.x) / d, y: (pointB.y - pointA.y) / d};
        let spc = Math.min(5, Math.max(1, 0.1 * this.size));
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