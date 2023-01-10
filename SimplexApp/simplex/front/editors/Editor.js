import {AssetType} from "../assets/Asset.js";

export class Editor {

    assetType;
    asset;

    clearEvents = [];
    loopEvents = [];

    constructor(asset) {
        this.assetType = asset.type;
        this.asset = asset;
    }

    getJqRoot() {
        return $(
            '<div class="editor '+ this.assetType.className +' "><div class="toolbar dense">' +
            '    <div class="button icon on-color"><i class="material-icons">check</i></div>' +
            '    <div class="button icon on-color"><i class="material-icons">close</i></div>' +
            '    <div class="title"><span></span></div>' +
            '    <div class="menu"></div>' +
            '</div></div>')
    }

    onShow() {
        for (const event of this.clearEvents) {
            if (!event.i) {
                window.addEventListener(event.e, event.f);
                event.i = true;
            }
        }
    }

    onResize() {

    }

    onHide() {
        for (const event of this.clearEvents) {
            window.removeEventListener(event.e, event.f);
            event.i = false;
        }
    }

    onRemove() {
        for (const event of this.clearEvents) {
            window.removeEventListener(event.e, event.f);
            event.i = false;
        }
    }

    addWindowListener(event, func) {
        window.addEventListener(event, func);
        this.clearEvents.push({e:event, f:func, i:true});
    }
}