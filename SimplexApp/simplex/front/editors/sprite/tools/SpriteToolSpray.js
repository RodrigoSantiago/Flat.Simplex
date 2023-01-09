import {SpriteToolBrush} from "./SpriteToolBrush.js";

export class SpriteToolSpray extends SpriteToolBrush {

    interval = null;

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.size = 25;
        this.flow = 0.85;
        this.opacity = 0.50;
        this.hardness = 0.50;
    }

    generateBrushImage(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(this.size / 2, this.size / 2, 0, this.size / 2, this.size / 2, this.size / 2);
        grd.addColorStop(Math.min(0.99, this.hardness * 0.75), this.color);
        grd.addColorStop(1, this.color.substring(0, 7) + "00");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 100, 100);
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
        this.size = Math.min(40, config.size);
        this.hardness = config.hardness;
        this.flow = 0.85;
        this.opacity = config.flow;
        this.color = "#000000" + Math.round(255 * (this.opacity * 0.5 + 0.25)).toString(16);
        this.dist = Math.min(Math.max(1, this.size / 2), 5);
        this.updateBrushCanvas();

        this.ctx = this.getTmpCanvas().getContext("2d");
        this.ctx.clearRect(0, 0, 100, 100);
        this.ctxFinal = ctx;

        let off = this.size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 1; i += 0.1) {
            this.drawBrushLine(
                {x: i * d + off        , y: this.apply(i) * d + off},
                {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off});
        }

        clearTimeout(this.interval);
        this.interval = null;

        for (let i = 0; i < 5; i++) {
            super.drawBrush(d + off, d + off);
        }

        this.ctxFinal.fillStyle = "#FFFFFF";
        this.ctxFinal.fillRect(0, 0, 80, 80);
        this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
        this.size = config.size;
    }

    start(color, alpha, ctx, ctxTemp) {
        let config = this.editor.getBrushConfig();
        this.size = config.size;
        this.hardness = config.hardness;
        this.opacity = config.flow;
        let hex = color.length === 9 ? color : color + "FF";
        let a = parseInt(hex.slice(7, 9), 16);
        this.color = hex.substring(0, 7) + Math.round(a * (this.opacity * 0.5 + 0.25)).toString(16);
        this.alpha = alpha;
        this.dist = 0;

        this.ctx = ctxTemp;
        this.ctxFinal = ctx;
        this.updateBrushCanvas();
    }

    end() {
        super.end();

        if (this.interval !== null) {
            clearTimeout(this.interval);
            this.interval = null;
        }
    }

    drawBrush(x, y) {
        super.drawBrush(x, y);
        this.ctx.globalCompositeOperation = "lighter";
        this.ctx.fillStyle = "#00000001";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2 - 2, this.size / 2 - 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.fillStyle = this.color.substring(0, 7) + "FF";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-over";


        if (this.interval !== null) {
            clearTimeout(this.interval);
        }

        this.interval = setTimeout((e) => this.drawBrush(this.prevPos.x, this.prevPos.y), 50);
    }
}