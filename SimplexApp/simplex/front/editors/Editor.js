import {AssetType} from "../assets/Asset.js";
import {TabController} from "../components/TabView/TabController.js";

export class Editor extends TabController {

    /** @type {AssetType} */ assetType;
    /** @type {Asset} */ asset;

    clearEvents = [];
    loopEvents = [];

    /**
     * Base constructor
     *
     * @param {Asset} asset Asset to be edited
     */
    constructor(asset) {
        super(asset);
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

    onClose() {
        close();
    }

    addWindowListener(event, func) {
        window.addEventListener(event, func);
        this.clearEvents.push({e:event, f:func, i:true});
    }

    onKeyDown(key, ctrl, alt, shift) {

    }

    onKeyUp(key, ctrl, alt, shift) {

    }
}