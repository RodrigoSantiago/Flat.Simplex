export class SpriteTool {

    // Context
    ctx = null;
    ctxFinal = null;
    min = {};
    max = {};
    selected = false;

    // Brush
    size = 1;
    color = "#000000";
    alpha = 1;
    pixelMode = false;
    configMenu = null;
    drawing = false;

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

    imgWidth() {
        return this.editor.imageWidth;
    }

    imgHeight() {
        return this.editor.imageHeight;
    }

    _createCanvas(canvas, width, height) {
        width = width ? width : 100;
        height = height ? height : 100;
        if (canvas && canvas.width === width && canvas.height === height) {
            return canvas;
        } else {
            canvas = canvas ? canvas : document.createElement('canvas');
            canvas.width = width ? width : 100;
            canvas.height = height ? height : 100;
        }
        return canvas;
    }

    getBrushCanvas(width, height) {
        return SpriteTool.brushCanvas = this._createCanvas(SpriteTool.brushCanvas, width, height);
    }

    getSrcCanvas(width, height) {
        return SpriteTool.srcCanvas = this._createCanvas(SpriteTool.srcCanvas, width, height);
    }

    getDstCanvas(width, height) {
        return SpriteTool.dstCanvas = this._createCanvas(SpriteTool.dstCanvas, width, height);
    }

    getTmpCanvas(width, height) {
        return SpriteTool.tmpCanvas = this._createCanvas(SpriteTool.tmpCanvas, width, height);
    }

    getExtCanvas(width, height) {
        return SpriteTool.extCanvas = this._createCanvas(SpriteTool.extCanvas, width, height);
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
            if (this.selected) {
                this.selected = false;
                this.onUnselected();
            }
        }
    }

    getConfig() {
        return this.configMenu.getConfig();
    }

    onSelected() {

    }

    onUnselected() {
        if (this.drawing) {
            this.end();
        }
    }

    updateCanvasCursor(pos) {
        if (this.pixelMode) {
            this.cursorAsPixel(pos);
        } else {
            this.cursorAsCircle(pos);
        }
    }

    resetBoundingChanges(pos, offset) {
        this.min.x = pos.x - offset;
        this.min.y = pos.y - offset;
        this.max.x = pos.x + offset;
        this.max.y = pos.y + offset;
    }

    updateBoundingChanges(pos, offset) {
        this.min.x = Math.min(this.min.x, pos.x - offset);
        this.min.y = Math.min(this.min.y, pos.y - offset);
        this.max.x = Math.max(this.max.x, pos.x + offset);
        this.max.y = Math.max(this.max.y, pos.y + offset);
    }

    cursorAsCircle(pos) {
        let size = this.drawing ? this.size : this.getConfig().size;
        this.editor.canvasCursor.removeClass("pencil");
        this.editor.canvasCursor.css({display : "", left: pos.x, top: pos.y});
        SpriteTool._path = null;

        if (size * this.editor.zoomStep < 8) {
            this.editor.canvasCursor.css({width: 0, height: 0});
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
        } else {
            this.editor.canvasCursor.css({
                width: size * this.editor.zoomStep,
                height: size * this.editor.zoomStep
            });
            if (size * this.editor.zoomStep > 600 || size * this.editor.zoomStep <= 2) {
                this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            } else {
                this.editor.canvasView.css("cursor", "none");
            }
        }
    }

    cursorAsPixel(pos) {
        let size = this.drawing ? this.size : this.getConfig().size;
        let force = !SpriteTool._path;
        let svg = this.editor.canvasCursor.find("svg");
        let path = this.editor.canvasCursor.find("path");

        if (SpriteTool._prevSize !== size || force) {
            SpriteTool._prevSize = size;
            SpriteTool._path = this.generatePixelPath(size)
            path.attr("d", SpriteTool._path);
        }

        if (SpriteTool._prevZoom !== this.editor.zoomStep || force) {
            SpriteTool._prevZoom = this.editor.zoomStep;

            path.attr("transform", "scale(" + this.editor.zoomStep + ")");
            path.attr("stroke-width", 1 / this.editor.zoomStep);
        }

        let ss = Math.round((size) * this.editor.zoomStep + 1);
        if (SpriteTool._prevViewBox !== ss || force) {
            SpriteTool._prevViewBox = ss;
            svg.attr("viewBox", "-1 -1 " + (ss + 1) + " " + (ss + 1));
        }

        let pixelX = Math.floor((pos.x - this.editor.zoomPos.x) / this.editor.zoomStep);
        let pixelY = Math.floor((pos.y - this.editor.zoomPos.y) / this.editor.zoomStep);
        let posX = (pixelX + (size % 2 === 0 ? 0 : 0.5)) * this.editor.zoomStep + this.editor.zoomPos.x;
        let posY = (pixelY + (size % 2 === 0 ? 0 : 0.5)) * this.editor.zoomStep + this.editor.zoomPos.y;

        this.editor.canvasCursor.addClass("pencil");
        this.editor.canvasCursor.css({
            width: size * this.editor.zoomStep,
            height: size * this.editor.zoomStep,
            left: posX,
            top: posY
        });

        if (size * this.editor.zoomStep < 8) {
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            this.editor.canvasCursor.css("display", "none");
        } else if (size * this.editor.zoomStep > 600 || size <= 1) {
            this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
            this.editor.canvasCursor.css("display", "");
        } else {
            this.editor.canvasView.css("cursor", "none");
            this.editor.canvasCursor.css("display", "");
        }
    }

    updatePreview(ctx) {

    }

    isDrawing() {
        return this.drawing;
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        this.drawing = true;
    }

    end() {
        if (this.drawing) {
            if (this.ctx) {
                this.resetContext(this.ctx);
            }

            if (this.ctxFinal) {
                this.resetContext(this.ctxFinal);
            }

            this.drawing = false;
        }
    }

    resetContext(ctx) {
        ctx.resetTransform();
        ctx.filter = "none";
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }

    mouseDown(pos) {

    }

    mouseMove(pos) {

    }

    mouseUp(pos) {
        this.editor.toolEnd();
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