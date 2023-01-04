import {SpriteMenu} from "./SpriteMenu.js";

export class SpriteMenuBrush extends SpriteMenu {

    brushSize = 50;
    brushHardness = 80;
    brushSpacing = 10;

    interval = null;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);

        this.jqPreview = jqDragView.find(".brush-preview");
        this.jqPreviewCanvas = $("<canvas width=80px height=80px></canvas>");
        this.jqPreview.append(this.jqPreviewCanvas);

        this.jqSize = jqDragView.find(".brush-size");
        this.jqHardness = jqDragView.find(".brush-hardness");
        this.jqSpacing = jqDragView.find(".brush-spacing");
        this.jqSizeText = jqDragView.find(".brush-text-size");
        this.jqHardnessText = jqDragView.find(".brush-text-hardness");
        this.jqSpacingText = jqDragView.find(".brush-text-spacing");
        this.setSize(30);
        this.jqSize[0].addEventListener('input', (e) => {
            this.size(this.jqSize[0].value);
            this.delayUpdatePreview();
        });
        this.setHardness(25);
        this.jqHardness[0].addEventListener('input', (e) => {
            this.hardness(this.jqHardness[0].value);
            this.delayUpdatePreview();
        });
        this.setSpacing(10);
        this.jqSpacing[0].addEventListener('input', (e) => {
            this.spacing(this.jqSpacing[0].value);
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
        this.editor.selectedTool.updatePreview(this.jqPreviewCanvas[0].getContext("2d"));
    }

    size(value) {
        this.brushSize = Math.ceil(value <= 50 ? value / 50 * 20 : (value - 50) / 50 * 80 + 20);
        this.jqSizeText.text(this.brushSize);
    }

    hardness(value) {
        this.brushHardness = value;
        this.jqHardnessText.text(this.brushHardness);
    }

    spacing(value) {
        this.brushSpacing = value;
        this.jqSpacingText.text(this.brushSpacing);
    }

    setSize(value) {
        this.brushSize = value;
        this.jqSize[0].value = value <= 20 ? value / 20 * 50 : ((value - 20) / 80) * 50 + 50;
        this.jqSizeText.text(value);
    }

    setHardness(value) {
        this.brushHardness = value;
        this.jqHardness[0].value = value;
        this.jqHardnessText.text(value);
    }

    setSpacing(value) {
        this.brushSpacing = value;
        this.jqSpacing[0].value = value;
        this.jqSpacingText.text(value);
    }

    getBrushConfig() {
        return {
            size: this.brushSize,
            hardness: this.brushHardness / 100,
            spacing: 0.10 + (0.9 * this.brushSpacing / 100),
            image: null,
            replace: false
        }
    }
}