import {SpriteLayer} from "./SpriteLayer.js";

export class SpriteFrame {

    /** @{SpriteLayer[]} */ layers = [];

    /**
     * Create an sprite frame with the given layers, or a frame with a single empty layer
     *
     * @param layers {SpriteLayer | SpriteLayer[]} Initial layers for the frame
     */
    constructor(layers) {
        if (layers instanceof SpriteLayer) {
            this.layers.push(layers);
        } else if (layers instanceof Array) {
            this.layers = layers;
        } else {
            this.layers.push(new SpriteLayer(SpriteLayer.emptySpriteData, false));
        }
    }

    /**
     * Make a copy of this object. Layers are a copy too
     *
     * @returns {SpriteFrame} A copy of this object
     */
    clone() {
        let layers = [];
        for (let layer of this.layers) {
            layers.push(layer.clone());
        }
        return new SpriteFrame(layers);
    }
}