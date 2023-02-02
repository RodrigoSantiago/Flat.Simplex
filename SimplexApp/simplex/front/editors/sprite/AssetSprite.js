import {Asset, AssetType} from "../../assets/Asset.js";
import {SpriteFrame} from "./SpriteFrame.js";
import {SpriteLayer} from "./SpriteLayer.js";

export class AssetSprite extends Asset {

    /** @type{number} */ width;
    /** @type{number} */ height;
    /** @type{SpriteFrame[]} */ frames = [];

    constructor(name, width, height) {
        super(name, AssetType.sprite);
        this.width = width;
        this.height = height;
        this.frames.push(new SpriteFrame([
            new SpriteLayer("data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", true)
        ]));
    }
}