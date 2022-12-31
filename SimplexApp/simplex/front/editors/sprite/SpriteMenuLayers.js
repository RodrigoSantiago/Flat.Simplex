import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteLayer} from "./SpriteLayer.js";

export class SpriteMenuLayers extends SpriteMenu {
    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        const self = this;

        this.jqContainer = jqDragView.find(".layers-container");
        this.jqAddBtn = jqDragView.find(".layer-add-button");

        this.jqAddBtn.click(function (e) {
            self.editor.layerAdd();
        });
    }

    layerAdd(image, pasteIndex) {
        let layer = new SpriteLayer(this.editor, image);

        if (image) {
            this.editor.layers.splice(pasteIndex + 1, 0, layer);
            this.editor.layers[pasteIndex].jqLayerBtn.after(layer.jqLayerBtn);
        } else {
            this.editor.layers.push(layer);
            this.jqContainer.append(layer.jqLayerBtn);
        }
        this.editor.canvasScl.append(layer.jqImg);
        this.resetZIndex();
        this.layerSelect(layer);
    }

    layerRemove(layer) {
        let index = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(index, 1);

        if (this.editor.layers.length === 0) {
            this.editor.layerAdd();
        }

        if (this.editor.selectedLayer === layer) {
            this.layerSelect(this.editor.layers[Math.max(0, index - 1)]);
        }
        layer.jqLayerBtn.remove();
        layer.jqImg.remove();
        this.resetZIndex();
    }

    layerMove(layerA, layerB) {
        let indexA = this.editor.layers.indexOf(layerA);
        this.editor.splice(indexA, 1);
        let indexB = this.editor.layers.indexOf(layerB);
        this.editor.splice(indexB, 0, layerA);

        layerA.jqLayerBtn.detach();
        layerB.jqLayerBtn.before(layerA.jqLayerBtn);

        this.layerSelect(layerA);
        this.resetZIndex();
    }

    layerSelect(layer) {
        if (this.editor.selectedLayer !== null) {
            this.editor.selectedLayer.jqLayerBtn.removeClass("selected");
        }
        this.editor.selectedLayer = layer;
        this.editor.selectedLayer.jqLayerBtn.addClass("selected");
    }

    resetZIndex() {
        for (let i = 0; i < this.editor.layers.length; i++) {
            this.editor.layers[i].jqImg.css("z-index", (this.editor.layers.length - i) + 1);
            this.editor.layers[i].zindex = (this.editor.layers.length - i) + 1;
        }
    }

    resetApearence(layersBefore, layersAfter) {
        if (layersBefore !== null) {
            for (let i = 0; i < layersBefore.length; i++) {
                layersBefore[i].jqLayerBtn.detach();
                layersBefore[i].jqImg.detach();
            }
        }
        for (let i = 0; i < layersAfter.length; i++) {
            this.jqContainer.append(layersAfter[i].jqLayerBtn);
            this.editor.canvasScl.append(layersAfter[i].jqImg);
        }
    }
}