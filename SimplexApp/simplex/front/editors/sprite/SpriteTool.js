export class SpriteTool {

    constructor(editor, jqButton) {
        const self = this;
        this.editor = editor;
        this.jqButton = jqButton;
        this.jqButton.click((e) => self.editor.selectTool(self));
    }

    setSelected(selected) {
        if (selected) {
            this.jqButton.addClass("selected");
        } else {
            this.jqButton.removeClass("selected");
        }
    }

    mouseDown(pos) {

    }

    mouseMove(pos) {

    }

    mouseUp(pos) {

    }
}