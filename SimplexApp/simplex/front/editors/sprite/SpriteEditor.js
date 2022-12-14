import {Editor} from "../Editor.js";
import {Toolbar} from "../../Toolbar.js";
import {SpriteTool} from "./tools/SpriteTool.js";
import {SpriteToolPencil} from "./tools/SpriteToolPencil.js";
import {SpriteToolBrush} from "./tools/SpriteToolBrush.js";
import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteMenuLayers} from "./SpriteMenuLayers.js";
import {SpriteMenuBrush} from "./SpriteMenuBrush.js";
import {SpriteMenuFrames} from "./SpriteMenuFrames.js";
import {SpriteToolSpray} from "./tools/SpriteToolSpray.js";
import {SpriteToolEraser} from "./tools/SpriteToolEraser.js";
import {SpriteToolSmudge} from "./tools/SpriteToolSmudge.js";
import {SpriteToolBucket} from "./tools/SpriteToolBucket.js";
import {SpriteMenuColor} from "./SpriteMenuColor.js";
import {SpriteMenuTools} from "./SpriteMenuTools.js";
import {SpriteToolColor} from "./tools/SpriteToolColor.js";
import {SpriteMenuGradient} from "./SpriteMenuGradient.js";
import {SpriteToolSelect} from "./tools/SpriteToolSelect.js";

export class SpriteEditor extends Editor {
    static pageModel = null;

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function (response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }

    jqRoot = null;
    Toolbar = null;

    selectedTool = null;
    toolMenus = [];
    zoomStep = 1;
    zoomPos = {};
    imageWidth = 400;
    imageHeight = 200;
    layers = [];
    frames = [];
    selectedLayer = null;
    selectedFrame = null;
    canvasLayer = null;

    selectionClip = false;

    // Brushes Settings
    color = "#000000";
    altColor = "#FF0040";
    alpha = 255;
    altAlpha = 255;

    //Loop
    loopSelection = null;

    constructor(asset) {
        super(asset);
        this.jqRoot = $(SpriteEditor.pageModel);
        this.jqRoot.onResize = () => this.onResize();
        this.jqRoot.onShow = () => this.onShow();
        this.jqRoot.onHide = () => this.onHide();
        this.jqRoot.onRemove = () => this.onHide();

        this.Toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.splitVer = this.jqRoot.find(".split-panel-ver");
        this.splitHor = this.jqRoot.find(".split-panel-hor");
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
    }

    getJqRoot() {
        return this.jqRoot;
    }

    onResize() {
        this.canvasPosition({x: 0, y: 0}, {x: 0, y: 0});
        this.Toolbar.update();
        for (let menu of this.toolMenus) {
            if (menu.floating) {
                let width = this.splitVer.width();
                let height = this.splitVer.height();
                let off = this.splitVer.offset();
                let pos = menu.jqDragView.offset();
                menu.jqDragView.offset({
                    left: Math.min(off.left + width - menu.jqDragView.width(), Math.max(off.left, pos.left)),
                    top: Math.min(off.top + height - menu.jqDragView.height(), Math.max(off.top, pos.top))
                });
            }
        }
    }

    onShow() {
        if (!this.ready) {
            this.configureToolbar();
            this.configureTools();
            this.configureCanvas();
            this.configureLayers();
            this.selectTool(this.toolPencil);
            this.ready = true;
        } else {
            this.selectedTool.onSelected();
        }
        if (!this.loopSelection) {
            this.loopSelection = setInterval((e) => {
                this.toolSelect.animate();
            }, 200);
        }
    }

    onHide() {
        if (this.loopSelection) {
            clearInterval(this.loopSelection);
            this.loopSelection = null;
        }
    }

    onRemove() {
    }

    getMainContext() {
        return this.canvasContext;
    }

    getTempContext() {
        return this.canvasContextB;
    }

    getSelectionContext() {
        return this.canvasContextC;
    }

