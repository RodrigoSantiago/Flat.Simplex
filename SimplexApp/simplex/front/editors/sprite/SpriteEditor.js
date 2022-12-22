import {Editor} from "../Editor.js";
import {AssetType} from "../../assets/Asset.js";
import {Toolbar} from "../../Toolbar.js";

export class SpriteEditor extends Editor {
    static pageModel = null;

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function(response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }

    jqRoot = null;
    Toolbar = null;

    constructor(asset) {
        super(asset);
        const self = this;
        this.jqRoot = $(SpriteEditor.pageModel);
        this.jqRoot.onResize = function (e) { self.onResize(); }
        this.Toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.configureToolbar();

        this.onResize();
    }

    getJqRoot() {
        return this.jqRoot;
    }

    onResize() {
        this.Toolbar.update();
    }

    configureToolbar() {
        this.Toolbar.addItem("Undo", "undo", null);
        this.Toolbar.addItem("Redo", "redo", null);
        this.Toolbar.addItem("Import", null, null);
        this.Toolbar.addItem("Export", null, null);
        this.Toolbar.addItem("Filter", null, null);
        this.Toolbar.addItem("_", null, null);
        this.Toolbar.addItem("Settings", null, null);
    }
}