import {TreeItem} from "../TreeView.js";
import {DragSystem} from "../DragSystem.js";
import {Dropdown, DropdownItem} from "../Dropdown.js";
import {Asset, AssetType} from "../assets/Asset.js";
import {Tab, TabView} from "../TabView.js";
import {SpriteEditor} from "../editors/sprite/SpriteEditor.js";
import {Editor} from "../editors/Editor.js";

export class Studio {

    jqMain = null;
    Navigator = null;
    Toolbar = null;
    TreeView = null;
    Preview = null;
    TabView = null;
    OpenEditors = [];
    TransferenceAssets = [];
    TransferenceMode = "";

    constructor(jqMain, Navigator, Toolbar, TreeView, Preview, TabView) {
        const self = this;

        this.jqMain = jqMain;
        this.Navigator = Navigator;
        this.Toolbar = Toolbar;
        this.TreeView = TreeView;
        this.Preview = Preview;
        this.TabView = TabView;

        this.Navigator.addItem("New", "insert_drive_file", null);
        this.Navigator.addItem("Save", "save", null);
        this.Navigator.addItem("Open", "folder", null);
        this.Navigator.addItem("Export", "outbox", null);
        this.Navigator.addItem("_");
        this.Navigator.addItem("Help", "help", null);
        this.Navigator.addItem("Info", "info", null);

        this.Toolbar.addItem("Play", "play_arrow", null);
        this.Toolbar.addItem("Debug", "bug_report", null);
        this.Toolbar.addItem("Build", "archive", null);
        this.Toolbar.addItem("Game Properties", null, null);
        this.Toolbar.addItem("Todo List", null, null);
        this.Toolbar.addItem("Plugins", null, null);
        this.Toolbar.addItem("_", null, null);
        this.Toolbar.addItem("Settings", null, null);

        this.configureDivider();
        this.configureTreeView();
        this.configureTabView();
        this.configureFloatingMenu();

        this.onResize();
    }

    configureDivider() {

        let dc = $("#divider_center");
        dc.mousedown(function (e) {
            if (DragSystem.drag(dc[0])) {
                dc[0].drarStart = true;
            }
        });
        $(window).mouseup(function (e) {
            if (dc[0].drarStart) {
                DragSystem.drop(dc[0]);
                dc[0].drarStart = false;
            }
        });
        $(window).mousemove(function (e) {
            if (dc[0].drarStart) {
                let m = Math.max(200, Math.min(400, e.pageX - dc.parent().offset().left));
                console.log(e.pageX +"-"+ dc.parent().offset().left)
                $(".left-list").css("min-width", m + "px").width(m);
            }
        });
    }

    configureTreeView() {
        const self = this;

        this.TreeView.onTreeItemClick = function (item) {
            if (item && !item.isFolder()) {
                self.editAsset(item);
            }
        }

        for (let i = 0; i < 15; i++) {
            if (i === 3 || i === 14) {
                let it2 = new TreeItem(new Asset("Asset Folder " + i, AssetType.folder), true);
                it2.open = true;
                this.TreeView.root.addChild(it2);

                let it = new TreeItem(new Asset("Sprite Asset " + i, AssetType.sprite));
                it2.addChild(it);
            } else {
                let it = new TreeItem(new Asset("Sprite Asset " + i, AssetType.sprite));
                this.TreeView.root.addChild(it);
            }
        }
        this.TreeView.onRequestContextMenu = function (e, item) {
            let arr = [
                new DropdownItem("edit", "Edit", (e) => self.editAsset(item)),
                new DropdownItem("edit_note", "Rename", (e) => {}, !!item),
                new DropdownItem("folder", "Create Folder", e => self.createAsset("folder")),
                new DropdownItem("_", "_"),
                new DropdownItem("content_cut", "Cut", e => self.cutSelection(), !!item),
                new DropdownItem("content_copy", "Copy", e => self.copySelection(), !!item),
                new DropdownItem("content_paste", "Paste", e => self.pasteContent(item), self.TransferenceAssets.length > 0),
                new DropdownItem("_", "_"),
                new DropdownItem("delete", "Delete", e => self.deleteSelection(), !!item)
            ];
            if (!item || item.isFolder()) {
                arr.splice(0, 1);
            }
            new Dropdown({
                x : e.pageX,
                y : e.pageY,
            }, arr);
        }

        this.TreeView.update();
    }

    configureTabView() {

    }

    configureFloatingMenu() {
        const self = this;
        $("#floating-add-sprite").click(e => self.createAsset("sprite"));
        $("#floating-add-sound").click(e => self.createAsset("sound"));
        $("#floating-add-font").click(e => self.createAsset("font"));
        $("#floating-add-script").click(e => self.createAsset("script"));
        $("#floating-add-object").click(e => self.createAsset("object"));
        $("#floating-add-scene").click(e => self.createAsset("scene"));

        let floating_add = $("#floating-add");
        let floating_creation = $(".floating-creation");
        $(document).mouseup(function (event) {
            if ($(event.target).closest(floating_add).length === 0) {
                if (floating_creation.css("display") !== "none") {
                    floating_creation.slideToggle(100);
                    floating_add.removeClass("open");
                }
            }
        });
        floating_add.click(function (e) {
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

        if (this.TreeView.selection.length === 1) {
            let selectedItem = this.TreeView.selection[0];
            if (selectedItem.isFolder()) {
                selectedItem.addChild(it);
            } else {
                let id = selectedItem.getIndex() + 1;
                selectedItem.parent.addChild(it, id);
            }
        } else {
            this.TreeView.root.addChild(it);
        }
        this.TreeView.selectionAdd(it);
        this.TreeView.update();
    }

    copySelection() {
        let selection = this.TreeView.selection.slice();
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
        this.TreeView.selectionSet(filter);

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

            let parent = this.TreeView.root;
            let index = null;
            if (item) {
                parent = item.getParent();
                index = item.getIndex();
            }
            for (let i = 0; i < this.TransferenceAssets.length; i++) {
                let newItem = this.TransferenceAssets[i];
                parent.addChild(newItem, index + i + 1);
            }
            this.TreeView.selectionSet(this.TransferenceAssets);
            this.TransferenceAssets = [];
        }
        this.TreeView.update();
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
        this.TreeView.update();
    }

    editAsset(item) {
        const self = this;
        let asset = item.content;

        for (const tb of this.TabView.tabList) {
            if (tb.asset === asset) {
                this.TabView.selectTab(tb);
                return;
            }
        }

        let editor = asset.type === AssetType.sprite ? new SpriteEditor(asset) : new Editor(asset);

        let tab = new Tab(asset.name, asset.type.icon, asset.type.className, function (e) {
            self.TabView.removeTab(e);
        }, editor.getJqRoot());
        tab.asset = asset;
        this.TabView.addTab(tab);
        this.TabView.selectTab(tab);
    }

    onResize() {
        this.Navigator.toClose();
        this.TreeView.update();
        this.Toolbar.update();
        this.TabView.updateScroll();
    }
}