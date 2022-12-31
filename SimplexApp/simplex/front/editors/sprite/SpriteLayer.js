import {Dropdown, DropdownItem} from "../../Dropdown.js";
import {CopySystem} from "../../CopySystem.js";

export class SpriteLayer {
    img;
    jqImg;
    jqLayerBtn;
    jqLayerBtnImg;
    visible;
    zindex = 0;
    constructor(editor, src) {
        const self = this;
        this.editor = editor;
        this.visible = true;
        this.jqImg = $("<img/>");
        this.img = this.jqImg[0];
        this.jqLayerBtn = $(
            '<div class="layer"><div class="image"><div class="layer-hide"><i class="material-icons">visibility</i></div><img class="layer-img"></div></div>');

        this.jqLayerBtn.click(function (e) {
            self.editor.selectLayer(self);
        });
        this.jqLayerBtn.contextmenu(function (e) {
            self.onContextMenu(e);
        });
        this.jqLayerBtnImg = this.jqLayerBtn.find(".layer-img");
        this.jqLayerHide = this.jqLayerBtn.find("i");
        if (src) {
            this.img.src = src;
            this.jqLayerBtnImg[0].src = src;
        }

    }

    onContextMenu(e) {
        const self = this;
        let arr = [
            new DropdownItem(this.visible ? "visibility_off" : "visibility", this.visible ? "Hide" : "Show", e => self.setVisibility(!self.visible)),
            new DropdownItem("photo_library", "Clone", e => self.clone()),
            new DropdownItem("_", "_"),
            new DropdownItem("content_cut", "Cut", e => self.cut()),
            new DropdownItem("content_copy", "Copy", e => self.copy()),
            new DropdownItem("content_paste", "Paste",  e => self.paste(), CopySystem.trasnference.tag === "sprite_layer"),
            new DropdownItem("_", "_"),
            new DropdownItem("delete", "Delete",  e => self.editor.layerRemove(self))
        ];
        new Dropdown({
            x : e.pageX,
            y : e.pageY,
        }, arr);
    }

    clone() {
        this.editor.layerAdd(this.img.src, this.editor.layers.indexOf(this));
    }

    copy() {
        const self = this;
        CopySystem.copy(this.editor, {
            tag : "sprite_layer",
            img : self.img.src
        },false);
    }

    cut() {
        const self = this;
        CopySystem.copy(this.editor, {
            tag : "sprite_layer",
            img : self.img.src,
            onMove : function (transfer) {
                self.editor.layerRemove(self);
            }
        }, true);
    }

    paste() {
        let obj = CopySystem.paste();
        this.editor.layerAdd(obj.img, this.editor.layers.indexOf(this));
        CopySystem.pasteDone();
    }

    setVisibility(visible) {
        this.visible = visible;
        if (visible) {
            this.jqLayerHide.text("visibility");
            this.jqImg.css("visibility", "visible");
        } else {
            this.jqLayerHide.text("visibility_off");
            this.jqImg.css("visibility", "hidden");
        }
    }

    width() {
        return this.editor.imageWidth;
    }

    height() {
        return this.editor.imageHeight;
    }

    canvasDraw(canvas, min, max) {
        this.img.src = canvas.toDataURL();
        this.jqLayerBtnImg[0].src = this.img.src;
    }
}