    configureToolbar() {
        this.Toolbar.addItem("Undo", "undo", null);
        this.Toolbar.addItem("Redo", "redo", null);
        this.Toolbar.addItem("Import", null, null);
        this.Toolbar.addItem("Export", null, null);
        this.Toolbar.addItem("_", null, null);
        this.Toolbar.addItem("Resize", null, null);
        this.Toolbar.addItem("Physics Mask", null, null);
        this.Toolbar.addItem("Filters", null, null);
        this.Toolbar.addItem("_", null, null);
        this.Toolbar.addItem("Settings", null, null);
    }

    configureTools() {
        this.toolMenu = new SpriteMenuTools(this, this.jqRoot.find(".tools-view"), true);
        this.layersMenu = new SpriteMenuLayers(this, this.jqRoot.find(".layers-view"), true);
        this.framesMenu = new SpriteMenuFrames(this, this.jqRoot.find(".frames-view"), true);
        this.brushMenu = new SpriteMenuBrush(this, this.jqRoot.find(".brush-view"), false);
        this.colorMenu = new SpriteMenuColor(this, this.jqRoot.find(".color-picker-view"), false);
        this.gradMenu = new SpriteMenuGradient(this, this.jqRoot.find(".gradient-view"), false);
        this.toolMenus.push(this.toolMenu);
        this.toolMenus.push(this.layersMenu);
        this.toolMenus.push(this.framesMenu);
        this.toolMenus.push(this.brushMenu);
        this.toolMenus.push(this.colorMenu);
        this.toolMenus.push(this.gradMenu);
        this.dropLine = this.jqRoot.find(".sprite-drop-line");

        this.toolSelect = new SpriteToolSelect(this, this.jqRoot.find(".tool-select"), this.brushMenu);
        this.toolPencil = new SpriteToolPencil(this, this.jqRoot.find(".tool-pencil"), this.brushMenu);
        this.toolBrush = new SpriteToolBrush(this, this.jqRoot.find(".tool-brush"), this.brushMenu);
        this.toolSpray = new SpriteToolSpray(this, this.jqRoot.find(".tool-spray"), this.brushMenu);
        this.toolEraser = new SpriteToolEraser(this, this.jqRoot.find(".tool-eraser"), this.brushMenu);
        this.toolSmudge = new SpriteToolSmudge(this, this.jqRoot.find(".tool-smudge"), this.brushMenu);
        this.toolBucket = new SpriteToolBucket(this, this.jqRoot.find(".tool-bucket"), this.gradMenu);
        this.toolShapes = new SpriteTool(this, this.jqRoot.find(".tool-shapes"));
        this.toolText = new SpriteTool(this, this.jqRoot.find(".tool-text"));
        this.toolColor = new SpriteToolColor(this, this.jqRoot.find(".tool-color"), this.colorMenu);
    }

    configureCanvas() {
        this.zoomStep = 0;
        this.canvasZoom(1);
        this.canvasPosition({x: this.canvasView.width() / 2, y: this.canvasView.height() / 2});

        this.canvasView.mousedown(e => this.canvasOnMouseDown(e));
        this.addWindowListener('mousemove', e => this.canvasOnMouseMove(e));
        this.addWindowListener('mouseup', e => this.canvasOnMouseUp(e));
        this.canvasView[0].addEventListener('wheel', e => this.canvasOnMouseScroll(e));

        this.canvasView.mousemove(e => {
            let off = this.canvasView.offset();
            this.updateCanvasCursor({x: e.pageX - off.left, y: e.pageY - off.top});
        });
        this.canvasView.mouseleave(e => this.canvasCursor.addClass("cursor-out"));
        this.canvasView.mouseenter(e => this.canvasCursor.removeClass("cursor-out"));

        this.canvasContext = this.canvas[0].getContext("2d");
        this.canvasContextB = this.canvasB[0].getContext("2d");
        this.canvasContextC = this.canvasC[0].getContext("2d");
    }

