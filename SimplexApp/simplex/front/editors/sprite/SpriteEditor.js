import {Editor} from "../Editor.js";
import {Toolbar} from "../../Toolbar.js";
import {DragSystem} from "../../DragSystem.js";
import {SpriteTool} from "./SpriteTool.js";
import {SpriteToolPencil} from "./SpriteToolPencil.js";
import {SpriteToolBrush} from "./SpriteToolBrush.js";

class SpriteMenu {

    jqDragView = null;
    jqDragHolder = null;
    dragged = false;
    floating = false;
    type = null;

    _updateTimer = null;

    constructor(editor, jqDragView) {
        const self = this;
        this.editor = editor;
        this.jqDragView = jqDragView;
        this.jqDragView.find(".drag").mousedown(function (e) {
            if (DragSystem.drag(self, e.button)) {
                self.onDragStart(e);
            }
        });
        this.floating = this.jqDragView.is(".floating");
        this.type = this.jqDragView.parent()[0] === editor.splitVer[0] ? "horizontal" : "vertical"
    }

    onDragStart(e) {
        let off = this.jqDragView.offset();
        this.offX = e.pageX - off.left;
        this.offY = e.pageY - off.top;
        this.dragged = true;
        this.jqDragView.addClass("dragging");
        this.jqDragHolder = $("<div class='drag-holder'></div>");
        let child = this.jqDragView.children();
        child.detach();
        this.jqDragHolder.append(child);
        this.jqDragView.append(this.jqDragHolder);
    }

    onDragMove(e) {
        this.jqDragHolder.offset({left: e.pageX - this.offX, top: e.pageY - this.offY});
        this._updateE = e;
        if (this._updateTimer === null) {
            const self = this;
            self._updateTimer = setTimeout(t => {
                self.editor.dragMenuUpdateLine(self, self._updateE.pageX - self.offX, self._updateE.pageY - self.offY);
                self._updateTimer = null;
            }, 100);
        }
    }

    onDragDrop(e) {
        if (!(this.once === 2)) {
            if (this.once) this.once ++;
            else this.once = 1;
        }
        this.editor.dragDropMenu(this, e.pageX - this.offX, e.pageY - this.offY);
        this.onDragCancel(e);
    }

