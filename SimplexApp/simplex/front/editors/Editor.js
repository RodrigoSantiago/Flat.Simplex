import {AssetType} from "../assets/Asset.js";

export class Editor {

    assetType;
    asset;
    constructor(asset) {
        this.assetType = asset.type;
        this.asset = asset;
    }

    getJqRoot() {
        return $(
            '<div class="editor '+ this.assetType.className +' "><div class="toolbar dense">' +
            '    <div class="button icon on-primary"><i class="material-icons">check</i></div>' +
            '    <div class="button icon on-primary"><i class="material-icons">close</i></div>' +
            '    <div class="title"><span></span></div>' +
            '    <div class="menu"></div>' +
            '</div></div>')
    }

    onResize() {

    }
}