    configureLayers() {
        this.frameAdd();
    }

    convertCanvasPosition(e) {
        let off = this.canvasView.offset();
        let obj = {
            x: ((e.pageX - off.left) - (this.zoomPos.x - (this.imageWidth / 2 * this.zoomStep))) / this.zoomStep,
            y: ((e.pageY - off.top) - (this.zoomPos.y - (this.imageHeight / 2 * this.zoomStep))) / this.zoomStep,
        };
        obj.x = Math.floor(obj.x);
        obj.y = Math.floor(obj.y);
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
            } else if (e.button === 2) {
                this.dragPaintCol = this.altColor;
            }
            this.toolStart(this.dragPaintCol, e.button === 0 ? this.alpha : this.altAlpha, e.ctrlKey, e.altKey, e.shiftKey);
            this.selectedTool.mouseDown(this.dragPaintPos);
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
            this.selectedTool.mouseMove(this.dragPaintPos, this.dragPaintCol);
        }
    }

    canvasOnMouseUp(e) {
        if (this.dragPaint && e.button === this.dragButton) {
            this.dragPaintPos = this.convertCanvasPosition(e);
            this.selectedTool.mouseUp(this.dragPaintPos, this.dragPaintCol);
            this.dragPaint = false;
            this.toolEnd();
        }
        if (this.dragZoom && e.button === 1) {
            this.dragZoom = false;
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

        let width = this.splitVer.width();
        let height = this.splitVer.height();
        let off = this.splitVer.offset();

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
        let bestLine = null;
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

            let width = this.splitVer.width();
            let height = this.splitVer.height();
            let off = this.splitVer.offset();

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
                        this.splitHor.prepend(menu.jqDragView);
                    } else {
                        this.splitHor.append(menu.jqDragView);
                    }
                } else {
                    if (bestFit.a === 1) {
                        this.splitVer.prepend(menu.jqDragView);
                    } else {
                        this.splitVer.append(menu.jqDragView);
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

    selectLayer(layer) {
        this.layersMenu.layerSelect(layer);
    }

    selectFrame(frame) {
        this.canvasBaked = false;
        this.canvasLayer = null;
        this.framesMenu.frameSelect(frame);
    }

    getBrushConfig() {
        return this.toolMenus[3].getBrushConfig();
    }

    // Historic

    toolStart(pointerColor, alpha, ctrl, alt, shift) {
        this.canvas.css({"visibility" : "visible", "z-index" : this.selectedLayer.zindex+1});
        this.canvasB.css({"visibility" : "visible", "z-index" : this.selectedLayer.zindex+2, "opacity" : alpha / 255});
        this.selectedLayer.jqImg.css({"display" : "none"});

        if (this.canvasLayer !== this.selectedLayer) {
            this.canvasLayer = this.selectedLayer;
            let ctx = this.getMainContext();
            ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
            ctx.drawImage(this.selectedLayer.img, 0, 0);
        }

        this.canvasBaked = false;
        this.selectedTool.start(pointerColor, alpha, this.getMainContext(), this.getTempContext(), ctrl, alt, shift);
    }

    toolEnd() {
        this.selectedTool.end();

        this.selectedLayer.jqImg.css({"display" : ""});
        this.canvas.css({"visibility" : "hidden"});
        this.canvasB.css({"visibility" : "hidden"});
        this.selectedLayer.canvasDraw(this.canvas[0]);

        setTimeout(() => this.selectedFrame.updateThumbnail(), 5);
    }

    layerAdd(image, index) {
        this.layersMenu.layerAdd(image, index);
    }

    layerMove(layerA, layerB) {
        this.layersMenu.layerMove(layerA, layerB);
    }

    layerRemove(layer) {
        this.layersMenu.layerRemove(layer);
    }

    frameAdd() {
        this.framesMenu.frameAdd();
    }

    frameMove() {

    }

    frameRemove(frame) {
        this.framesMenu.frameRemove(frame);
    }
}