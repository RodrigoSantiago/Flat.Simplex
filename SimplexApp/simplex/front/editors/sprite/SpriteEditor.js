import {Editor} from "../Editor.js";
import {Toolbar} from "../../toolbar.js";
import {SpriteTool} from "./tools/SpriteTool.js";
import {SpriteToolPencil} from "./tools/SpriteToolPencil.js";
import {SpriteToolBrush} from "./tools/SpriteToolBrush.js";
import {SpriteMenuLayers} from "./menus/SpriteMenuLayers.js";
import {SpriteMenuBrush} from "./menus/SpriteMenuBrush.js";
import {SpriteMenuFrames} from "./menus/SpriteMenuFrames.js";
import {SpriteToolSpray} from "./tools/SpriteToolSpray.js";
import {SpriteToolEraser} from "./tools/SpriteToolEraser.js";
import {SpriteToolSmudge} from "./tools/SpriteToolSmudge.js";
import {SpriteToolBucket} from "./tools/SpriteToolBucket.js";
import {SpriteMenuColor} from "./menus/SpriteMenuColor.js";
import {SpriteMenuTools} from "./menus/SpriteMenuTools.js";
import {SpriteToolColor} from "./tools/SpriteToolColor.js";
import {SpriteMenuGradient} from "./menus/SpriteMenuGradient.js";
import {SpriteToolSelect} from "./tools/SpriteToolSelect.js";
import {SpriteTransformBox} from "./SpriteTransformBox.js";
import {SpriteToolShapes} from "./tools/SpriteToolShapes.js";
import {SpriteToolText} from "./tools/SpriteToolText.js";
import {SpriteLayer} from "./SpriteLayer.js";
import {SpriteFrame} from "./SpriteFrame.js";
import {SpriteMenuFont} from "./menus/SpriteMenuFont.js";

export class SpriteEditor extends Editor {
    static pageModel = null;

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function (response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }

    /** @type {JQuery} */ jqRoot = null;
    /** @type {Toolbar} */ toolbar = null;
    /** @type {AssetSprite} */ sprAsset = null;

    /** @type {number} */ imageWidth = 400;
    /** @type {number} */ imageHeight = 200;

    // Menus
    /** @type {SpriteMenu[]} */ toolMenus = [];
    /** @type {SpriteMenuTools} */ toolsMenu;
    /** @type {SpriteMenuLayers} */ layersMenu;
    /** @type {SpriteMenuFrames} */ framesMenu;
    /** @type {SpriteMenuBrush} */ brushMenu;
    /** @type {SpriteMenuColor} */ colorMenu;
    /** @type {SpriteMenuGradient} */ gradMenu;
    /** @type {JQuery} */ dropLine;
    /** @type {JQuery} */ jqSplitVer;
    /** @type {JQuery} */ jqSplitHor;

    // Animation
    /** @type {SpriteFrame[]} */ frames = [];
    /** @type {SpriteLayer} */ selectedLayer = null;
    /** @type {SpriteFrame} */ selectedFrame = null;

    // Tools
    /** @type {SpriteTool} */ selectedTool = null;
    /** @type {SpriteToolSelect} */ toolSelect;
    /** @type {SpriteToolPencil} */ toolPencil;
    /** @type {SpriteToolBrush} */ toolBrush;
    /** @type {SpriteToolSpray} */ toolSpray;
    /** @type {SpriteToolEraser} */ toolEraser;
    /** @type {SpriteToolSmudge} */ toolSmudge;
    /** @type {SpriteToolBucket} */ toolBucket;
    /** @type {SpriteToolShapes} */ toolShapes;
    /** @type {SpriteToolText} */ toolText;
    /** @type {SpriteToolColor} */ toolColor;

    // Selection
    /** @type {SpriteTransformBox} */ tsBox;
    /** @type {boolean[]} */ selectionPixels = [];
    /** @type {boolean} */ selectionClip = false;

    // Canvas
    /** @type {SpriteLayer} */ canvasLayer = null;
    /** @type {boolean} */ canvasBaked = false;
    /** @type {JQuery} */ canvas;
    /** @type {JQuery} */ canvasB;
    /** @type {JQuery} */ canvasC;
    /** @type {JQuery} */ canvasPos;
    /** @type {JQuery} */ canvasScl;
    /** @type {JQuery} */ canvasView;
    /** @type {JQuery} */ canvasBg;
    /** @type {JQuery} */ canvasCursor;

