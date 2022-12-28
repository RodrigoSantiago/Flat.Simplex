import {Editor} from "../Editor.js";
import {Toolbar} from "../../Toolbar.js";
import {DragSystem} from "../../DragSystem.js";
import {SpriteTool} from "./SpriteTool.js";
import {SpriteToolPencil} from "./SpriteToolPencil.js";
import {SpriteToolBrush} from "./SpriteToolBrush.js";

class SpriteMenu {

    jqDragView = null;
    jqDragHolder = null;
    className = "";

    constructor(editor, jqDragView, className) {
        const self = this;
        this.editor = editor;
        this.jqDragView = jqDragView;
        this.className = className;
        this.jqDragView.find(".drag").mousedown(function (e) {
            if (DragSystem.drag(self)) {
                self.onDragStart(e);
            }
        });
    }

    onDragStart(e) {
        this.offX = e.clientX - this.jqDragView.offset().left;
        this.offY = e.clientY - this.jqDragView.offset().top;
        this.jqDragView.addClass("dragging");
        this.jqDragHolder = $("<div class='drag-holder'></div>");
        let child = this.jqDragView.children();
        child.detach();
        this.jqDragHolder.append(child);
        this.jqDragHolder.offset({
            left : e.clientX - this.jqDragView.offset().left -this.offX ,
            top : e.clientY - this.jqDragView.offset().top - this.offY
        });
        this.jqDragView.append(this.jqDragHolder);
    }

    onDragMove(e) {
        this.jqDragHolder.offset({left : e.pageX - this.offX, top : e.pageY - this.offY});
        this.editor.dragMenuUpdateLine({
            x : e.clientX - this.editor.splitVer.offset().left,
            y : e.clientY - this.editor.splitVer.offset().top
        });
    }

    onDragDrop(e) {
        this.editor.dragDropMenu({
            menu : this,
            x : e.clientX - this.editor.splitVer.offset().left,
            y : e.clientY - this.editor.splitVer.offset().top
        });
        this.onDragCancel(e);
    }

    onDragCancel(e) {
        this.editor.dragDropMenu();
        this.jqDragView.removeClass("dragging");
        let child = this.jqDragHolder.children();
        child.detach();
        this.jqDragView.append(child);
        this.jqDragHolder.remove();
        this.jqDragHolder = null;
    }
}

export class SpriteEditor extends Editor {
    static pageModel = null;

    static loadModel() {
        $('<div></div>').load("pages/sprite/sprite-editor.html", function(response, status, xhr) {
            SpriteEditor.pageModel = response;
        });
    }

    jqRoot = null;
    Toolbar = null;

    selectedTool = null;
    toolMenus = [];
    zoomStep = 1;
    zoomPos = {};
    imageWidth = 100;
    imageHeight = 100;

    constructor(asset) {
        super(asset);
        const self = this;
        this.jqRoot = $(SpriteEditor.pageModel);
        this.jqRoot.onResize = function (e) { self.onResize(); }
        this.Toolbar = new Toolbar(this.jqRoot.find(".toolbar"));
        this.splitVer = this.jqRoot.find(".split-panel-ver");
        this.splitHor = this.jqRoot.find(".split-panel-hor");
        this.canvas = this.jqRoot.find("canvas");
        this.canvasPos = this.jqRoot.find(".canvas-position");
        this.canvasScl = this.jqRoot.find(".canvas-owner");
        this.canvasView = this.jqRoot.find(".canvas-view");
        this.canvasBg = this.jqRoot.find(".canvas-background");
        this.canvas[0].width = this.imageWidth;
        this.canvas[0].height = this.imageHeight;
    }

    getJqRoot() {
        return this.jqRoot;
    }

