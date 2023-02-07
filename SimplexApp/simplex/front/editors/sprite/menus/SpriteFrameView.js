import {Dropdown, DropdownItem} from "../../../Dropdown.js";
import {CopySystem} from "../../../CopySystem.js";

export class SpriteFrameView {

    static thumbnailCanvas = null;
    static thumbnailCanvasCtx;

    /** @type{SpriteFrame} */ frame;
    /** @type{JQuery} */ jqFrameBtn;
    /** @type{JQuery} */ jqFrameBtnImg;

    /**
     *
     * @param editor {SpriteEditor} Editor Owner
     * @param frame {SpriteFrame} Frame to be shown
     */
    constructor(editor, frame) {
        this.editor = editor;
        this.jqFrameBtn = $('<div class="frame"><div class="image"><img class="frame-img" alt></div></div>');
        this.jqFrameBtnImg = this.jqFrameBtn.find(".frame-img");

        this.jqFrameBtn.click((e) => this.editor.selectFrame(this.frame));
        this.jqFrameBtnImg.contextmenu((e) => this.onContextMenu(e));
        this.frame = frame;
    }

    onContextMenu(e) {
        let arr = [
            new DropdownItem("photo_library", "Clone", e => this.clone()),
            new DropdownItem("_", "_"),
            new DropdownItem("content_cut", "Cut", e => this.cut()),
            new DropdownItem("content_copy", "Copy", e => this.copy()),
            new DropdownItem("content_paste", "Paste",  e => this.paste(), CopySystem.trasnference.tag === "sprite_layer"),
            new DropdownItem("_", "_"),
            new DropdownItem("delete", "Delete",  e => this.editor.frameRemove(this))
        ];
        new Dropdown({
            x : e.pageX,
            y : e.pageY,
        }, arr);
    }

    clone() {
        this.editor.frameAdd(this.frame.clone());
    }

    copy() {
        CopySystem.copy(this.editor, {
            tag : "sprite_frame",
            frame : this.frame.clone()
        });
    }

    cut() {
        CopySystem.copy(this.editor, {
            tag : "sprite_frame",
            frame : this.frame.clone(),
            onMove : (t) => this.editor.layerRemove(this)
        });
    }

    paste() {
        let obj = CopySystem.paste();
        this.editor.layerAdd(obj.frame.clone(), this.editor.frames.indexOf(this));
        CopySystem.pasteDone();
    }

    updateThumbnail() {

        for (let i = 0; i < this.frame.layers.length; i++) {
            let layer = this.frame.layers[i];
            if (!layer.imgDom.complete) {
                setTimeout(e => this.updateThumbnail(), 100);
                return;
            }
        }

        if (SpriteFrameView.thumbnailCanvas === null) {
            SpriteFrameView.thumbnailCanvas = document.createElement('canvas');
            SpriteFrameView.thumbnailCanvas.width = 64;
            SpriteFrameView.thumbnailCanvas.height = 64;
            SpriteFrameView.thumbnailCanvasCtx = SpriteFrameView.thumbnailCanvas.getContext("2d");
        }
        let ctx = SpriteFrameView.thumbnailCanvasCtx;
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

        for (let i = 0; i < this.frame.layers.length; i++) {
            let l = this.frame.layers[i];
            try {
                ctx.drawImage(l.imgDom, 0, 0, this.editor.imageWidth, this.editor.imageHeight, offX, offY, offW, offH);
            } catch (e) {
                console.error(e);
            }
        }
        this.jqFrameBtnImg[0].src = SpriteFrameView.thumbnailCanvas.toDataURL();

    }
}