    // Brushes Settings
    /** @type {string} */ color = "#000000";
    /** @type {string} */ altColor = "#FF0040";
    /** @type {number} */ alpha = 255;
    /** @type {number} */ altAlpha = 255;

    // Zoom
    /** @type {{x, y}} */ zoomPos = {x:0, y:0};
    /** @type {number} */ zoomStep = 1;
    /** @type {boolean} */ dragZoom;
    /** @type {{x, y}} */ dragZoomStart;

    // Paiting
    /** @type {boolean} */ dragPaint;
    /** @type {{x, y}} */ dragPaintPos;
    /** @type {number} */ dragButton;
    /** @type {string} */ dragPaintCol;
    /** @type {number} */ dragPaintAlpha;

    loopSelection = null;

    /**
     * Base contructor
     *
     * @param asset {AssetSprite} Asset to be edited
     */
    constructor(asset) {
        super(asset);
        this.sprAsset = asset;
        this.imageWidth = this.sprAsset.width;
        this.imageHeight = this.sprAsset.height;
        this.jqRoot = $(SpriteEditor.pageModel);
        this.toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.jqSplitVer = this.jqRoot.find(".split-panel-ver");
        this.jqSplitHor = this.jqRoot.find(".split-panel-hor");
        this.canvas = this.jqRoot.find(".canvasA");
        this.canvasB = this.jqRoot.find(".canvasB");
        this.canvasC = this.jqRoot.find(".canvasC");
        this.canvasPos = this.jqRoot.find(".canvas-position");
        this.canvasScl = this.jqRoot.find(".canvas-owner");
        this.canvasView = this.jqRoot.find(".canvas-view");
        this.canvasBg = this.jqRoot.find(".canvas-background");
        this.canvasCursor = this.jqRoot.find(".canvas-cursor");
        this.canvas[0].width = this.imageWidth;
        this.canvas[0].height = this.imageHeight;
        this.canvasB[0].width = this.imageWidth;
        this.canvasB[0].height = this.imageHeight;
        this.canvasC[0].width = this.imageWidth;
        this.canvasC[0].height = this.imageHeight;
        this.selectionPixels = new Array(this.imageWidth * this.imageHeight).fill(false);

        this.jqRoot.find(".save-btn").on("click", (e) => {
            this.close();
        });
        this.jqRoot.find(".close-btn").on("click", (e) => {
            this.close();
        });
    }

    /**
     * @override
     * @returns {JQuery}
     */
    getJqRoot() {
        return this.jqRoot;
    }

    /** @override */
    onResize() {
        this.canvasPosition({x: 0, y: 0}, {x: 0, y: 0});
        this.toolbar.update();
        for (let menu of this.toolMenus) {
            if (menu.floating) {
                let width = this.jqSplitVer.width();
                let height = this.jqSplitVer.height();
                let off = this.jqSplitVer.offset();
                let pos = menu.jqDragView.offset();
                menu.jqDragView.offset({
                    left: Math.min(off.left + width - menu.jqDragView.width(), Math.max(off.left, pos.left)),
                    top: Math.min(off.top + height - menu.jqDragView.height(), Math.max(off.top, pos.top))
                });
            }
        }
    }

    /** @override */
    onShow() {
        if (!this.ready) {
            this.configuretoolbar();
            this.configureTools();
            this.configureCanvas();
            this.configureLayers();
            this.selectTool(this.toolPencil);
            this.ready = true;
        } else {
            this.selectedTool?.setSelected(true);
        }
        if (!this.loopSelection) {
            this.loopSelection = setInterval((e) => this.toolSelect.animate(), 200);
        }
    }

    /** @override */
    onHide() {
        if (this.loopSelection) {
            clearInterval(this.loopSelection);
            this.loopSelection = null;
        }
        this.selectedTool?.setSelected(false);
    }

    /** @override */
    onRemove() {
        super.onRemove();
    }

    /** @override */
    onKeyDown(key, ctrl, alt, shift) {
        if (key) {

        }
    }

    /** @override */
    onKeyUp(key, ctrl, alt, shift) {

    }

