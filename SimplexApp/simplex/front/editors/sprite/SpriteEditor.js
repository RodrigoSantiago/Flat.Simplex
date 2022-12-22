import {Editor} from "../Editor.js";
import {AssetType} from "../../assets/Asset.js";

export class SpriteEditor extends Editor {
    static pageModel = null;

    constructor(asset) {
        super(asset);
    }

    getJqRoot() {
        return $(SpriteEditor.pageModel);
    }

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function(response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }
}