import {SpriteToolBrush} from "./SpriteToolBrush.js";
import {hexToRgb, hsvToRgb, rgbFuncToHex, rgbToHex, rgbToHsv} from "../../../Colors.js";
import {BezierCurve} from "../effects/BezierCurve.js";

export class SpriteToolShapes extends SpriteToolBrush {

    bezierMode = false;
    polygon = {};
    polygonScale = {};

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.hardness = 100;

        this.jqLineA = $("<div class='sprite-pivot-line'></div>");
        this.jqLineB = $("<div class='sprite-pivot-line'></div>");
    }

    onSelected() {
        this.brushData = {};
        this.editor.brushMenu.setSize(this.size);
        this.editor.brushMenu.setSizeEnabled(true);
        this.editor.brushMenu.setFlowEnabled(false);
        this.editor.brushMenu.setHardness(this.hardness);
        this.editor.brushMenu.setHardnessEnabled("bool");
        this.editor.brushMenu.setShapeMode();
    }

    onUnselected() {
        if (this.editor.tsBox.isOpen) {
            this.mouseSaveTransform(this.editor.tsBox);
            return;
        }
        super.onUnselected();
    }

    updateCanvasCursor(pos) {
        this.editor.canvasCursor.css("display", "none");
        this.editor.canvasView.css("cursor", "url(cursor-cross.png) 10 10, crosshair");
    }

    updatePreview(ctx) {
        let config = this.getConfig();
        let size = Math.min(30, config.size);
        let hardness = config.hardness;
        let color = "#000000FF";
        let pixelMode = hardness > 0.5;
        let mode = config.shape;

        let tempCtx = this.getSrcCanvas();
        this.resetContext(tempCtx.getContext("2d"));
        if (pixelMode) {
            this.generatePixelImage(tempCtx, size, color);
        } else {
            this.generateBrushImage(tempCtx, size, hardness, color);
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 80, 80);

        let pts = [];
        if (mode === 1) {
            pts = [{x: 15, y:15}, {x: 65, y:65}];
        } else if (mode === 2) {
            pts = [{x: 15, y:15}, {x: 65, y:65}];
        } else if (mode === 4) {
            pts = [{x: 15, y:15}, {x: 65, y:15}, {x: 65, y:65}, {x: 15, y:65}];
        } else {
            for (let i = 0; i < mode; i++) {
                let angle = ((Math.PI * 2) / mode * i) - (Math.PI / 2) + (1 - mode % 2) * Math.PI / mode;
                pts.push({x: Math.round(40 + Math.cos(angle) * 30), y: Math.round(40 + Math.sin(angle) * 30)});
            }
            if (mode === 3) {
                for(const pt of pts) {
                    pt.y += 8;
                }
            }
        }
        if (pixelMode) {
            if (mode === 2) {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, 80, 80);
                let off = size / 2 + 5;
                let d = 80 - off * 2;
                for (let i = 0; i < 0.99; i += 0.1) {
                    SpriteToolBrush.drawPixelLineCustom(
                        {x: i * d + off, y: this.apply(i) * d + off},
                        {x: (i + 0.1) * d + off, y: this.apply(i + 0.1) * d + off},
                        (x, y) => ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size)
                    );
                }
            } else if (mode === 9) {
                this.drawEllipse(10, 10, 70, 70,
                    (x, y) => {
                        ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size)
                    });
            } else {
                for (let i = 0; i < pts.length; i++) {
                    SpriteToolShapes.drawPixelLineCustom(pts[i], pts[i === pts.length -1 ? 0 : i + 1],
                        (x, y) => ctx.drawImage(tempCtx, 0, 0, size, size, Math.round(x - size / 2), Math.round(y - size / 2), size, size));
                }
            }
        } else {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            if (mode === 2) {
                ctx.moveTo(10, 10);
                ctx.bezierCurveTo(40, 10, 40, 70, 70, 70);
            } else if (mode === 9) {
                ctx.ellipse(40, 40, 30, 30,0 ,0,Math.PI * 2);
            } else {
                if (size % 2 === 1) {
                    ctx.moveTo(pts[0].x + 0.5, pts[0].y + 0.5);
                } else {
                    ctx.moveTo(pts[0].x, pts[0].y);
                }
                for (let i = 1; i < pts.length; i++) {
                    if (size % 2 === 1) {
                        ctx.lineTo(pts[i].x + 0.5, pts[i].y + 0.5);
                    } else {
                        ctx.lineTo(pts[i].x, pts[i].y);
                    }
                }
                if (mode >= 3) {
                    ctx.closePath();
                }
            }
            ctx.stroke();
        }
    }

    start(color, alpha, ctx, ctxTemp, ctrl, alt, shift) {
        super.start(color, alpha, ctx, ctxTemp, ctrl, alt, shift);

        let config = this.getConfig();
        this.size = config.size;
        this.flow = config.flow;
        this.hardness = config.hardness;
        this.color = color.length === 9 ? color : color + "FF";
        this.alpha = alpha;
        this.dist = 0;
        this.clipping = this.editor.selectionClip;

        this.ctx = ctxTemp;
        this.ctxFinal = ctx;
        this.mode = config.shape;
        this.pixelMode = this.hardness > 0.5;
        this.updateBrushCanvas();

        this.ctx.fillStyle = "none";
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.size;
    }

    end() {
        this.jqLineA.detach();
        this.jqLineB.detach();
        if (this.ctxFinal) {
            this.ctxFinal.globalAlpha = this.alpha / 255;
            this.ctxFinal.drawImage(this.ctx.canvas, 0, 0);
            this.ctxFinal.globalAlpha = 1;
            this.ctxFinal = null;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }
        super.end();
    }

    mouseDown(pos, ctrl, alt, shift) {
        if (this.editor.tsBox.isOpen) {
            this.mouseSaveTransform(this.editor.tsBox);
            this.editor.toolStart(this.editor.dragPaintCol, this.dragPaintAlpha, false, false, false);
        }

        this.align = shift;
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};

        this.prevPos = pos;
        this.initPos = pos;
        this.endPos = pos;
    }

    mouseMove(pos, ctrl, alt, shift) {
        if ((pos.x === this.prevPos.x && pos.y === this.prevPos.y) ||
            (pos.x === this.initPos.x && pos.y === this.initPos.y)) {
            return;
        }
        this.align = shift;
        this.computeAlign(pos);
        this.endPos = pos;

        let polygon = this.createFinalPolygon(this.initPos, this.endPos, this.pixelMode);
        this.drawPolygon(this.pixelMode, polygon,
            polygon.minx, polygon.miny, polygon.maxx, polygon.maxy, 0, 1, 1, null, null);

        this.prevPos = pos;
    }

    mouseUp(pos) {
        this.restart = false;
        if (pos.x === this.initPos.x && pos.y === this.initPos.y) {
            this.editor.toolEnd();
            return;
        }
        if (this.mode === 1) {
            this.editor.toolEnd();
            return;
        }
        this.polygon = this.createFinalPolygon(this.initPos, this.endPos, this.pixelMode);
        this.polygonScale = this.createFinalPolygon({x: 0, y: 0},
            {
                x: (this.endPos.x - this.initPos.x) * 100,
                y: (this.endPos.y - this.initPos.y) * 100
            }, false);

        this.editor.tsBox.onUpdate = (x1, y1, x2, y2, angle, sx, sy, ha, hb) => this.boxUpdate(x1, y1, x2, y2, angle, sx, sy, ha, hb);
        if (this.mode === 2) {
            this.editor.tsBox.open(pos, this.polygon.minx, this.polygon.miny, this.polygon.width, this.polygon.height, null, this.polygon[1], this.polygon[2]);

            this.editor.canvasScl.append(this.jqLineA);
            this.editor.canvasScl.append(this.jqLineB);
        } else {
            this.editor.tsBox.open(pos, this.polygon.minx, this.polygon.miny, this.polygon.width, this.polygon.height, null);
        }
        this.editor.tsBox.leave();
    }

    boxUpdate(x1, y1, x2, y2, a, signX, signY, handleA, handleB) {
        let polygon;
        let identity = Math.abs((x2 - x1) - (this.polygon.maxx - this.polygon.minx)) < 0.001
            && Math.abs((y2 - y1) - (this.polygon.maxy - this.polygon.miny)) < 0.001;

        if (identity || this.mode === 1 || this.mode === 2 || this.mode === 4 || this.mode === 9) {
            polygon = this.polygon;
        } else {
            polygon = this.polygonScale;
        }

        if (Math.abs(a) < 0.001) {
            a = 0;
        }

        if (this.mode === 2) {
            handleA.x = handleA.x * polygon.width + polygon.minx;
            handleA.y = handleA.y * polygon.height + polygon.miny;
            handleB.x = handleB.x * polygon.width + polygon.minx;
            handleB.y = handleB.y * polygon.height + polygon.miny;

            let c = {
                x: (polygon.maxx + polygon.minx) / 2,
                y: (polygon.maxy + polygon.miny) / 2
            };
            let s = {
                x: (x2 - x1) / (polygon.maxx - polygon.minx) * signX,
                y: (y2 - y1) / (polygon.maxy - polygon.miny) * signY
            };
            let m = {
                x: Math.round((x2 + x1) / 2 - c.x),
                y: Math.round((y2 + y1) / 2 - c.y)
            };
            let mt = {c, s, m, a, cos: Math.cos(a), sin: Math.sin(a), signX, signY, x1, x2, y1, y2};
            let h1 = this.tPt(polygon, 0, mt);
            let tp1 = this.tPt(handleA, null, mt);
            let tp2 = this.tPt(handleB, null, mt);
            let h2 = this.tPt(polygon, 3, mt);

            h1.x += 0.5;
            h2.x += 0.5;
            h1.y += 0.5;
            h2.y += 0.5;
            tp1.x += 0.5;
            tp2.x += 0.5;
            tp1.y += 0.5;
            tp2.y += 0.5;

            this.jqLineA.css({width: "2px", transform: ""});
            this.jqLineA.css({left: h1.x * this.editor.zoomStep, top: h1.y * this.editor.zoomStep});
            this.jqLineB.css({width: "2px", transform: ""});
            this.jqLineB.css({left: h2.x * this.editor.zoomStep, top: h2.y * this.editor.zoomStep});

            let dist = Math.sqrt((tp1.x - h1.x) * (tp1.x - h1.x) + (tp1.y - h1.y) * (tp1.y - h1.y));
            let dist2 = Math.sqrt((tp2.x - h2.x) * (tp2.x - h2.x) + (tp2.y - h2.y) * (tp2.y - h2.y));
            let angle = Math.atan2(-(h1.y - tp1.y), -(h1.x - tp1.x));
            let angle2 = Math.atan2(-(h2.y - tp2.y), -(h2.x - tp2.x));
            this.jqLineA.css({width: dist * this.editor.zoomStep, transform: "rotate(" + angle + "rad)"});
            this.jqLineB.css({width: dist2 * this.editor.zoomStep, transform: "rotate(" + angle2 + "rad)"});
        }

        this.drawPolygon(this.pixelMode, polygon, x1, y1, x2, y2, a, 1, 1, handleA, handleB);
    }

    mouseSaveTransform() {
        this.editor.tsBox.onUpdate = null;
        this.editor.toolEnd();
        this.editor.tsBox.close();
    }

    tPt(polygon, n, mt) {
        let move = mt.m;
        let center = mt.c;
        let scale = mt.s;

        let pt = n === null ? polygon : polygon[n];
        let ex = (pt.x - center.x) * scale.x + move.x + center.x;
        let ey = (pt.y - center.y) * scale.y + move.y + center.y;

        if (n !== null) {
            if (scale.x > 0) {
                if (pt.x === polygon.minx) ex = mt.x1;
                if (pt.x === polygon.maxx - 1) ex = mt.x2 - 1;
            } else {
                if (pt.x === polygon.minx) ex = mt.x2 - 1;
                if (pt.x === polygon.maxx - 1) ex = mt.x1;
            }
            if (scale.y > 0) {
                if (pt.y === polygon.miny) ey = mt.y1;
                if (pt.y === polygon.maxy - 1) ey = mt.y2 - 1;
            } else {
                if (pt.y === polygon.miny) ey = mt.y2 - 1;
                if (pt.y === polygon.maxy - 1) ey = mt.y1;
            }
        }

        if (mt.a !== 0) {
            ex -= center.x + move.x;
            ey -= center.y + move.y;

            let xnew = ex * mt.cos - ey * mt.sin;
            let ynew = ex * mt.sin + ey * mt.cos;

            ex = xnew + center.x + move.x;
            ey = ynew + center.y + move.y;
        }

        return {
            x : ex,
            y : ey
        };
    }

    drawPolygon(pixelMode, polygon, x1, y1, x2, y2, a, signX, signY, handleA, handleB) {
        this.clear();

        let c = {
            x: (polygon.maxx + polygon.minx) / 2,
            y: (polygon.maxy + polygon.miny) / 2
        };
        let s = {
            x: (x2 - x1) / (polygon.maxx - polygon.minx) * signX,
            y: (y2 - y1) / (polygon.maxy - polygon.miny) * signY
        };
        let m = {
            x: Math.round((x2 + x1) / 2 - c.x),
            y: Math.round((y2 + y1) / 2 - c.y)
        };
        let mt = {c, s, m, a, cos: Math.cos(a), sin: Math.sin(a), signX, signY, x1, x2, y1, y2};

        if (pixelMode) {
            if (this.mode === 2) {
                let p = this.tPt(polygon, 0, mt);
                let p1 = handleA ? this.tPt(handleA, null, mt) : this.tPt(polygon, 1, mt);
                let p2 = handleB ? this.tPt(handleB, null, mt) : this.tPt(polygon, 2, mt);
                let p3 = this.tPt(polygon, 3, mt);
                let lines = [];
                BezierCurve.iterateBezier(
                    p.x, p.y, p1.x, p1.y,
                    p2.x, p2.y, p3.x, p3.y,
                    (x, y) => lines.push({x, y})
                );
                for (let i = 0; i < lines.length - 1; i++) {
                    this.drawPixelLine(lines[i], lines[i + 1]);
                }

            } else if (this.mode === 9) {
                if (a === 0) {
                    this.drawEllipse(x1, y1, x2 - 1, y2 - 1, (x, y) => this.drawBrush(x, y));
                } else {
                    for (let i = 0; i < polygon.length - 1; i += 3) {
                        let p0 = this.tPt(polygon, i, mt);
                        let p1 = this.tPt(polygon, i + 1, mt);
                        let p2 = this.tPt(polygon, i + 2, mt);
                        let p3 = this.tPt(polygon, i + 3, mt);
                        let lines = [];
                        BezierCurve.iterateBezier(
                            p0.x, p0.y, p1.x, p1.y,
                            p2.x, p2.y, p3.x, p3.y,
                            (x, y) => lines.push({x, y})
                        );
                        for (let i = 0; i < lines.length - 1; i++) {
                            this.drawPixelLine(lines[i], lines[i + 1]);
                        }
                    }
                }

            } else {
                for (let i = 0; i < polygon.length; i++) {
                    let p1 = i + 1 === polygon.length ? 0 : i + 1;
                    if (polygon[i].r) {
                        this.drawPixelLine(this.tPt(polygon, p1, mt), this.tPt(polygon, i, mt));
                    } else {
                        this.drawPixelLine(this.tPt(polygon, i, mt), this.tPt(polygon, p1, mt));
                    }
                    if (this.mode === 1) break;
                }
            }
        } else {
            this.ctx.beginPath();
            if (this.size % 2 === 1) {
                this.ctx.translate(0.5, 0.5);
            }

            if (this.mode === 2) {
                let p = this.tPt(polygon, 0, mt);
                let p1 = handleA ? this.tPt(handleA, null, mt) : this.tPt(polygon, 1, mt);
                let p2 = handleB ? this.tPt(handleB, null, mt) : this.tPt(polygon, 2, mt);
                let p3 = this.tPt(polygon, 3, mt);
                this.ctx.moveTo(p.x, p.y);
                this.ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

            } else if (this.mode === 9) {
                if (a === 0) {
                    let cx = (x1 + (x2 - 1)) / 2;
                    let cy = (y1 + (y2 - 1)) / 2;
                    let w = Math.abs((x2 - 1) - x1) / 2;
                    let h = Math.abs((y2 - 1) - y1) / 2;
                    this.ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);

                } else {
                    for (let i = 0; i < polygon.length - 1; i += 3) {
                        let p0 = this.tPt(polygon, i, mt);
                        let p1 = this.tPt(polygon, i + 1, mt);
                        let p2 = this.tPt(polygon, i + 2, mt);
                        let p3 = this.tPt(polygon, i + 3, mt);
                        this.ctx.moveTo(p0.x, p0.y);
                        this.ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                    }
                }
            } else {
                let p = this.tPt(polygon, 0, mt);
                this.ctx.moveTo(p.x, p.y);
                for (let i = 1; i < polygon.length; i++) {
                    p = this.tPt(polygon, i, mt);
                    this.ctx.lineTo(p.x, p.y);
                }
                if (this.mode !== 1) {
                    this.ctx.closePath();
                }
            }
            this.ctx.stroke();
            this.ctx.resetTransform();
        }
        this.clip();
    }

    drawEllipse(x0, y0, x1, y1, drawPoint) {
        let xb, yb, xc, yc;

        // Calculate height
        yb = yc = Math.floor((y0 + y1) / 2);
        let qb = (y0 < y1) ? (y1 - y0) : (y0 - y1);
        let qy = qb;
        let dy = Math.floor(qb / 2);
        if (qb % 2 !== 0)
            // Bounding box has even pixel height
            yc++;

        // Calculate width
        xb = xc = Math.floor((x0 + x1) / 2);
        let qa = (x0 < x1) ? (x1 - x0) : (x0 - x1);
        let qx = qa % 2;
        let dx = 0;
        let qt = qa * qa + qb * qb - 2 * qa * qa * qb;
        if (qx !== 0) {
            // Bounding box has even pixel width
            xc++;
            qt += 3 * qb * qb;
        }

        // Start at (dx, dy) = (0, b) and iterate until (a, 0) is reached
        while (qy >= 0 && qx <= qa) {
            // Draw the new points

            drawPoint(xb - dx, yb - dy);
            if (dx !== 0 || xb !== xc) {
                drawPoint(xc + dx, yb - dy);
                if (dy !== 0 || yb !== yc)
                    drawPoint(xc + dx, yc + dy);
            }
            if (dy !== 0 || yb !== yc)
                drawPoint(xb - dx, yc + dy);

            // If a (+1, 0) step stays inside the ellipse, do it
            if (qt + 2 * qb * qb * qx + 3 * qb * qb <= 0 ||
                qt + 2 * qa * qa * qy - qa * qa <= 0) {
                qt += 8 * qb * qb + 4 * qb * qb * qx;
                dx++;
                qx += 2;
                // If a (0, -1) step stays outside the ellipse, do it
            } else if (qt - 2 * qa * qa * qy + 3 * qa * qa > 0) {
                qt += 8 * qa * qa - 4 * qa * qa * qy;
                dy--;
                qy -= 2;
            } else {
                qt += 8 * qb * qb + 4 * qb * qb * qx + 8 * qa * qa - 4 * qa * qa * qy;
                dx++;
                qx += 2;
                dy--;
                qy -= 2;
            }
        }
    }

    createFinalPolygon(init, pos, precise) {
        let polygon = this.createVisualPolygon(init, pos, precise);
        let minx = polygon[0].x, miny = polygon[0].y, maxx = polygon[0].x, maxy = polygon[0].y;
        for (let i = 0; i < polygon.length; i++) {
            minx = Math.min(polygon[i].x, minx);
            miny = Math.min(polygon[i].y, miny);
            maxx = Math.max(polygon[i].x, maxx);
            maxy = Math.max(polygon[i].y, maxy);
        }
        polygon.minx = minx;
        polygon.miny = miny;
        polygon.maxx = maxx + 1;
        polygon.maxy = maxy + 1;
        polygon.mode = this.mode;
        polygon.width = maxx - minx + 1;
        polygon.height = maxy - miny + 1;
        return polygon;
    }

    createVisualPolygon(init, pos, precise) {
        let polygon;
        if (this.mode === 1) {
            polygon = [
                {x : init.x, y: init.y},
                {x : pos.x, y: pos.y}
            ];
        } else if (this.mode === 2) {
            polygon = [
                {x : init.x, y: init.y},
                {x : init.x * 0.9 + pos.x * 0.1, y: init.y * 0.5 + pos.y * 0.5},
                {x : init.x * 0.1 + pos.x * 0.9, y: init.y * 0.5 + pos.y * 0.5},
                {x : pos.x, y: pos.y}
            ];
        } else if (this.mode === 4) {
            polygon = [
                {x : init.x, y: init.y},
                {x : init.x, y: pos.y},
                {x : pos.x, y :pos.y},
                {x : pos.x, y: init.y}
            ];
        } else if (this.mode === 9) {
            polygon = this.createEllipse(
                Math.min(init.x, pos.x), Math.min(init.y, pos.y),
                Math.abs(init.x - pos.x), Math.abs(init.y - pos.y));
        } else {
            polygon = this.createShape(init, pos, precise);
        }

        if (this.mode !== 2 && this.mode !== 4 && this.mode !== 9) {
            this.rotPolygon(init, polygon);
        }
        return polygon;
    }

    createShape(init, pos, precise) {
        let w = Math.abs(pos.x - init.x);
        let h = Math.abs(pos.y - init.y);
        let size = (pos.x === init.x || pos.y === init.y) ? Math.max(w, h) : Math.round(Math.sqrt(w * w + h * h));
        if (size < 3) {
            return [
                {x : init.x, y: init.y},
                {x : pos.x, y: pos.y}
            ];
        } else if (precise && (pos.x === init.x || pos.y === init.y || (w === h && this.mode === 8))) {
            if (this.mode === 3) {
                return this.createTriangle(init, pos, size);
            } else if (this.mode === 5) {
                return this.createPentagon(init, pos, size);
            } else if (this.mode === 6) {
                return this.createHexagon(init, pos, size);
            } else if (this.mode === 7) {
                return this.createHeptagon(init, pos, size);
            } else {
                return this.createOctagon(init, pos, size);
            }
        } else {
            return this.createPolygon(init, pos, size);
        }
    }

    createPolygon(init, pos, size) {
        let ang = Math.PI * 2 / this.mode;
        let point = {x: init.x + size, y: init.y};

        let polygon = [
            {x: init.x, y: init.y},
            {x: pos.x, y: pos.y}
        ];
        for (let i = 1; i < this.mode; i++) {
            point.x = point.x + Math.cos(- ang * i) * size;
            point.y = point.y + Math.sin(- ang * i) * size;
            polygon.push({x: point.x, y: point.y});
        }
        return polygon;
    }

    createTriangle(init, pos, size) {
        // Main Rects
        let ix = init.x;
        let iy = init.y;
        let psx = ix + size;
        let psy = iy;

        let height = size - 1;

        // Center Top
        let cx = Math.round(ix + size / 2);
        let cy = iy - height;

        if (size % 2 === 1) {
            return [
                {x: ix          , y: iy},
                {x: pos.x       , y: pos.y},
                {x: psx - 1     , y: psy},
                {x: cx          , y: cy + 2},
                {x: cx - 1      , y: cy + 1},
                {x: ix + 1      , y: iy},
            ];
        } else {
            return [
                {x: ix          , y: iy},
                {x: pos.x       , y: pos.y},
                {x: psx - 1     , y: psy},
                {x: cx          , y: cy},
                {x: ix + 1      , y: iy},
            ];
        }
    }

    createPentagon(init, pos, size) {
        let height = Math.round(size * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2);

        // Main Rects
        let ix = init.x;
        let iy = init.y;
        let psx = ix + size;
        let psy = iy;

        // Brace
        let px1 = Math.round(size * Math.cos(Math.PI * 2 / 5));
        let py1 = px1 * 3;

        // Center Top
        let cx = Math.round(ix + size / 2);
        let cy = iy - height;

        if (size % 2 === 1) {
            return [
                {x: ix          , y: iy},
                {x: pos.x       , y: pos.y},
                {x: psx + px1   , y: psy - py1},
                {x: cx          , y: cy, r:1},
                {x: cx - 1      , y: cy, r:1},
                {x: ix - px1    , y: iy - py1, r:1}
            ];
        } else {
            return [
                {x: ix          , y: iy},
                {x: pos.x       , y: pos.y},
                {x: psx + px1   , y: psy - py1},
                {x: cx          , y: cy, r:1},
                {x: ix - px1    , y: iy - py1, r:1}
            ];
        }
    }

    createHexagon(init, pos, size) {
        // Main Rects
        let ix = init.x;
        let iy = init.y;
        let psx = ix + size;
        let psy = iy;

        // Brace
        let braceW = Math.round(size * Math.sqrt(2) / Math.sqrt(3) * 0.5);
        let halfHeight = braceW * 2;

        let px1 = braceW;
        let py1 = halfHeight;
        let ptx = ix + size;
        let pty = iy - halfHeight * 2 + 1;

        return [
            {x: ix              , y: iy},
            {x: pos.x           , y: pos.y},
            {x: psx + 1         , y: psy - 1},
            {x: psx + px1       , y: psy - py1},
            {x: psx + px1 - 1   , y: psy - py1 - 1},
            {x: ptx + 1         , y: pty + 1},
            {x: ptx             , y: pty},
            {x: ix              , y: pty},
            {x: ix - 1          , y: pty + 1},
            {x: ix - px1 + 1    , y: psy - py1 - 1},
            {x: ix - px1        , y: psy - py1},
            {x: ix - 1          , y: psy - 1}
        ];
    }

    createHeptagon(init, pos, size) {
        // Main Rects
        let ix = init.x;
        let iy = init.y;
        let psx = ix + size;
        let psy = iy;

        let height = size * 2.1907;

        let cx = Math.round(init.x + size / 2);
        let cx2 = Math.round(init.x + size / 2) - 1;
        let cy = init.y - height;

        // Brace
        let minor = Math.round(size / Math.sqrt(5));
        let major = minor * 2;

        // Brace
        let minor2 = Math.round(size / Math.sqrt(17));
        let major2 = minor2 * 4;

        // Brace
        let minor3 = Math.round(size * Math.sqrt(5) / Math.sqrt(11));
        let major3 = Math.round(minor3 * 1.2);

        if (size % 2 === 1) {
            return [
                {x: ix                  , y: iy},
                {x: pos.x               , y: pos.y},
                {x: psx + minor3        , y: psy - major3          },
                {x: cx + major          , y: cy + minor             },
                {x: cx                  , y: cy                     },
                {x: cx2                 , y: cy                     , r:1},
                {x: cx2 - major         , y: cy + minor             , r:1},
                {x: ix - minor3         , y: psy - major3           , r:1},
            ]
        } else {
            return [
                {x: ix                  , y: iy},
                {x: pos.x               , y: pos.y},
                {x: psx + minor3        , y: psy - major3           },
                {x: cx + major          , y: cy + minor             },
                {x: cx                  , y: cy                     },
                {x: cx - major          , y: cy + minor             , r:1},
                {x: ix - minor3         , y: psy - major3           , r:1},
            ];
        }
    }

    createOctagon(init, pos, size) {
        let ix = init.x;
        let iy = init.y;
        let psx = ix + size;
        let psy = iy;

        let brace = Math.round(size / Math.sqrt(2));
        let height = brace + size + brace;

        return [
            {x: ix              , y: iy},
            {x: pos.x           , y: pos.y},
            {x: psx + brace     , y: psy - brace},
            {x: psx + brace     , y: psy - brace - size},
            {x: psx             , y: psy - height},
            {x: ix              , y: psy - height},
            {x: ix - brace      , y: psy - brace - size},
            {x: ix - brace      , y: psy - brace}
        ];
    }

    createEllipse(x, y, width, height) {
        let cCtlPt = [];
        for (let i = 0; i < 13; i++) {
            cCtlPt.push({x:0, y:0});
        }

        const EToBConst = 0.2761423749154;

        let offset = {
            cx : Math.floor(width * EToBConst),
            cy : Math.floor(height * EToBConst)
        };

        let centre = {
            x : (x + x+width) / 2,
            y : (y + y+height) / 2
        };

        cCtlPt[0].x  = cCtlPt[1].x  = cCtlPt[11].x = cCtlPt[12].x = x;
        cCtlPt[5].x  = cCtlPt[6].x  = cCtlPt[7].x  = x + width;
        cCtlPt[2].x  = cCtlPt[10].x = centre.x - offset.cx;
        cCtlPt[4].x  = cCtlPt[8].x  = centre.x + offset.cx;
        cCtlPt[3].x  = cCtlPt[9].x  = centre.x;

        cCtlPt[2].y  = cCtlPt[3].y  = cCtlPt[4].y  = y;
        cCtlPt[8].y  = cCtlPt[9].y  = cCtlPt[10].y = y + height;
        cCtlPt[7].y  = cCtlPt[11].y = centre.y + offset.cy;
        cCtlPt[1].y  = cCtlPt[5].y  = centre.y - offset.cy;
        cCtlPt[0].y  = cCtlPt[12].y = cCtlPt[6].y  = centre.y;

        return cCtlPt;
    }

    rotPolygon(init, points) {
        let angInit = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
        if (Math.abs(angInit) > 0.00001) {
            let cos = Math.cos(angInit);
            let sin = Math.sin(angInit);
            for (let i = 2; i < points.length; i++) {
                this.rotPoint(init.x, init.y, cos, sin, points[i]);
            }
        }
        for (let i = 2; i < points.length; i++) {
            points[i].x = Math.round(points[i].x);
            points[i].y = Math.round(points[i].y);
        }
    }

    rotPoint(cx, cy, cos, sin, point) {
        point.x -= cx;
        point.y -= cy;

        let xnew = point.x * cos - point.y * sin;
        let ynew = point.x * sin + point.y * cos;

        point.x = xnew + cx;
        point.y = ynew + cy;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.imgWidth(), this.imgHeight());
    }

    computeAlign(pos) {
        if (!this.align) return;

        if (this.mode === 1) {
            let len = Math.sqrt(
                (this.initPos.x - pos.x) * (this.initPos.x - pos.x) +
                (this.initPos.y - pos.y) * (this.initPos.y - pos.y));
            let w = pos.x - this.initPos.x;
            let h = pos.y - this.initPos.y;
            let ws = Math.sign(w);
            let hs = Math.sign(h);
            let wa = Math.abs(w);
            let ha = Math.abs(h);
            if (w === 0) {
                pos.x = this.initPos.x;
            } else if (h === 0) {
                pos.y = this.initPos.y;
            } else if (wa > ha) {
                let diff = Math.round(wa / ha);
                ha = Math.abs(Math.round(Math.sin(Math.atan2(h, ha * ws * diff)) * len));
                if (diff <= 2) {
                    pos.x = this.initPos.x + ha * ws * diff;
                    pos.y = this.initPos.y + ha * hs;
                } else {
                    pos.y = this.initPos.y;
                }
            } else {
                let diff = Math.round(ha / wa);
                wa = Math.abs(Math.round(Math.cos(Math.atan2(wa * hs * diff, w)) * len));
                if (diff <= 2) {
                    pos.x = this.initPos.x + wa * ws;
                    pos.y = this.initPos.y + wa * hs * diff;
                } else {
                    pos.x = this.initPos.x;
                }
            }
        } else if (this.mode === 4 || this.mode === 9) {
            let len = Math.sqrt(
                (this.initPos.x - pos.x) * (this.initPos.x - pos.x) +
                (this.initPos.y - pos.y) * (this.initPos.y - pos.y)) / 1.4142;
            let signx = Math.sign(pos.x - this.initPos.x);
            let signy = Math.sign(pos.y - this.initPos.y);
            pos.x = Math.round(this.initPos.x + (signx === 0 ? 1 : signx) * len);
            pos.y = Math.round(this.initPos.y + (signy === 0 ? 1 : signy) * len);
        } else {
            if (Math.abs(pos.x - this.initPos.x) > Math.abs(pos.y - this.initPos.y)) {
                pos.y = this.initPos.y;
            } else if (Math.abs(pos.x - this.initPos.x) < Math.abs(pos.y - this.initPos.y)) {
                pos.x = this.initPos.x;
            }
        }
    }

    getColor(i, t) {
        let col = hsvToRgb(i/t, 1, 1);
        return rgbToHex(col.r, col.g, col.b, 128);
    }
}