    getMainContext() {
        return this.canvas[0].getContext("2d");
    }

    getTempContext() {
        return this.canvasB[0].getContext("2d");
    }

    getSelectionContext() {
        return this.canvasC[0].getContext("2d");
    }

    configuretoolbar() {
        this.toolbar.addItem("Undo", "undo", null);
        this.toolbar.addItem("Redo", "redo", null);
        this.toolbar.addItem("Import", null, null);
        this.toolbar.addItem("Export", null, null);
        this.toolbar.addItem("_", null, null);
        this.toolbar.addItem("Resize", null, null);
        this.toolbar.addItem("Physics Mask", null, null);
        this.toolbar.addItem("Filters", null, null);
        this.toolbar.addItem("_", null, null);
        this.toolbar.addItem("Settings", null, null);
    }

    configureTools() {
        this.tsBox = new SpriteTransformBox(this);

        this.toolsMenu = new SpriteMenuTools(this, this.jqRoot.find(".tools-view"), true);
        this.layersMenu = new SpriteMenuLayers(this, this.jqRoot.find(".layers-view"), true);
        this.framesMenu = new SpriteMenuFrames(this, this.jqRoot.find(".frames-view"), true);
        this.brushMenu = new SpriteMenuBrush(this, this.jqRoot.find(".brush-view"), false);
        this.colorMenu = new SpriteMenuColor(this, this.jqRoot.find(".color-picker-view"), false);
        this.gradMenu = new SpriteMenuGradient(this, this.jqRoot.find(".gradient-view"), false);
        this.fontMenu = new SpriteMenuFont(this, this.jqRoot.find(".font-view"), false);
        this.toolMenus.push(this.toolsMenu);
        this.toolMenus.push(this.layersMenu);
        this.toolMenus.push(this.framesMenu);
        this.toolMenus.push(this.brushMenu);
        this.toolMenus.push(this.colorMenu);
        this.toolMenus.push(this.gradMenu);
        this.toolMenus.push(this.fontMenu);
        this.dropLine = this.jqRoot.find(".sprite-drop-line");

        this.toolSelect = new SpriteToolSelect(this, this.jqRoot.find(".tool-select"), this.brushMenu);
        this.toolPencil = new SpriteToolPencil(this, this.jqRoot.find(".tool-pencil"), this.brushMenu);
        this.toolBrush = new SpriteToolBrush(this, this.jqRoot.find(".tool-brush"), this.brushMenu);
        this.toolSpray = new SpriteToolSpray(this, this.jqRoot.find(".tool-spray"), this.brushMenu);
        this.toolEraser = new SpriteToolEraser(this, this.jqRoot.find(".tool-eraser"), this.brushMenu);
        this.toolSmudge = new SpriteToolSmudge(this, this.jqRoot.find(".tool-smudge"), this.brushMenu);
        this.toolBucket = new SpriteToolBucket(this, this.jqRoot.find(".tool-bucket"), this.gradMenu);
        this.toolShapes = new SpriteToolShapes(this, this.jqRoot.find(".tool-shapes"), this.brushMenu);
        this.toolText = new SpriteToolText(this, this.jqRoot.find(".tool-text"), this.fontMenu);
        this.toolColor = new SpriteToolColor(this, this.jqRoot.find(".tool-color"), this.colorMenu);
    }

    configureCanvas() {
        this.zoomStep = 0;
        this.canvasZoom(1);
        this.canvasPosition({x: this.canvasView.width() / 2, y: this.canvasView.height() / 2});

        this.canvasView.mousedown(e => {
            if (($(e.target).closest('.sprite-scale-box-border').length ||
                $(e.target).closest('.sprite-pivot').length ||
                $(e.target).closest('.sprite-text-area').length) && e.button !== 1) return;
            this.canvasOnMouseDown(e)
        });
        this.addWindowListener('mousemove', e => this.canvasOnMouseMove(e));
        this.addWindowListener('mouseup', e => this.canvasOnMouseUp(e));
        this.canvasView[0].addEventListener('wheel', e => this.canvasOnMouseScroll(e));

        this.canvasView.mousemove(e => {
            let off = this.canvasView.offset();
            this.updateCanvasCursor({x: e.pageX - off.left, y: e.pageY - off.top});
        });
        this.canvasView.mouseleave(e => this.canvasCursor.addClass("cursor-out"));
        this.canvasView.mouseenter(e => this.canvasCursor.removeClass("cursor-out"));
    }

