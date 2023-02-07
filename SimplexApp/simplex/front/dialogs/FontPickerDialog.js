import {Dialog} from "../Dialogs.js";
import {FontManager} from "../font/FontManager.js";

export class FontPickerDialog extends Dialog {

    /** @type{JQuery} */ selected = null;
    /** @type{FontData} */selectedFont = null;

    constructor(initialFont, onFontPick) {
        super("fontpicker");
        this.initialFont = initialFont;
        this.onFontPick = onFontPick;
    }

    create(value) {
        super.create(value);
        this.jqList = this.jqRoot.find(".font-list");
        let keys = Array.from(FontManager.fonts.keys()).sort();
        for (let key of keys) {
            let font = FontManager.fonts.get(key);
            let item = $("<div class='font-item list-item'><span>" + font.name + "</span></div>");
            if (font === this.initialFont) {
                item.addClass("selected");
            }
            item.on("click", (e) => this.fontPick(item, font));
            this.jqList.append(item);
            setTimeout(function() {
                item.css("font-family", font.name);
            }, 10);
        }
    }

    fontPick(element, font) {
        if (this.selected) {
            this.selected.removeClass("selected")
        }
        this.selected = element;
        this.selected.addClass("selected");
        this.selectedFont = font;
    }

    close(val) {
        if (val === 'ok' && this.selectedFont) {
            this.onFontPick?.(this.selectedFont);
        }
        super.close(val);
    }
}