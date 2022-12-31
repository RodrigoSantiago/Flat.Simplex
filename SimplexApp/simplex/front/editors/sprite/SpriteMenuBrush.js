import {SpriteMenu} from "./SpriteMenu.js";

export class SpriteMenuBrush extends SpriteMenu {

    brushSize = 5;
    brushHardness = 80;
    brushSpacing = 10;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        const self = this;
        this.jqSize = jqDragView.find(".brush-size");
        this.jqHardness = jqDragView.find(".brush-hardness");
        this.jqSpacing = jqDragView.find(".brush-spacing");
        this.jqSizeText = jqDragView.find(".brush-text-size");
        this.jqHardnessText = jqDragView.find(".brush-text-hardness");
        this.jqSpacingText = jqDragView.find(".brush-text-spacing");
        this.setSize(this.brushSize);
        this.jqSize[0].addEventListener('input', (e) => {
            self.size(self.jqSize[0].value);
        });
        this.setHardness(this.brushHardness);
        this.jqHardness[0].addEventListener('input', (e) => {
            self.hardness(self.jqHardness[0].value);
        });
        this.setSpacing(this.brushSpacing);
        this.jqSpacing[0].addEventListener('input', (e) => {
            self.spacing(self.jqSpacing[0].value);
        });
    }

    size(value) {
        this.brushSize = value;
        this.jqSizeText.text(value);
    }

    setSize(value) {
        this.brushSize = value;
        this.jqSize[0].value = value;
        this.jqSizeText.text(value);
    }

    hardness(value) {
        this.brushHardness = value;
        this.jqHardnessText.text(value);
    }

    setHardness(value) {
        this.brushHardness = value;
        this.jqHardness[0].value = value;
        this.jqHardnessText.text(value);
    }

    spacing(value) {
        this.brushSpacing = value;
        this.jqSpacingText.text(value);
    }

    setSpacing(value) {
        this.brushSpacing = value;
        this.jqSpacing[0].value = value;
        this.jqSpacingText.text(value);
    }

    getBrushConfig() {
        return {
            size: Math.round(this.brushSize),
            hardness: this.brushHardness / 100,
            spacing: 0.10 + (0.9 * this.brushSpacing / 100),
            image: null,
            replace: false
        }
    }
}