    configureLayers() {
        this.imageWidth = this.sprAsset.width;
        this.imageHeight = this.sprAsset.height;
        this.frames = [];
        for (let frame of this.sprAsset.frames) {
            this.frameAdd(frame.layers);
        }
        this.selectFrame(this.frames[0]);
    }

    convertCanvasPosition(e) {
        let off = this.canvasView.offset();
        let obj = {
            x: ((e.pageX - off.left) - (this.zoomPos.x - (this.imageWidth / 2 * this.zoomStep))) / this.zoomStep,
            y: ((e.pageY - off.top) - (this.zoomPos.y - (this.imageHeight / 2 * this.zoomStep))) / this.zoomStep,
        };
        obj.x = Math.floor(obj.x);
        obj.y = Math.floor(obj.y);
        obj.xf = obj.x;
        obj.yf = obj.y;
        return obj;
    }

    canvasOnMouseDown(e) {
        if (this.dragZoom || this.dragPaint) return;
        if (this.colorMenu.dropper) {
            this.colorMenu.getDropperColor(this.convertCanvasPosition(e));
            return;
        }

        if (e.button === 1) {
            this.dragZoom = true;
            this.dragZoomStart = {
                x: e.pageX - this.canvasView.offset().left,
                y: e.pageY - this.canvasView.offset().top
            };
        } else {
            this.dragPaint = true;
            this.dragPaintPos = this.convertCanvasPosition(e);
            this.dragButton = e.button;
            if (e.button === 0) {
                this.dragPaintCol = this.color;
                this.dragPaintAlpha = this.alpha;
            } else if (e.button === 2) {
                this.dragPaintCol = this.altColor;
                this.dragPaintAlpha = this.altAlpha;
            }
            this.toolStart(this.dragPaintCol, this.dragPaintAlpha, e.ctrlKey, e.altKey, e.shiftKey);
            if (this.selectedTool.isDrawing()) {
                this.selectedTool.mouseDown(this.dragPaintPos, e.ctrlKey, e.altKey, e.shiftKey);
            }
        }
    }

    canvasOnMouseMove(e) {
        if (this.dragZoom) {
            let off = this.canvasView.offset();
            let old = this.dragZoomStart;
            this.dragZoomStart = {
                x: e.pageX - off.left,
                y: e.pageY - off.top
            };
            this.canvasPosition(old, this.dragZoomStart);
        } else if (this.dragPaint) {
            this.dragPaintPos = this.convertCanvasPosition(e);
            if (this.selectedTool.isDrawing()) {
                this.selectedTool.mouseMove(this.dragPaintPos, e.ctrlKey, e.altKey, e.shiftKey);
            }
        }
    }

    canvasOnMouseUp(e) {
        if (this.dragZoom && e.button === 1) {
            this.dragZoom = false;
        } else if (this.dragPaint && e.button === this.dragButton) {
            this.dragPaintPos = this.convertCanvasPosition(e);
            if (this.selectedTool.isDrawing()) {
                this.selectedTool.mouseUp(this.dragPaintPos, e.ctrlKey, e.altKey, e.shiftKey);
            }
            this.dragPaint = false;
        }
    }

    canvasOnMouseScroll(e) {
        let off = this.canvasView.offset();
        this.canvasScroll({
            x: e.pageX - off.left,
            y: e.pageY - off.top
        }, Math.sign(e.deltaY) * 30);
    }

    canvasScroll(pos, delta) {
        let zoomBefore = this.zoomStep;
        this.canvasZoom(-Math.sign(delta));
        let zoomAfter = this.zoomStep;
        if (zoomBefore > 0 && zoomBefore !== zoomAfter) {
            let bScreenX = pos.x - this.zoomPos.x;
            let bScreenY = pos.y - this.zoomPos.y;
            let pixelCenterX = (pos.x - this.zoomPos.x) / zoomBefore;
            let pixelCenterY = (pos.y - this.zoomPos.y) / zoomBefore;
            let screenX = pixelCenterX * zoomAfter;
            let screenY = pixelCenterY * zoomAfter;

            this.canvasPosition({x: bScreenX - screenX, y: bScreenY - screenY});
            this.tsBox.update(zoomBefore);
        }
        if (this.dragPaint && this.selectedTool) {
            this.selectedTool.mouseMove(this.dragPaintPos, this.dragPaintCol);
        }
        this.updateCanvasCursor(pos);
    }

