import {Editor} from "../Editor.js";
import {Toolbar} from "../../Toolbar.js";

class SpriteTool {
    constructor(jqButton) {
        this.jqButton = jqButton;
    }

    setSelected(selected) {
        if (selected) {
            this.jqButton.addClass("selected");
        } else {
            this.jqButton.removeClass("selected");
        }
    }

    mouseDown(position) {

    }

    mouseMove(position) {

    }

    mouseUp(position) {

    }
}
class SpriteMenu {

    constructor(jqDraggable) {
        this.jqDraggable = jqDraggable;
    }

    getLocation() {

    }
}

export class SpriteEditor extends Editor {
    static pageModel = null;

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function(response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }

    jqRoot = null;
    Toolbar = null;

    tools = [];
    selectedTool = null;

    constructor(asset) {
        super(asset);
        const self = this;
        this.jqRoot = $(SpriteEditor.pageModel);
        this.jqRoot.onResize = function (e) { self.onResize(); }
        this.Toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.configureToolbar();
        this.configureTools();

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

    configureTools() {
        const self = this;
        this.toolSelect = new SpriteTool(this.jqRoot.find(".tool-select"));
        this.toolPencil = new SpriteTool(this.jqRoot.find(".tool-pencil"));
        this.toolBrush = new SpriteTool(this.jqRoot.find(".tool-brush"));
        this.toolSpray = new SpriteTool(this.jqRoot.find(".tool-spray"));
        this.toolBucket = new SpriteTool(this.jqRoot.find(".tool-bucket"));
        this.toolEraser = new SpriteTool(this.jqRoot.find(".tool-eraser"));
        this.toolSmudge = new SpriteTool(this.jqRoot.find(".tool-smudge"));

        this.tools.push(this.toolSelect);
        this.tools.push(this.toolPencil);
        this.tools.push(this.toolBrush);
        this.tools.push(this.toolSpray);
        this.tools.push(this.toolBucket);
        this.tools.push(this.toolEraser);
        this.tools.push(this.toolSmudge);

        this.jqRoot.find(".tool-select").click((e) => self.selectTool(self.toolSelect));
        this.jqRoot.find(".tool-pencil").click((e) => self.selectTool(self.toolPencil));
        this.jqRoot.find(".tool-brush").click((e) => self.selectTool(self.toolBrush));
        this.jqRoot.find(".tool-spray").click((e) => self.selectTool(self.toolSpray));
        this.jqRoot.find(".tool-bucket").click((e) => self.selectTool(self.toolBucket));
        this.jqRoot.find(".tool-eraser").click((e) => self.selectTool(self.toolEraser));
        this.jqRoot.find(".tool-smudge").click((e) => self.selectTool(self.toolSmudge));
    }

    selectTool(tool) {
        this.selectedTool?.setSelected(false);
        this.selectedTool = tool;
        this.selectedTool.setSelected(true);
    }
}