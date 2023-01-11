import {SpriteMenu} from "./SpriteMenu.js";

export class SpriteMenuBrush extends SpriteMenu {

    brushSize = 50;
    brushHardness = 80;
    brushFlow = 10;
    option = false;
    selectionMode = 1;

    interval = null;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);

        this.jqPreview = jqDragView.find(".brush-preview");
        this.jqPreviewCanvas = $("<canvas width=80px height=80px></canvas>");
        this.jqPreview.append(this.jqPreviewCanvas);

        this.jqSize = jqDragView.find(".brush-size");
        this.jqHardness = jqDragView.find(".brush-hardness");
        this.jqFlow = jqDragView.find(".brush-flow");
        this.jqSizeText = jqDragView.find(".brush-text-size");
        this.jqHardnessText = jqDragView.find(".brush-text-hardness");
        this.jqFlowText = jqDragView.find(".brush-text-flow");
        this.jqImage = jqDragView.find(".brush-image");
        this.jqOptions = jqDragView.find(".brush-options");
        this.jqOptions.on("input", (e) => this.setOptionMode(null, this.jqOptions[0].checked));

        this.jqMode = jqDragView.find(".brush-mode");
        this.jqMode.find(".mode-1").on("click", (e) => this.setSelectionMode(1));
        this.jqMode.find(".mode-2").on("click", (e) => this.setSelectionMode(2));
        this.jqMode.find(".mode-3").on("click", (e) => this.setSelectionMode(3));
        jqDragView.find(".close-view i").click((e) => {
            this.hide();
        });

        this.setSize(30);
        this.jqSize[0].addEventListener('input', (e) => {
            this.size(this.jqSize[0].value);
            this.delayUpdatePreview();
        });
        this.setHardness(0.25);
        this.jqHardness[0].addEventListener('input', (e) => {
            this.hardness(this.jqHardness[0].value);
            this.delayUpdatePreview();
        });
        this.setFlow(0.10);
        this.jqFlow[0].addEventListener('input', (e) => {
            this.flow(this.jqFlow[0].value);
            this.delayUpdatePreview();
        });
    }

    delayUpdatePreview() {
        if (this.interval === null) {
            this.updatePreview();
            this.interval = setTimeout((e) => {
                this.updatePreview();
                this.interval = null;
            }, 50);
        }
    }

    updatePreview() {
        let ctx = this.jqPreviewCanvas[0].getContext("2d");
        this.editor.selectedTool.updatePreview(ctx);
        ctx.resetTransform();
        ctx.filter = "none";
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.imageSmoothingEnabled = true;

        let left = this.editor.canvasCursor.css("left");
        let top = this.editor.canvasCursor.css("top");
        this.editor.updateCanvasCursor({x: left, y: top});
    }

    setOptionMode(text, selected) {
        this.option = selected;
        this.jqOptions[0].checked = selected;
        this.jqImage.css("display", "none");
        this.jqOptions.css("display", "");
        this.jqMode.css("display", "none");
        this.delayUpdatePreview();
    }

    setImageMode() {
        this.jqImage.css("display", "");
        this.jqOptions.css("display", "none");
        this.jqMode.css("display", "none");
        this.delayUpdatePreview();
    }

    setSelectionMode(mode) {
        this.selectionMode = mode;
        this.jqImage.css("display", "none");
        this.jqOptions.css("display", "none");
        this.jqMode.css("display", "");
        this.jqMode.find(".mode-1").removeClass("selected");
        this.jqMode.find(".mode-2").removeClass("selected");
        this.jqMode.find(".mode-3").removeClass("selected");
        this.jqMode.find(".mode-" + mode).addClass("selected");
        this.delayUpdatePreview();
    }

    size(value) {
        this.brushSize = Math.ceil(value <= 50 ? value / 50 * 20 : (value - 50) / 50 * 80 + 20);
        this.jqSizeText.val(this.brushSize);
    }

    hardness(value) {
        this.brushHardness = value;
        this.jqHardnessText.val(this.brushHardness);
    }

    flow(value) {
        this.brushFlow = value;
        this.jqFlowText.val(this.brushFlow);
    }

    setSize(value) {
        value = Math.max(1, Math.min(100, value));
        this.brushSize = value;
        this.jqSize[0].value = value <= 20 ? value / 20 * 50 : ((value - 20) / 80) * 50 + 50;
        this.jqSizeText.val(value);
    }

    setHardness(value) {
        value = Math.max(1, Math.min(100, value * 100));
        this.brushHardness = value;
        this.jqHardness[0].value = value;
        this.jqHardnessText.val(value);
    }

    setFlow(value) {
        value = Math.max(1, Math.min(100, value * 100));
        this.brushFlow = value;
        this.jqFlow[0].value = value;
        this.jqFlowText.val(value);
    }

    setSizeEnabled(enabled) {
        if (enabled) {
            this.jqSize.removeClass("disabled");
            this.jqSize[0].disabled = false;
        } else {
            this.jqSize.addClass("disabled");
            this.jqSize[0].disabled = true;
        }
    }

    setHardnessEnabled(enabled) {
        if (enabled) {
            this.jqHardness.removeClass("disabled");
            this.jqHardness[0].disabled = false;
        } else {
            this.jqHardness.addClass("disabled");
            this.jqHardness[0].disabled = true;
        }
    }

    setFlowEnabled(enabled) {
        if (enabled) {
            this.jqFlow.removeClass("disabled");
            this.jqFlow[0].disabled = false;
        } else {
            this.jqFlow.addClass("disabled");
            this.jqFlow[0].disabled = true;
        }
    }

    getBrushConfig() {
        return {
            size: this.brushSize,
            hardness: this.brushHardness / 100,
            flow: this.brushFlow / 100,
            image: null,
            option: this.option,
            selectionMode : this.selectionMode

        }
    }
}