    canvasPosition(posA, posB) {
        let pos = this.canvasPos.position();
        let x = pos.left + (posB ? (posB.x - posA.x) : posA.x);
        let y = pos.top + (posB ? (posB.y - posA.y) : posA.y);

        let minX = -(this.imageWidth * this.zoomStep) / 2 + 64;
        let minY = -(this.imageHeight * this.zoomStep) / 2 + 64;

        let maxX = this.canvasView.width() + (this.imageWidth * this.zoomStep) / 2 - 64;
        let maxY = this.canvasView.height() + (this.imageHeight * this.zoomStep) / 2 - 64;

        x = Math.min(maxX, Math.max(minX, x));
        y = Math.min(maxY, Math.max(minY, y));

        this.zoomPos = {
            x: x,
            y: y
        };
        this.canvasPos.css({left: this.zoomPos.x, top: this.zoomPos.y});
    }

    canvasZoom(step) {
        if (this.zoomStep === 16) {
            if (step === 1) step = 2;
        } else if (this.zoomStep > 16 && this.zoomStep < 24) {
            step *= 2;
        } else if (this.zoomStep === 24) {
            step = step === 1 ? 4 : -2;
        } else if (this.zoomStep > 24) {
            step *= 4;
        }

        this.zoomStep = Math.min(32, Math.max(1, this.zoomStep + step));
        this.canvasScl.css({
            "min-width": this.imageWidth * this.zoomStep,
            "max-width": this.imageWidth * this.zoomStep,
            "min-height": this.imageHeight * this.zoomStep,
            "max-height": this.imageHeight * this.zoomStep
        });
        this.canvas.css("transform", "scale(" + this.zoomStep + ")");
        this.canvasB.css("transform", "scale(" + this.zoomStep + ")");
        this.canvasC.css("transform", "scale(" + this.zoomStep + ")");

        let bgSize = 16;
        if (this.zoomStep >= 4 && this.zoomStep < 12) {
            bgSize = this.zoomStep * 4;
        } else if (this.zoomStep >= 12 && this.zoomStep < 16) {
            bgSize = this.zoomStep * 2;
        } else if (this.zoomStep >= 16 && this.zoomStep < 24) {
            bgSize = this.zoomStep;
        } else if (this.zoomStep >= 24 && this.zoomStep < 32) {
            bgSize = this.zoomStep / 3 * 2;
        } else if (this.zoomStep >= 32) {
            bgSize = this.zoomStep / 2;
        }
        this.canvasBg.css("background-size", bgSize + "px");
    }

    canvasBakeImage() {
        if (!this.canvasBaked) {
            let ctx = this.getMainContext();
            ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
            for (let i = this.layers.length - 1; i >= 0; i--){
                let layer = this.layers[i];
                ctx.drawImage(layer.img, 0, 0);
            }
            this.canvasLayer = null;
            this.canvasBaked = true;
        }
    }

    updateCanvasCursor(pos) {
        if (this.colorMenu.dropper) {
            this.canvasView.css("cursor", "url(cursor-dropper.png) 2 17, default");
            this.canvasCursor.css("display", "none");
        } else {
            this.selectedTool.updateCanvasCursor(pos);
        }
    }

