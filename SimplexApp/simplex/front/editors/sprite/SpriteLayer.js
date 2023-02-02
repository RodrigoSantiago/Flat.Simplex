export class SpriteLayer {

    static emptySpriteData = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

    /** @type{string} */ img;
    /** @type{boolean} */ visible;
    /** @type{HTMLImageElement} */ imgDom;

    /**
     * Base constructor
     *
     * @param img {string} Image source data as string
     * @param visible {boolean} If the layer is visible
     */
    constructor(img, visible) {
        this.img = img ? img : SpriteLayer.emptySpriteData;
        this.imgDom = new Image();
        this.imgDom.src = this.img;
        this.visible = !!visible;
    }

    setImage(imageURL) {
        this.img = imageURL;
        this.imgDom.src = this.img;
    }

    /**
     * Make a copy of this object.
     *
     * @returns {SpriteLayer} A copy of this object
     */
    clone() {
        return new SpriteLayer(this.img, this.visible);
    }
}