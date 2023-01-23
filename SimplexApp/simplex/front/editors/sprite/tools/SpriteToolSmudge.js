import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolSmudge extends SpriteToolBrush {

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.size = 16;
        this.flow = 0.85;
        this.opacity = 0.60;
        this.hardness = 0.50;
    }

    generateBrushImage(canvas, size, hardness, color) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grd.addColorStop(Math.min(0.99, hardness * 0.85), color);
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

    onUnselected() {
        let config = this.getConfig();
        this.opacity = config.flow;
        super.onUnselected();
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let size = Math.min(30, config.size);
        let opacity = config.flow;
        let hardness = config.hardness;
        let color = "#000000" + Math.round(((1 - opacity) * 0.5 + 0.25) * 255).toString(16);

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                ctx.fillStyle = x % 2 === y % 2 ? "#FFFFFF" : "#BBBBBB";
                ctx.beginPath();
                ctx.rect(x * 10, y * 10, 10, 10);
                ctx.fill();
            }
        }

        let src = this.getSrcCanvas().getContext("2d");
        let dst = this.getDstCanvas().getContext("2d");
        let tmp = this.getTmpCanvas().getContext("2d");

        let tempCtx = this.getExtCanvas();
        this.resetContext(tempCtx.getContext("2d"));

        let lastP = {p : null};
        let off = size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 1; i += 0.1) {
            this.resetContext(src);
            this.resetContext(dst);
            this.resetContext(tmp);
            this.generateBrushImage(tempCtx, size, hardness, color);
            SpriteToolBrush.drawPixelLineCustom(
                {x: i * d + off,         y: this.apply(i) * d + off},
                {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off},
                (x, y) => lastP.p = this.drawSmudge(lastP.p, ctx, tempCtx, x, y, size, src, dst, tmp, false)
            );
        }

    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);
        let config = this.getConfig();
        this.size = config.size;
        this.flow = 0.85;
        this.opacity = config.flow;
        this.hardness = config.hardness;
        this.color = "#000000" + Math.round(((1 - this.opacity) * 0.5 + 0.25) * 255).toString(16);
        this.dist = 0;
        this.clipping = this.editor.selectionClip;

        this.ctx = ctx;
        this.ctxFinal = null;
        this.lastP = null;
        this.updateBrushCanvas();
    }

    drawBrush(x, y) {
        let src = this.getSrcCanvas().getContext("2d");
        let dst = this.getDstCanvas().getContext("2d");
        let tmp = this.getTmpCanvas().getContext("2d");
        this.resetContext(src);
        this.resetContext(dst);
        this.resetContext(tmp);
        this.lastP = this.drawSmudge(this.lastP, this.ctx, this.brushCanvas, x, y, this.size, src, dst, tmp, this.clipping);
    }

    drawSmudge(lastP, ctx, brushCanvas, x, y, size, src, dst, tmp, clipping) {
        x = Math.round(x);
        y = Math.round(y);
        if (!lastP) {
            return {x, y};
        }
        let x1 = x - Math.ceil(size / 2);
        let y1 = y - Math.ceil(size / 2);
        let x2 = x + Math.ceil(size / 2);
        let y2 = y + Math.ceil(size / 2);

        let px1 = lastP.x - Math.ceil(size / 2);
        let py1 = lastP.y - Math.ceil(size / 2);

        let w = x2 - x1;
        let h = y2 - y1;

        // Mixing Alpha

        // Create a black-white from old position
        src.globalCompositeOperation = "source-over";
        src.clearRect(0, 0, w, h);
        src.filter = "url(#alpha-to-color)";
        src.drawImage(ctx.canvas, px1, py1, w, h, 0, 0, w, h);
        src.filter = "none";

        // Create an alpha brush, reasing the oposite of the brush shape
        src.globalCompositeOperation = "destination-out";
        src.drawImage(brushCanvas, 0, 0, w, h, 0, 0, w, h);

        // Create a black-white from new position
        dst.globalCompositeOperation = "source-over";
        dst.clearRect(0, 0, w, h);
        dst.filter = "url(#alpha-to-color)";
        dst.drawImage(ctx.canvas, x1, y1, w, h, 0, 0, w, h);
        dst.filter = "none";
        // Draw the alpha brush
        dst.drawImage(src.canvas, 0, 0, w, h, 0, 0, w, h);

        // Transform back black-white into alpha
        src.globalCompositeOperation = "source-over";
        src.clearRect(0, 0, w, h);
        src.filter = "url(#color-to-alpha)";
        src.drawImage(dst.canvas, 0, 0, w, h, 0, 0, w, h);
        src.filter = "none";

        // SRC is now the correct Alpha

        // Draw the old position
        dst.globalCompositeOperation = "copy";
        dst.drawImage(ctx.canvas, px1, py1, w, h, 0, 0, w, h);

        // Create a color brush, reasing the oposite of the brush shape
        dst.globalCompositeOperation = "destination-out";
        dst.drawImage(brushCanvas, 0, 0, w, h, 0, 0, w, h);

        // Draw the new position as background
        dst.globalCompositeOperation = "destination-over";
        dst.drawImage(ctx.canvas, x1, y1, w, h, 0, 0, w, h);

        tmp.globalCompositeOperation = "source-over";
        tmp.clearRect(0, 0, w, h);
        tmp.filter = "url(#alpha-to-opaque)";
        tmp.drawImage(dst.canvas, 0, 0, w, h, 0, 0, w, h);
        tmp.filter = "none";

        src.globalCompositeOperation = "source-atop";
        src.drawImage(tmp.canvas, 0, 0, w, h, 0, 0, w, h);

        if (!clipping) {
            ctx.clearRect(x1, y1, w, h);
            ctx.drawImage(src.canvas, 0, 0, w, h, x1, y1, w, h);
        } else {
            src.globalCompositeOperation = "destination-in";
            src.drawImage(this.editor.getSelectionContext().canvas, x1, y1, w, h, 0, 0, w, h);
            ctx.globalCompositeOperation = "destination-out";
            ctx.drawImage(this.editor.getSelectionContext().canvas, x1, y1, w, h, x1, y1, w, h);
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(src.canvas, 0, 0, w, h, x1, y1, w, h);
        }

        return {x, y};
    }

    clip() {

    }

    drawBrushLine(pointA, pointB) {
        SpriteToolBrush.drawPixelLineCustom(pointA, pointB, (x, y) => this.drawBrush(x, y));
    }
}