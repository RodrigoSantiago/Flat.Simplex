import {Dropdown, DropdownItem} from "../../../Dropdown.js";
import {CopySystem} from "../../../CopySystem.js";

/**
 * Represents a {SpriteLayer} visualy, with buttons and context
 */
export class SpriteLayerView {

    /** @type{SpriteLayer} */ layer;
    /** @type{JQuery} */ jqImg;
    /** @type{JQuery} */ jqLayerBtn;
    /** @type{JQuery} */ jqLayerBtnImg;
    /** @type{number} */ zindex = 0;

    /**
     * Base Constructor
     *
     * @param editor {SpriteEditor} Editor owner
     * @param layer {SpriteLayer} Initial layer
     */
    constructor(editor, layer) {
        this.editor = editor;
        this.jqImg = $("<img/>");
        this.jqLayerBtn = $(
            '<div class="layer">' +
            '   <div class="image">' +
            '       <div class="layer-hide"><i class="material-icons">visibility</i></div>' +
            '       <img class="layer-img">' +
            '   </div>' +
            '</div>');

        this.jqLayerBtn.click((e) => this.editor.selectLayer(this));
        this.jqLayerBtn.contextmenu((e) => this.onContextMenu(e));
        this.jqLayerBtnImg = this.jqLayerBtn.find(".layer-img");
        this.jqLayerHide = this.jqLayerBtn.find("i");
        this.layer = layer;
    }

    /**
     * The Layer to be represented
     * @param layer
     */
    setLayer(layer) {
        this.layer = layer;
        this.update();
    }

    /**
     * @returns {SpriteLayer}
     */
    getLayer() {
        return this.layer;
    }

    /**
     * The Layer visibility controls whether or not the layer will be shown on the main canvas
     * @param visible {boolean}
     */
    setVisibility(visible) {
        this.layer.visible = visible;
        if (visible) {
            this.jqLayerHide.text("visibility");
            this.jqImg.css("visibility", "visible");
        } else {
            this.jqLayerHide.text("visibility_off");
            this.jqImg.css("visibility", "hidden");
        }
    }

    /**
     * @returns {boolean}
     */
    isVisible() {
        return this.layer.visible;
    }

    update() {
        this.jqImg[0].src = this.layer.img;
        this.jqLayerBtnImg[0].src = this.layer.img;
    }

    onContextMenu(e) {
        let arr = [
            this.isVisible() ?
                new DropdownItem("visibility_off", "Hide", e => this.setVisibility(false)) :
                new DropdownItem("visibility", "Show", e => this.setVisibility(false)),
            new DropdownItem("photo_library", "Clone", e => this.clone()),
            new DropdownItem("_", "_"),
            new DropdownItem("content_cut", "Cut", e => this.cut()),
            new DropdownItem("content_copy", "Copy", e => this.copy()),
            new DropdownItem("content_paste", "Paste",  e => this.paste(), CopySystem.trasnference.tag === "sprite_layer"),
            new DropdownItem("_", "_"),
            new DropdownItem("delete", "Delete",  e => this.editor.layerRemove(this))
        ];
        new Dropdown({
            x : e.pageX,
            y : e.pageY,
        }, arr);
    }

    clone() {
        this.editor.layerAdd(this.layer, this.editor.selectedFrame.layers.indexOf(this));
    }

    copy() {
        CopySystem.copy(this.editor, {
            tag : "sprite_layer",
            img : this.layer.img,
        },false);
    }

    cut() {
        CopySystem.copy(this.editor, {
            tag : "sprite_layer",
            img : this.layer.img,
            onMove : (t) => this.editor.layerRemove(this.layer)
        }, true);
    }

    paste() {
        let obj = CopySystem.paste();
        this.editor.layerAdd(obj.img, this.editor.selectedFrame.layers.indexOf(this));
        CopySystem.pasteDone();
    }
}