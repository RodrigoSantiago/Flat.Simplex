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

    onUnselected() {
        let config = this.getConfig();
        this.opacity = config.flow;
        super.onUnselected();
    }

    generateBrushImage(canvas, size, hardness, color) {
        let ctx = canvas.getContext("2d");
        this.resetContext(ctx);
        ctx.clearRect(0, 0, 100, 100);

        const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grd.addColorStop(Math.min(0.99, hardness * 0.75), color);
        grd.addColorStop(1, color.substring(0, 7) + "00");

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
        let config = this.getConfig();
        let size = Math.min(30, config.size);
        let hardness = config.hardness;
        let flow = 0.85;
        let opacity = config.flow;
        let color = "#000000" + Math.round(255 * (opacity * 0.5 + 0.25)).toString(16);
        let dist = -1;

        let tempCtx = this.getSrcCanvas();
        this.resetContext(tempCtx.getContext("2d"));
        this.generateBrushImage(tempCtx, size, hardness, color);

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        let off = size / 2 + 1;
        let d = 80 - off * 2;
        for (let i = 0; i < 0.99; i += 0.1) {
            dist = SpriteToolBrush.drawBrushLineCustom(
                {x: i * d + off, y: this.apply(i) * d + off},
                {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off},
                dist,
                Math.max(1, ((1 - flow) * 0.9 + 0.1) * size),
                (x, y) => ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size)
            );
        }

        for (let i = 0; i < 5; i++) {
            ctx.drawImage(tempCtx, 0, 0, size, size, Math.round((d + off) - size / 2), Math.round((d + off) - size / 2), size, size);
        }
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);

        let config = this.getConfig();
        this.flow = 0.85;
        this.opacity = config.flow;
        let hex = color.length === 9 ? color : color + "FF";
        let a = parseInt(hex.slice(7, 9), 16);
        this.color = hex.substring(0, 7) + Math.round(a * (this.opacity * 0.5 + 0.25)).toString(16);
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
        let px = Math.round(x - this.size / 2);
        let py = Math.round(y - this.size / 2);

        this.ctx.drawImage(this.brushCanvas, 0, 0, this.size, this.size, px, py, this.size, this.size);

        this.ctx.globalCompositeOperation = "lighter";
        this.ctx.fillStyle = "#00000001";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2 - 2, this.size / 2 - 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-atop";

        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.fillStyle = this.color.substring(0, 7) + "FF";
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, this.size / 2, this.size / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = "source-over";

        this.clip();

        if (this.interval !== null) {
            clearTimeout(this.interval);
        }

        this.interval = setTimeout((e) => this.drawBrush(this.prevPos.x, this.prevPos.y), 50);
    }
}