    dragFindBestFit(menu, x, y) {
        if (!menu.dockeable) {
            return {type: "floating", menu: null, a: 0, pos: {x: x - menu.offX, y: y- menu.offY}};
        }

        let width = this.jqSplitVer.width();
        let height = this.jqSplitVer.height();
        let off = this.jqSplitVer.offset();

        let lines = [
            {o: null, type: "horizontal", p: off.top, a: 1},
            {o: null, type: "horizontal", p: off.top + height, a: 2},
            {o: null, type: "vertical", p: off.left, a: 1},
            {o: null, type: "vertical", p: off.left + width, a: 2}
        ];
        for (const tMenu of this.toolMenus) {
            if (tMenu.floating || tMenu === menu) continue;
            let mOff = tMenu.jqDragView.offset();
            if (tMenu.type === "horizontal") {
                lines.push({o: tMenu, type: tMenu.type, p: mOff.top, a: 1});
                lines.push({o: tMenu, type: tMenu.type, p: mOff.top + tMenu.jqDragView.height(), a: 2});
            } else {
                lines.push({o: tMenu, type: tMenu.type, p: mOff.left, a: 1});
                lines.push({o: tMenu, type: tMenu.type, p: mOff.left + tMenu.jqDragView.width(), a: 2});
            }
        }

        let best = 32;
        let pos = {x: x - menu.offX, y: y- menu.offY};
        let bestLine = {};
        for (const line of lines) {
            if (line.type === "horizontal") {
                if (Math.abs(y - line.p) < best) {
                    bestLine = line;
                    best = Math.abs(y - line.p);
                }
            } else if (Math.abs(x - line.p) < best) {
                bestLine = line;
                best = Math.abs(x - line.p);
            }
        }

        if (bestLine === null) {
            if (y < off.top) {
                bestLine = lines[0];
            } else if (y > off.top + height) {
                bestLine = lines[1];
            } else if (x < off.left) {
                bestLine = lines[2];
            } else if (x > off.left + width) {
                bestLine = lines[3];
            }
        }

        if (bestLine !== null) {
            if (bestLine.type === "horizontal") {
                pos.x = off.left;
                pos.y = bestLine.p;
            } else {
                pos.x = bestLine.p;
                pos.y = off.top;
            }
        }

        return {
            type : bestLine ? bestLine.type : "floating",
            menu : bestLine ? bestLine.o : null,
            a : bestLine ? bestLine.a : 0,
            pos: pos
        };
    }

    dragMenuUpdateLine(menu, x, y) {
        let bestFit = this.dragFindBestFit(menu, x, y);
        if (bestFit.type === "floating") {
            this.dropLine.removeClass("dragged");
        } else {
            this.dropLine.addClass("dragged");
            if (bestFit.type === "horizontal") {
                this.dropLine.offset({left: bestFit.pos.x, top: bestFit.pos.y + (!bestFit.menu && bestFit.a === 2? -4 : 0)});
                this.dropLine.addClass("vertical");
                this.dropLine.removeClass("horizontal");
            } else {
                this.dropLine.offset({left: bestFit.pos.x + (!bestFit.menu && bestFit.a === 2? -4 : 0), top: bestFit.pos.y});
                this.dropLine.addClass("horizontal");
                this.dropLine.removeClass("vertical");
            }
        }
    }

    dragDropMenu(menu, x, y) {
        this.dropLine.removeClass("dragged");
        if (menu === undefined) {
            return;
        }

        let bestFit = this.dragFindBestFit(menu, x, y);
        if (bestFit.type === "floating") {

            let width = this.jqSplitVer.width();
            let height = this.jqSplitVer.height();
            let off = this.jqSplitVer.offset();

            menu.floating = true;
            menu.jqDragView.addClass("floating");
            menu.jqDragView.offset({
                left: Math.min(off.left + width - menu.jqDragView.width(), Math.max(off.left, bestFit.pos.x)),
                top: Math.min(off.top + height - menu.jqDragView.height(), Math.max(off.top, bestFit.pos.y))
            });
        } else {
            menu.floating = false;
            menu.jqDragView.removeClass("floating");
            menu.jqDragView.css({left: 0, top: 0});
            menu.jqDragView.removeClass(menu.type);
            menu.jqDragView.addClass(bestFit.type);
            menu.type = bestFit.type;

            if (bestFit.menu === null) {
                menu.jqDragView.detach();
                if (bestFit.type === "vertical") {
                    if (bestFit.a === 1) {
                        this.jqSplitHor.prepend(menu.jqDragView);
                    } else {
                        this.jqSplitHor.append(menu.jqDragView);
                    }
                } else {
                    if (bestFit.a === 1) {
                        this.jqSplitVer.prepend(menu.jqDragView);
                    } else {
                        this.jqSplitVer.append(menu.jqDragView);
                    }
                }
            } else if (bestFit.menu !== menu) {
                menu.jqDragView.detach();
                if (bestFit.a === 1) {
                    bestFit.menu.jqDragView.before(menu.jqDragView);
                } else {
                    bestFit.menu.jqDragView.after(menu.jqDragView);
                }
            }
        }
    }