    onDragCancel(e) {
        this.dragged = false;
        this.editor.dragDropMenu();
        this.jqDragView.removeClass("dragging");
        let child = this.jqDragHolder.children();
        child.detach();
        this.jqDragView.append(child);
        this.jqDragHolder.remove();
        this.jqDragHolder = null;
        if (this._updateTimer !== null) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }
    }
}

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
    imageHeight = 400;

    // Brushes Settings
    color = "#000000";
    altColor = "#FFFFFF";
    brushSize = 16;
    brushHardness = 0.80;
    brushSpacing = 0.25;

    constructor(asset) {
        super(asset);
        const self = this;
        this.jqRoot = $(SpriteEditor.pageModel);
        this.jqRoot.onResize = e => self.onResize();
        this.jqRoot.onShow = e => self.onShow();
        this.jqRoot.onHide = e => self.onHide();
        this.jqRoot.onRemove = e => self.onHide();

        this.Toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.splitVer = this.jqRoot.find(".split-panel-ver");
        this.splitHor = this.jqRoot.find(".split-panel-hor");
        this.canvas = this.jqRoot.find("canvas");
        this.canvasPos = this.jqRoot.find(".canvas-position");
        this.canvasScl = this.jqRoot.find(".canvas-owner");
        this.canvasView = this.jqRoot.find(".canvas-view");
        this.canvasBg = this.jqRoot.find(".canvas-background");
        this.canvasCursor = this.jqRoot.find(".canvas-cursor");
        this.canvas[0].width = this.imageWidth;
        this.canvas[0].height = this.imageHeight;
    }

    getJqRoot() {
        return this.jqRoot;
    }

    onResize() {
        this.canvasPosition({x: 0, y: 0}, {x: 0, y: 0});
        this.Toolbar.update();
    }

    onShow() {
        if (!this.ready) {
            this.configureToolbar();
            this.configureTools();
            this.configureCanvas();
            this.selectTool(this.toolPencil);
            this.ready = true;
        }
    }

    onHide() {

    }

    onRemove() {

    }

    getCanvas() {
        return this.canvas[0];
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
        const self = this;

        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".tools-view")));
        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".layers-view")));
        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".frames-view")));
        this.dropLine = this.jqRoot.find(".sprite-drop-line");

        this.toolSelect = new SpriteTool(this, this.jqRoot.find(".tool-select"));
        this.toolPencil = new SpriteToolPencil(this, this.jqRoot.find(".tool-pencil"));
        this.toolBrush = new SpriteToolBrush(this, this.jqRoot.find(".tool-brush"));
        this.toolSpray = new SpriteTool(this, this.jqRoot.find(".tool-spray"));
        this.toolEraser = new SpriteTool(this, this.jqRoot.find(".tool-eraser"));
        this.toolBucket = new SpriteTool(this, this.jqRoot.find(".tool-bucket"));
        this.toolShapes = new SpriteTool(this, this.jqRoot.find(".tool-shapes"));
        this.toolSmudge = new SpriteTool(this, this.jqRoot.find(".tool-smudge"));
        this.toolText = new SpriteTool(this, this.jqRoot.find(".tool-text"));
        this.toolZoom = new SpriteTool(this, this.jqRoot.find(".tool-zoom"));
    }

    configureCanvas() {
        const self = this;

        this.zoomStep = 0;
        this.canvasZoom(1);
        this.canvasPosition({x: this.canvasView.width() / 2, y: this.canvasView.height() / 2});

        this.canvasView.mousedown(e => self.canvasOnMouseDown(e));
        this.addWindowListener('mousemove', e => self.canvasOnMouseMove(e));
        this.addWindowListener('mouseup', e => self.canvasOnMouseUp(e));
        this.canvasView[0].addEventListener('wheel', e => self.canvasOnMouseScroll(e));

        this.canvasView.mousemove(e => {
            let off = self.canvasView.offset();
            self.updateCanvasCursor({x: e.pageX - off.left, y: e.pageY - off.top});
        });
        this.canvasView.mouseleave(e => self.canvasCursor.css("display", "none"));
        this.canvasView.mouseenter(e => self.canvasCursor.css("display", ""));
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
            this.selectedTool.mouseDown(this.dragPaintPos, this.dragPaintCol);
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

        let bgSize = 16;
        if (this.zoomStep >= 4 && this.zoomStep < 8) {
            bgSize = this.zoomStep * 4;
        } else if (this.zoomStep >= 8 && this.zoomStep < 16) {
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

    updateCanvasCursor(pos) {
        this.canvasCursor.css({left: pos.x, top: pos.y});
        this.selectedTool.updateCanvasCursor(pos);
    }

    dragFindBestFit(menu, x, y) {
        let width = this.splitVer.width();
        let height = this.splitVer.height();
        let off = this.splitVer.offset();

        let lines = [
            {o: null, type: "horizontal", p: off.top, a: 1},
            {o: null, type: "horizontal", p: off.top + height, a: 2},
            {o: null, type: "vertical", p: off.left, a: 1},
            {o: null, type: "vertical", p: off.left + width, a: 2}
        ];
        for (const menu of this.toolMenus) {
            if (menu.floating) continue;
            let mOff = menu.jqDragView.offset();
            if (menu.type === "horizontal") {
                lines.push({o: menu, type: menu.type, p: mOff.top, a: 1});
                lines.push({o: menu, type: menu.type, p: mOff.top + menu.jqDragView.height(), a: 2});
            } else {
                lines.push({o: menu, type: menu.type, p: mOff.left, a: 1});
                lines.push({o: menu, type: menu.type, p: mOff.left + menu.jqDragView.width(), a: 2});
            }
        }

        let best = 64;
        let pos = {x: x, y: y};
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
                this.dropLine.addClass("horizontal");
                this.dropLine.removeClass("vertical");
            } else {
                this.dropLine.offset({left: bestFit.pos.x + (!bestFit.menu && bestFit.a === 2? -4 : 0), top: bestFit.pos.y});
                this.dropLine.addClass("vertical");
                this.dropLine.removeClass("horizontal");
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
            menu.floating = true;
            menu.jqDragView.addClass("floating");
            menu.jqDragView.offset({left: bestFit.pos.x, top: bestFit.pos.y});
        } else {
            menu.floating = false;
            menu.jqDragView.removeClass("floating");
            menu.jqDragView.css({left: 0, top: 0});
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
    }
}