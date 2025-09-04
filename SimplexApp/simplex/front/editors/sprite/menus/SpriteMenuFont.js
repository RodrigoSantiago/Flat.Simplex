import {SpriteMenu} from "./SpriteMenu.js";
import {FontPickerDialog} from "../../../dialogs/FontPickerDialog.js";
import {FontData} from "../../../font/FontData.js";
import {FontManager} from "../../../font/FontManager.js";

/**
 * Configuration menu for the Text Tool
 */
export class SpriteMenuFont extends SpriteMenu {

    /** @type{FontData} */ font;
    /** @type{number} */ size = 14;
    /** @type{boolean} */ bold = false;
    /** @type{boolean} */ italic = false;

    /** @type{JQuery} */ jqFont;
    /** @type{JQuery} */ jqSize;
    /** @type{JQuery} */ jqSizeText;
    /** @type{JQuery} */ jqBold;
    /** @type{JQuery} */ jqItalic;

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        jqDragView.find(".close-view i").on("click", (e) => this.hide());

        this.configFont();
        this.configSize();
        this.configOptions();
    }

    configFont() {
        this.font = FontManager.defaultFont;

        this.jqFont = this.jqDragView.find(".font-family");
        this.jqFont.on("option", (e, data) => {
            if (data.text() === "Pick") {
                new FontPickerDialog(this.font, (font) => {
                    this.jqFont.find("input").val(font.name);
                    this.jqFont.find("input").css("font-family", font.name);
                    let one = this.jqFont.find("[data-slot=1]");
                    let two = this.jqFont.find("[data-slot=2]");
                    two.text(one.text());
                    two.data("font", one.data("font"));
                    two.css("font-family", one.data("font"));

                    one.text(font.name);
                    one.data("font", font.name);
                    one.css("font-family", font.name);
                    this.font = font;
                })
            } else {
                this.jqFont.find("input").css("font-family", data.data("font"))
                this.font = FontManager.fonts.get(data.data("font"));
            }

            this.configUpdate();
        });
    }

    configSize() {
        this.jqSize = this.jqDragView.find(".value-size");
        this.jqSizeText = this.jqDragView.find(".text-size");
        this.jqSize.on("input", (e) => {
            this.size = this.jqSize[0].value;
            this.jqSizeText.val(this.size);
            this.configUpdate();
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
            this.configUpdate();
        });

        this.jqSizeText.val(this.size);
        this.jqSize[0].value = this.size;
    }

    configOptions() {
        this.jqBold = this.jqDragView.find(".font-bold");
        this.jqBold.change((e) => {
            this.bold = this.jqBold[0].checked;
            this.configUpdate();
        });

        this.jqItalic = this.jqDragView.find(".font-italic");
        this.jqItalic.change((e) => {
            this.italic = this.jqItalic[0].checked;
            this.configUpdate();
        });
    }

    /** @override */
    getConfig() {
        return {
            font : this.font,
            size : this.size,
            italic : this.italic,
            bold : this.bold
        };
    }
}