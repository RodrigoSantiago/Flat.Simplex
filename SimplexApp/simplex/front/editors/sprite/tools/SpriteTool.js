export class SpriteTool {

    // Context
    ctx = null;
    ctxFinal = null;
    min = {};
    max = {};

    pixelMode = false;
    selected = false;

    configMenu = null;

    constructor(editor, jqButton, configMenu) {
        this.editor = editor;
        this.configMenu = configMenu;
        this.jqButton = jqButton;
        this.jqButton.on("click", (e) => this.editor.selectTool(this));
        this.jqButton.on("dblclick", (e) => {
            this.editor.selectTool(this);
            configMenu.show();
        });
    }

    _createCanvas() {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        return canvas;
    }

    getBrushCanvas() {
        if (!SpriteTool.brushCanvas) {
            SpriteTool.brushCanvas = this._createCanvas();
        }
        return SpriteTool.brushCanvas;
    }

    getSrcCanvas() {
        if (!SpriteTool.srcCanvas) {
            SpriteTool.srcCanvas = this._createCanvas();
        }
        return SpriteTool.srcCanvas;
    }

    getDstCanvas() {
        if (!SpriteTool.dstCanvas) {
            SpriteTool.dstCanvas = this._createCanvas();
        }
        return SpriteTool.dstCanvas;
    }

    getTmpCanvas() {
        if (!SpriteTool.tmpCanvas) {
            SpriteTool.tmpCanvas = this._createCanvas();
        }
        return SpriteTool.tmpCanvas;
    }

    setSelected(selected) {
        if (selected) {
            this.jqButton.addClass("selected");
            if (!this.selected) {
                this.selected = true;
                this.onSelected();
            }
        } else {
            this.jqButton.removeClass("selected");
            this.selected = false;
        }
    }

    onSelected() {

    }

    updatePreview(ctx) {

    }

    updateCanvasCursor(pos) {
        if (this.pixelMode) {
            this.cursorAsPixel(pos);
        } else {
            this.cursorAsCircle(pos);
        }
    }

    cursorAsCircle(pos) {
        this.editor.canvasCursor.removeClass("pencil");
        this.editor.canvasCursor.css({display : "", left: pos.x, top: pos.y});
        this._path = null;

        let config = this.editor.getBrushConfig();
        if (config.size * this.editor.zoomStep < 8) {
            this.editor.canvasCursor.css({width: 0, height: 0});
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        } else {
            this.editor.canvasCursor.css({
                width: config.size * this.editor.zoomStep,
                height: config.size * this.editor.zoomStep
            });
            if (config.size * this.editor.zoomStep > 600) {
                this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            } else {
                this.editor.canvasView.css("cursor", "none");
            }
        }
    }

    cursorAsPixel(pos) {
        let config = this.editor.getBrushConfig();
        let force = !this._path;
        let svg = this.editor.canvasCursor.find("svg");
        let path = this.editor.canvasCursor.find("path");

        if (this._prevSize !== config.size || force) {
            this._prevSize = config.size;
            this._path = this.generatePixelPath(config.size)
            path.attr("d", this._path);
        }

        if (this._prevZoom !== this.editor.zoomStep || force) {
            this._prevZoom = this.editor.zoomStep;

            path.attr("transform", "scale(" + this.editor.zoomStep + ")");
            path.attr("stroke-width", 1 / this.editor.zoomStep);
        }

        let ss = Math.round((config.size) * this.editor.zoomStep + 1);
        if (this._prevViewBox !== ss || force) {
            this._prevViewBox = ss;
            svg.attr("viewBox", "-1 -1 " + (ss + 1) + " " + (ss + 1));
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

    start(color, alpha, ctx, ctxTemp) {

    }

    end() {
        if (this.ctx) {
            this.resetContext(this.ctx);
        }

        if (this.ctxFinal) {
            this.resetContext(this.ctxFinal);
        }
    }

    resetContext(ctx) {
        ctx.resetTransform();
        ctx.filter = "none";
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.imageSmoothingEnabled = true;
    }

    mouseDown(pos) {

    }

    mouseMove(pos) {

    }

    mouseUp(pos) {

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