    selectTool(tool) {
        this.selectedTool?.setSelected(false);
        this.selectedTool = tool;
        this.selectedTool.setSelected(true);
        this.brushMenu.updatePreview();
    }

    /**
     *
     * @param layer {SpriteLayer}
     */
    selectLayer(layer) {
        this.selectedLayer = layer;
        this.canvasBaked = false;
        this.canvasLayer = null;

        this.layersMenu.layerSelect(layer);
    }

    /**
     *
     * @param frame {SpriteFrame}
     */
    selectFrame(frame) {
        this.selectedFrame = frame;
        this.framesMenu.frameSelect(frame);
        this.layersMenu.layerReplaceAll(frame.layers);

        this.selectLayer(frame.layers[0]);
    }

    // Historic

    toolStart(pointerColor, alpha, ctrl, alt, shift) {
        let layerView = this.layersMenu.getLayer(this.selectedLayer);
        layerView.jqImg.css({"display" : "none"});

        this.canvas.css({"visibility" : "visible", "z-index" : layerView.zindex+1});
        this.canvasB.css({"visibility" : "visible", "z-index" : layerView.zindex+2, "opacity" : alpha / 255});

        if (this.canvasLayer !== this.selectedLayer) {
            this.canvasLayer = this.selectedLayer;
            let ctx = this.getMainContext();
            ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
            ctx.drawImage(layerView.jqImg[0], 0, 0);
        }

        this.canvasBaked = false;
        this.selectedTool.start(pointerColor, alpha, this.getMainContext(), this.getTempContext(), ctrl, alt, shift);
    }

    toolEnd() {
        this.selectedTool.end();

        let layerView = this.layersMenu.getLayer(this.selectedLayer);
        layerView.jqImg.css({"display" : ""});

        this.canvas.css({"visibility" : "hidden"});
        this.canvasB.css({"visibility" : "hidden"});
        this.selectedLayer.setImage(this.canvas[0].toDataURL());
        layerView.update();

        let frameView = this.framesMenu.getFrame(this.selectedFrame);
        frameView.updateThumbnail();
    }

    layerAdd(image, index) {
        let layer = new SpriteLayer(image, true);
        if (index === undefined) {
            this.selectedFrame.layers.push(layer);
        } else {
            this.selectedFrame.layers.splice(index + 1, 0, layer);
        }

        this.layersMenu.layerAdd(layer, index);
        this.selectLayer(layer);
    }

    layerMove(layerA, layerB) {
        let indexA = this.selectedFrame.layers.indexOf(layerA);
        this.selectedFrame.layers.splice(indexA, 1);
        if (!layerB) {
            this.selectedFrame.layers.push(layerA);
        } else {
            let indexB = this.selectedFrame.layers.indexOf(layerB);
            this.selectedFrame.layers.splice(indexB, 0, layerA);
        }

        this.layersMenu.layerMove(layerA, layerB);
    }

    layerRemove(layer) {
        let index = this.selectedFrame.layers.indexOf(layer);
        this.selectedFrame.layers.splice(index, 1);
        this.layersMenu.layerRemove(layer);
        if (this.selectedLayer === layer) {
            this.selectLayer(Math.min(this.selectedFrame.layers.length - 1, index));
        }
    }

    frameAdd(layers, index) {
        let frame = new SpriteFrame(layers);
        if (index === undefined) {
            this.frames.push(frame);
        } else {
            this.frames.splice(index + 1, 0, frame);
        }

        this.framesMenu.frameAdd(frame, index);
        this.selectFrame(frame);
    }

    frameMove(frameA, frameB) {
        let indexA = this.frames.indexOf(frameA);
        this.frames.splice(indexA, 1);
        if (frameB === undefined) {
            this.frames.push(frameA);
        } else {
            let indexB = this.frames.indexOf(frameB);
            this.frames.splice(indexB, 0, frameA);
        }

        this.framesMenu.frameMove(frameA, frameB);
    }

    frameRemove(frame) {
        let index = this.frames.indexOf(frame);
        this.frames.splice(index, 1);
        this.framesMenu.frameRemove(frame);
        if (this.selectedFrame === frame) {
            this.selectFrame(Math.min(this.frames.length - 1, index));
        }
    }
}