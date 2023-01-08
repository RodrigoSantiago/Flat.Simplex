export class Dialogs {
    static zindex = 24;

    jqRoot = null;
    shown = true;

    constructor(position, items) {
        this.jqRoot = $("<div class='dialog'></div>");
        $(".main").append(this.jqRoot);
    }
}