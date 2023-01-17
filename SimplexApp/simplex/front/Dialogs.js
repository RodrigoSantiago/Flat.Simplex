import {DragSystem} from "./DragSystem.js";

export class Dialogs {
    static zindex = 24;
    static pageMap = new Map();
    static mouseX = 0;
    static mouseY = 0;

    static loadModels() {
        $('<div></div>').load("pages/dialogs/colorpicker.html", function (response, status, xhr) {
            Dialogs.pageMap["colorpicker"] = response;
        });
    }
}
window.addEventListener('mousemove', function (e) {
    Dialogs.mouseX = e.pageX;
    Dialogs.mouseY = e.pageY;
});

export class Dialog {
    jqRoot = null;
    shown = true;
    clearEvents = [];

    constructor(name, onClose) {
        this.jqRoot = $('<div class="dialog"><div class="dialog-bg"></div></div>');
        this.jqRoot.css("z-index", Dialogs.zindex++);
        $(".main").append(this.jqRoot);
        this.onClose = onClose;
        this.create(Dialogs.pageMap[name]);
    }

    create(value) {
        this.jqRoot.append($(value));
        this.jqRoot.find(".dialog-bg").on("click", (e) => this.close("dismiss"));
        this.jqRoot.find(".dialog-btn-ok").on("click", (e) => this.close("ok"));
        this.jqRoot.find(".dialog-btn-cancel").on("click", (e) => this.close("cancel"));
        this.jqRoot.find(".dialog-btn-yes").on("click", (e) => this.close("yes"));
        this.jqRoot.find(".dialog-btn-no").on("click", (e) => this.close("no"));
    }

    close(val) {
        if (this.shown) {
            this.shown = false;
            this.onClose?.(val);
            this.jqRoot.fadeOut("fast", (e) => this.jqRoot.remove());

            for (const event of this.clearEvents) {
                window.removeEventListener(event.e, event.f);
                event.i = false;
            }
        }
    }

    addWindowListener(event, func) {
        window.addEventListener(event, func);
        this.clearEvents.push({e:event, f:func, i:true});
    }
}