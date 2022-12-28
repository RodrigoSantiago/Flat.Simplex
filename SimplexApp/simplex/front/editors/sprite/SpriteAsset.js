import {Asset, AssetType} from "../../assets/Asset.js";

export class SpriteAsset extends Asset {

    constructor(name, width, height, mode) {
        super(name, AssetType.sprite);

    }

}