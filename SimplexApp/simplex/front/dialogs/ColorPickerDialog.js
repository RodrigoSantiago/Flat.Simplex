import {Dialog} from "../Dialogs.js";
import {SpriteMenuColor} from "../editors/sprite/menus/SpriteMenuColor.js";

export class ColorPickerDialog extends Dialog {

    spriteDialog;

    constructor(initialColor, onColorPick) {
        super("colorpicker");
        this.initialColor = initialColor;
        this.onColorPick = onColorPick;
        this.spriteDialog = new SpriteMenuColor(this, this.jqRoot.find(".color-picker-dialog"), false, this.onColorPick, this.initialColor);
    }
}