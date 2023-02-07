import {SpriteMenu} from "./SpriteMenu.js";
import {FontPickerDialog} from "../../../dialogs/FontPickerDialog.js";
import {FontData} from "../../../font/FontData.js";
import {FontManager} from "../../../font/FontManager.js";

export class SpriteMenuFont extends SpriteMenu {

    nodes = [];
    font = null;
    size = 14;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        this.font = FontManager.defaultFont;

        jqDragView.find(".close-view i").on("click", (e) => {
            this.hide();
        });
        
        let jqFont = jqDragView.find(".font-family");
        jqFont.on("option", (e, data) => {
            if (data.text() === "Pick") {
                new FontPickerDialog(this.font, (font) => {
                    jqFont.find("input").val(font.name);
                    jqFont.find("input").css("font-family", font.name);
                    let one = jqFont.find("[data-slot=1]");
                    let two = jqFont.find("[data-slot=2]");
                    two.text(one.text());
                    two.data("font", one.data("font"));
                    two.css("font-family", one.data("font"));

                    one.text(font.name);
                    one.data("font", font.name);
                    one.css("font-family", font.name);
                    this.font = font;
                })
            } else {
                jqFont.find("input").css("font-family", data.data("font"))
                this.font = FontManager.fonts.get(data.data("font"));
            }
        });
        
        this.jqSize = jqDragView.find(".value-size");
        this.jqSizeText = jqDragView.find(".text-size");
        this.jqSize.on("input", (e) => {
            this.size = this.jqSize[0].value;
            this.jqSizeText.val(this.size);
        });
        this.jqSizeText.on("input", (e) => {
            let t = parseInt(this.jqSizeText.val());
            if (!t || t < 8) {
                t = 8;
            } else if (t > 128) {
                t = 128;
            }
            this.size = t;
            this.jqSize[0].value = t;
        });
        this.jqSizeText.val(this.size);

        this.jqBold = jqDragView.find(".font-bold");
        this.jqBold.change((e) => {
            this.bold = this.jqBold[0].checked;
        });
        this.jqItalic = jqDragView.find(".font-italic");
        this.jqItalic.change((e) => {
            this.italic = this.jqItalic[0].checked;
        });
    }

    getConfig() {
        return {
            font : this.font,
            size : this.size,
            italic : this.italic,
            bold : this.bold
        };
    }
}