    onResize() {
        if (!this.ready) {
            this.configureToolbar();
            this.configureTools();
            this.ready = true;
        }

        this.canvasPosition({x:0, y:0}, {x:0, y:0});
        this.Toolbar.update();
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
        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".tools-view"), "tools-view"));
        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".layers-view"), "layers-view"));
        this.toolMenus.push(new SpriteMenu(this, this.jqRoot.find(".frames-view"), "frames-view"));
        this.dropLine = this.jqRoot.find(".sprite-drop-line");

        const self = this;
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

        this.jqRoot.width();

        this.zoomStep = 0;
        this.canvasZoom(1);
        this.canvasPosition({ x : this.canvasView.width() / 2, y : this.canvasView.height() / 2});

        this.canvasView[0].addEventListener('wheel', function (e) {
            self.canvasScroll({
                x: e.pageX - self.canvasView.offset().left,
                y: e.pageY - self.canvasView.offset().top
            }, Math.sign(e.deltaY) * 30);
        });
        this.canvasView.mousedown(function (e) {
            if (e.which === 2) {
                self.dragZoom = true;
                self.dragZoomStart = {
                    x: e.pageX - self.canvasView.offset().left,
                    y: e.pageY - self.canvasView.offset().top
                };
            } else {
                self.dragPaint = true;
                self.dragPaintPos = self.convertCanvasPosition(e);
                if (e.which === 1) {
                    self.dragPaintCol = 1;
                } else if (e.which === 3) {
                    self.dragPaintCol = 2;
                }
                self.selectedTool.mouseDown(self.dragPaintPos, self.dragPaintCol);
            }
        });
        $(window).mousemove(function (e) {
            if (self.dragZoom) {
                let old = self.dragZoomStart;
                self.dragZoomStart = {
                    x: e.pageX - self.canvasView.offset().left,
                    y: e.pageY - self.canvasView.offset().top
                };
                self.canvasPosition(old, self.dragZoomStart);
            } else if (self.dragPaint) {
                self.dragPaintPos = self.convertCanvasPosition(e);
                self.selectedTool.mouseMove(self.dragPaintPos, self.dragPaintCol);
            }
        });
        $(window).mouseup(function (e) {
            if (self.dragPaint) {
                self.dragPaintPos = self.convertCanvasPosition(e);
                self.selectedTool.mouseUp(self.dragPaintPos, self.dragPaintCol);
            }
            self.dragZoom = false;
            self.dragPaint = false;
        });

        this.selectTool(this.toolPencil);
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

            this.canvasPosition({ x :bScreenX - screenX, y : bScreenY - screenY});
        }
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
            "min-width" : this.imageWidth * this.zoomStep,
            "max-width" : this.imageWidth * this.zoomStep,
            "min-height" : this.imageHeight * this.zoomStep,
            "max-height" : this.imageHeight * this.zoomStep
        });
        this.canvas.css("transform" , "scale(" + this.zoomStep + ")");

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

    dragFindBestFit(position) {
        let width = this.splitVer.width();
        let height = this.splitVer.height();
        let lineWidth = Math.min(this.dropLine.width(), this.dropLine.height()) / 2;

        let obj = null;
        let best = 9999;
        let pos = 9999;
        let point = 0;
        let type = "";
        for (const menu of this.toolMenus) {
            if (menu.jqDragView.parent()[0] === this.splitVer[0]) {
                let y1 = menu.jqDragView.position().top;
                let y2 = y1 + menu.jqDragView.height();
                if (best > Math.abs(position.y - y1)) {
                    obj = menu.jqDragView;
                    best = Math.abs(position.y - y1);
                    point = 1;
                    type = "horizontal";
                    pos = y1;
                }
                if (best > Math.abs(position.y - y2)) {
                    obj = menu.jqDragView;
                    best = Math.abs(position.y - y2);
                    point = 2;
                    type = "horizontal";
                    pos = y2;
                }
            } else {
                let x1 = menu.jqDragView.position().left;
                let x2 = x1 + menu.jqDragView.width();
                if (best > Math.abs(position.x - x1)) {
                    obj = menu.jqDragView;
                    best = Math.abs(position.x - x1);
                    point = 1;
                    type = "vertical";
                    pos = x1;
                }
                if (best > Math.abs(position.x - x2)) {
                    obj = menu.jqDragView;
                    best = Math.abs(position.x - x2);
                    point = 2;
                    type = "vertical";
                    pos = x2;
                }
            }
        }
        if (best > 48) {
            if (position.y < 48) {
                obj = null;
                point = 1;
                type = "horizontal";
                pos = 0;
            } else if (position.y > height - 48) {
                obj = null;
                point = 2;
                type = "horizontal";
                pos = height - lineWidth * 2;
            } else if (position.x < 48) {
                obj = null;
                point = 1;
                type = "vertical";
                pos = 0;
            } else if (position.x > width - 48) {
                obj = null;
                point = 2;
                type = "vertical";
                pos = width - lineWidth * 2;
            }
            best = 48;
        } else if (type === "vertical") {
            pos = Math.max(0, Math.min(pos, width - lineWidth * 2));
        } else if (type === "horizontal") {
            pos = Math.max(0, Math.min(pos, height - lineWidth * 2));
        }

        return {
            obj : obj,
            point : point,
            type : type,
            pos : pos,
            best : best
        };
    }

    dragMenuUpdateLine(position) {
        this.dropLine.addClass("dragged");

        let bestFit = this.dragFindBestFit(position);
        if (bestFit.best > 256) {
            this.dropLine.removeClass("dragged");
        } else if (bestFit.type === "horizontal") {
            this.dropLine.css({left : 0, top : bestFit.pos});
            this.dropLine.removeClass("vertical");
            this.dropLine.addClass("horizontal");
        } else {
            this.dropLine.css({left : bestFit.pos, top : 0});
            this.dropLine.removeClass("horizontal");
            this.dropLine.addClass("vertical");
        }
    }

    dragDropMenu(data) {
        this.dropLine.removeClass("dragged");
        if (data === undefined) {
            return;
        }

        let bestFit = this.dragFindBestFit(data);
        if (bestFit.best > 256) {
            return;
        }

        if (bestFit.obj === null) {
            data.menu.jqDragView.detach();
            if (bestFit.type === "vertical") {
                if (bestFit.point === 1) {
                    this.splitHor.prepend(data.menu.jqDragView);
                } else {
                    this.splitHor.append(data.menu.jqDragView);
                }
            } else {
                if (bestFit.point === 1) {
                    this.splitVer.prepend(data.menu.jqDragView);
                } else {
                    this.splitVer.append(data.menu.jqDragView);
                }
            }
        } else if (bestFit.obj[0] !== data.menu.jqDragView[0]) {
            data.menu.jqDragView.detach();
            if (bestFit.point === 1) {
                bestFit.obj.before(data.menu.jqDragView);
            } else {
                bestFit.obj.after(data.menu.jqDragView);
            }
        }
    }

    selectTool(tool) {
        this.selectedTool?.setSelected(false);
        this.selectedTool = tool;
        this.selectedTool.setSelected(true);
    }
}