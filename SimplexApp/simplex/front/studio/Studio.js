import {DragSystem} from "../DragSystem.js";
import {Dropdown, DropdownItem} from "../Dropdown.js";
import {Asset, AssetType} from "../assets/Asset.js";
import {SpriteEditor} from "../editors/sprite/SpriteEditor.js";
import {Editor} from "../editors/Editor.js";
import {Tab} from "../components/TabView/Tab.js";
import {TreeItem} from "../components/TreeView/TreeItem.js";

export class Studio {

    /** @type {JQuery} **/ jqMain = null;
    /** @type {Navigator} **/ navigator = null;
    /** @type {Toolbar} **/ toolbar = null;
    /** @type {TreeView} **/ treeView = null;
    preview = null;
    /** @type {TabView} **/ tabView = null;
    /** @type {Editor[]} **/ openEditors = [];
    TransferenceAssets = [];
    TransferenceMode = "";

    jqLowHeight;

    constructor(jqMain, navigator, toolbar, treeView, preview, tabView) {
        this.jqMain = jqMain;
        this.navigator = navigator;
        this.toolbar = toolbar;
        this.treeView = treeView;
        this.preview = preview;
        this.tabView = tabView;

        this.navigator.addItem("New", "insert_drive_file", null);
        this.navigator.addItem("Save", "save", null);
        this.navigator.addItem("Open", "folder", null);
        this.navigator.addItem("Export", "outbox", null);
        this.navigator.addItem("_");
        this.navigator.addItem("Help", "help", null);
        this.navigator.addItem("Info", "info", null);

        this.toolbar.addItem("Play", "play_arrow", null);
        this.toolbar.addItem("Debug", "bug_report", null);
        this.toolbar.addItem("Build", "archive", null);
        this.toolbar.addItem("Game Properties", null, null);
        this.toolbar.addItem("Todo List", null, null);
        this.toolbar.addItem("Plugins", null, null);
        this.toolbar.addItem("_", null, null);
        this.toolbar.addItem("Settings", null, null);

        this.jqLowHeight = this.jqMain.find(".low-height");

        this.configureDivider();
        this.configureTreeView();
        this.configureTabView();
        this.configureFloatingMenu();

        this.onResize();
    }

    configureDivider() {
        let dc = $("#divider_center");
        dc[0].onDragMove = (e) => {
            let m = Math.max(200, Math.min(400, e.pageX - dc.parent().offset().left));
            $(".left-list").css("min-width", m + "px").width(m);
            this.onResize();
        }
        dc.on("mousedown", (e) => {
            DragSystem.drag(dc[0], e.button);
        });
    }

    configureTreeView() {
        this.treeView.onTreeItemClick = (item) => {
            if (item && !item.isFolder()) {
                this.editAsset(item);
            }
        }

        for (let i = 0; i < 15; i++) {
            if (i === 3 || i === 14) {
                let it2 = new TreeItem(new Asset("Asset Folder " + i, AssetType.folder), true);
                it2.open = true;
                this.treeView.root.addChild(it2);

                let it = new TreeItem(new Asset("Sprite Asset " + i, AssetType.sprite));
                it2.addChild(it);
            } else {
                let it = new TreeItem(new Asset("Sprite Asset " + i, AssetType.sprite));
                this.treeView.root.addChild(it);
            }
        }
        this.treeView.onRequestContextMenu = (e, item) => {
            let arr = [
                new DropdownItem("edit", "Edit", (e) => this.editAsset(item)),
                new DropdownItem("edit_note", "Rename", (e) => {}, !!item),
                new DropdownItem("folder", "Create Folder", e => this.createAsset("folder")),
                new DropdownItem("_", "_"),
                new DropdownItem("content_cut", "Cut", e => this.cutSelection(), !!item),
                new DropdownItem("content_copy", "Copy", e => this.copySelection(), !!item),
                new DropdownItem("content_paste", "Paste", e => this.pasteContent(item), this.TransferenceAssets.length > 0),
                new DropdownItem("_", "_"),
                new DropdownItem("delete", "Delete", e => this.deleteSelection(), !!item)
            ];
            if (!item || item.isFolder()) {
                arr.splice(0, 1);
            }
            new Dropdown({
                x : e.pageX,
                y : e.pageY,
            }, arr);
        }

        this.treeView.update();
    }

    configureTabView() {
        $(window).on("keydown", (e) => {
            /*if (this.TabView.selectedTab) {
                //this.TabView.selectedTab.
            }*/
        });
    }

