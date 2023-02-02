import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteLayerView} from "./SpriteLayerView.js";
import {SpriteFrameView} from "./SpriteFrameView.js";
import {SpriteFrame} from "../SpriteFrame.js";
import {SpriteLayer} from "../SpriteLayer.js";

export class SpriteMenuLayers extends SpriteMenu {

    /** @type{SpriteLayerView[]} */ layers = [];
    /** @type{SpriteLayerView} */ selectedLayer = null;
    /** @type{JQuery} */ jqContainer;
    /** @type{JQuery} */ jqAddBtn;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        this.jqContainer = jqDragView.find(".layers-container");
        this.jqAddBtn = jqDragView.find(".layer-add-button");

        this.jqAddBtn.click((e) => this.editor.layerAdd());
    }

    /**
     * Reset all layers
     *
     * @param layers {SpriteLayer[]}
     */
    layerReplaceAll(layers) {
        this.selectedLayer = null;

        for (let i = 0; i < this.layers.length && i < layers.length; i++) {
            this.layers[i].setLayer(layers[i]);
            this.layers[i].update();
        }

        for (let i = this.layers.length; i < layers.length; i++) {
            let view = new SpriteLayerView(this.editor, layers[i]);
            this.layers.push(view);
            this.jqContainer.append(view.jqLayerBtn);
            this.editor.canvasScl.append(view.jqImg);
        }

        for (let i = layers.length; i < this.layers.length; i++) {
            this.layers[i].jqLayerBtn.remove();
            this.layers[i].jqImg.remove();
        }

        this.resetZIndex();
    }

    /**
     * Add a visual item for the given layer
     *
     * @param sprLayer {SpriteLayer}
     * @param index {number} Optional position index
     * @returns {SpriteLayerView} The created button
     */
    layerAdd(sprLayer, index) {
        let layer = new SpriteLayerView(this.editor, sprLayer);

        if (index === undefined) {
            this.layers.push(layer);
            this.jqContainer.append(layer.jqLayerBtn);
        } else {
            this.layers.splice(index + 1, 0, layer);
            this.layers[index].jqLayerBtn.after(layer.jqLayerBtn);
        }
        this.editor.canvasScl.append(layer.jqImg);
        this.resetZIndex();

        return layer;
    }

    /**
     * Remove the given layer or button
     *
     * @param layer {SpriteLayerView | SpriteLayer}
     */
    layerRemove(layer) {
        let index = this.indexOf(layer);
        this.layers[index].jqLayerBtn.remove();
        this.layers[index].jqImg.remove();
        this.layers.splice(index, 1);

        this.resetZIndex();
    }

    /**
     * Moves the layerA to be before layerB. If layerB is null moves to the last position
     *
     * @param layerA {SpriteLayerView | SpriteLayer}
     * @param layerB {SpriteLayerView | SpriteLayer}
     */
    layerMove(layerA, layerB) {
        let indexA = this.indexOf(layerA);
        this.layers.splice(indexA, 1);
        if (!layerB) {
            layerA.jqLayerBtn.detach();
            this.jqContainer.append(layerA.jqLayerBtn);
            this.layers.push(layerA);

        } else {
            let indexB = this.indexOf(layerB);
            this.layers.splice(indexB, 0, layerA);

            layerA.jqLayerBtn.detach();
            layerB.jqLayerBtn.before(layerA.jqLayerBtn);
        }

        this.resetZIndex();
    }

    /**
     * Stylize the selected layer
     *
     * @param layer {SpriteLayerView | SpriteLayer} Layer to be selected
     */
    layerSelect(layer) {
        if (this.selectedLayer !== null) {
            this.selectedLayer.jqLayerBtn.removeClass("selected");
        }
        this.selectedLayer = this.layers[this.indexOf(layer)];
        this.selectedLayer.jqLayerBtn.addClass("selected");
    }

    getLayer(layer) {
        return this.layers[this.indexOf(layer)]
    }

    resetZIndex() {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].zindex = ((this.layers.length - i) + 1) * 3;
            this.layers[i].jqImg.css("z-index", this.layers[i].zindex);
        }
    }

    indexOf(layer) {
        if (layer instanceof SpriteLayerView) {
            return  this.layers.indexOf(layer);

        } else if (layer instanceof SpriteLayer) {
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i].layer === layer) {
                    return i;
                }
            }

        }
        return -1;
    }
}