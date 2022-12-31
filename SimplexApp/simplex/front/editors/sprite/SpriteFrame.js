import {Dropdown, DropdownItem} from "../../Dropdown.js";
import {CopySystem} from "../../CopySystem.js";

export class SpriteFrame {

    static thumbnailCanvas = null;
    static thumbnailCanvasCtx;

    jqFrameBtn;
    jqFrameBtnImg;
    layers = [];

    constructor(editor, frameObj) {
        const self = this;
        this.editor = editor;
        this.jqFrameBtn = $('<div class="frame"><div class="image"><img class="frame-img"></div></div>');
        this.jqFrameBtnImg = this.jqFrameBtn.find(".frame-img");

        this.jqFrameBtn.click(function (e) {
            self.editor.selectFrame(self);
        });
        this.jqFrameBtnImg.contextmenu(function (e) {
            self.onContextMenu(e);
        });
    }

    onContextMenu(e) {
        const self = this;
        let arr = [
            new DropdownItem("photo_library", "Clone", e => self.clone()),
            new DropdownItem("_", "_"),
            new DropdownItem("content_cut", "Cut", e => self.cut()),
            new DropdownItem("content_copy", "Copy", e => self.copy()),
            new DropdownItem("content_paste", "Paste",  e => self.paste(), CopySystem.trasnference.tag === "sprite_layer"),
            new DropdownItem("_", "_"),
            new DropdownItem("delete", "Delete",  e => self.editor.frameRemove(self))
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

    updateThumbnail() {
        if (SpriteFrame.thumbnailCanvas === null) {
            SpriteFrame.thumbnailCanvas = document.createElement('canvas');
            SpriteFrame.thumbnailCanvas.width = 64;
            SpriteFrame.thumbnailCanvas.height = 64;
            SpriteFrame.thumbnailCanvasCtx = SpriteFrame.thumbnailCanvas.getContext("2d");
        }
        let ctx = SpriteFrame.thumbnailCanvasCtx;
        ctx.clearRect(0, 0, 64, 64);
        let w = this.editor.imageWidth;
        let h = this.editor.imageHeight;
        let offX, offY, offW, offH;

        if (w > h) {
            offX = 0;
            offY = 32 - (h / w * 64) / 2;
            offW = 64;
            offH = Math.round(h / w * 64);
        } else {
            offX = 32 - (w / h * 64) / 2;
            offY = 0;
            offW = Math.round(w / h * 64);
            offH = 64;
        }
        for (let i = 0; i < this.layers.length; i++) {
            let l = this.layers[i];
            try {
                ctx.drawImage(l.img, 0, 0, this.editor.imageWidth, this.editor.imageHeight, offX, offY, offW, offH);
            } catch (e) {
                console.error(e);
            }
        }
        this.jqFrameBtnImg[0].src = SpriteFrame.thumbnailCanvas.toDataURL();
    }
}