    configureFloatingMenu() {
        $("#floating-add-sprite").on("click", (e) => this.createAsset("sprite"));
        $("#floating-add-sound").on("click", (e) => this.createAsset("sound"));
        $("#floating-add-font").on("click", (e) => this.createAsset("font"));
        $("#floating-add-script").on("click", (e) => this.createAsset("script"));
        $("#floating-add-object").on("click", (e) => this.createAsset("object"));
        $("#floating-add-scene").on("click", (e) => this.createAsset("scene"));

        let floating_add = $("#floating-add");
        let floating_creation = $(".floating-creation");
        $(document).on("mouseup", (event) => {
            if ($(event.target).closest(floating_add).length === 0) {
                if (floating_creation.css("display") !== "none") {
                    floating_creation.slideToggle(100);
                    floating_add.removeClass("open");
                }
            }
        });
        floating_add.on("click", (e) => {
            if (floating_creation.css("display") === "none") {
                floating_add.addClass("open");
            } else {
                floating_add.removeClass("open");
            }
            floating_creation.slideToggle(100);
        });
    }

    createAsset(type) {
        let it  = new TreeItem(new Asset("Asset created", AssetType.type[type]), AssetType.type[type] === AssetType.folder);

        if (this.treeView.selection.length === 1) {
            let selectedItem = this.treeView.selection[0];
            if (selectedItem.isFolder()) {
                selectedItem.addChild(it);
            } else {
                let id = selectedItem.getIndex() + 1;
                selectedItem.parent.addChild(it, id);
            }
        } else {
            this.treeView.root.addChild(it);
        }
        this.treeView.selectionAdd(it);
        this.treeView.update();
    }

    copySelection() {
        let selection = this.treeView.selection.slice();
        let filter = [];
        for (let i = 0; i < selection.length; i++) {
            let item = selection[i];
            let child = false;
            for (let j = 0; j < selection.length; j++) {
                let item2 = selection[j];
                if (item !== item2 && item.isChildOf(item2)) {
                    child = true;
                    break;
                }
            }
            if (!child) {
                filter.push(item);
            }
        }
        this.TransferenceAssets = filter;
        this.TransferenceMode = "copy";
        this.treeView.selectionSet(filter);

    }

    cutSelection() {
        this.copySelection();
        this.TransferenceMode = "cut";
    }

    pasteContent(item) {
        if (this.TransferenceAssets.length > 0) {
            if (this.TransferenceMode === "cut") {
                for (let i = 0; i < this.TransferenceAssets.length; i++) {
                    let newItem = this.TransferenceAssets[i];
                    newItem.getParent().removeChild(newItem);
                }
            } else if (this.TransferenceMode === "copy") {
                for (let i = 0; i < this.TransferenceAssets.length; i++) {
                    let oldItem = this.TransferenceAssets[i];
                    this.TransferenceAssets[i] = new TreeItem(oldItem.content.makeCopy(), oldItem.isFolder());
                }
            }

            let parent = this.treeView.root;
            let index = null;
            if (item) {
                parent = item.getParent();
                index = item.getIndex();
            }
            for (let i = 0; i < this.TransferenceAssets.length; i++) {
                let newItem = this.TransferenceAssets[i];
                parent.addChild(newItem, index + i + 1);
            }
            this.treeView.selectionSet(this.TransferenceAssets);
            this.TransferenceAssets = [];
        }
        this.treeView.update();
    }

    deleteSelection() {
        this.copySelection();
        if (this.TransferenceAssets.length > 0) {
            for (let i = 0; i < this.TransferenceAssets.length; i++) {
                let newItem = this.TransferenceAssets[i];
                newItem.getParent().removeChild(newItem);
            }
            this.TransferenceAssets = [];
        }
        this.treeView.update();
    }

    /**
     * Edit the asset from the given TreeItem
     *
     * @param {TreeItem} item
     */
    editAsset(item) {
        let asset = item.content;

        for (const tb of this.tabView.tabList) {
            if (tb.controller.content === asset) {
                this.tabView.selectTab(tb);
                return;
            }
        }

        let editor = asset.type === AssetType.sprite ? 
            new SpriteEditor(asset) :
            new Editor(asset);
        
        let tab = new Tab(asset.name, asset.type.icon, asset.type.className, editor);
        editor.close = () => this.tabView.removeTab(tab);
        
        this.tabView.addTab(tab);
    }

    onResize() {
        this.navigator.toClose();
        this.treeView.update();
        this.toolbar.update();
        this.tabView.onResize();

        this.jqLowHeight.css("min-width", this.jqMain.find(".negative-floating").width());
    }
}