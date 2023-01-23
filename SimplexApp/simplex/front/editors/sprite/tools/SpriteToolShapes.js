import {SpriteToolBrush} from "./SpriteToolBrush.js";
import {hexToRgb, hsvToRgb, rgbFuncToHex, rgbToHex, rgbToHsv} from "../../../Colors.js";

export class SpriteToolShapes extends SpriteToolBrush {

    bezierMode = false;

    constructor(editor, jqButton, configMenu) {
        super(editor, jqButton, configMenu);
        this.hardness = 100;
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
                this.drawPixelCircle(10, 10, 70, 70,
                    (cx, cy, x, y, xff,yff) => {
                        ctx.drawImage(tempCtx, 0, 0, size, size, Math.round((cx + x + xff) - size / 2), Math.round((cy + y + yff) - size / 2), size, size);
                        ctx.drawImage(tempCtx, 0, 0, size, size, Math.round((cx + x + xff) - size / 2), Math.round((cy - y) - size / 2), size, size);
                        ctx.drawImage(tempCtx, 0, 0, size, size, Math.round((cx - x) - size / 2), Math.round((cy + y + yff) - size / 2), size, size);
                        ctx.drawImage(tempCtx, 0, 0, size, size, Math.round((cx - x) - size / 2), Math.round((cy - y) - size / 2), size, size);
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
    }

    end() {
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
        this.align = shift;
        this.min = {x: pos.x - this.size, y: pos.y - this.size};
        this.max = {x: pos.x + this.size, y: pos.y + this.size};

        this.prevPos = pos;
        this.initPos = pos;
        this.mouseMove(pos);
    }

    mouseMove(pos, ctrl, alt, shift) {
        if (pos.x === this.prevPos.x && pos.y === this.prevPos.y) {
            return;
        }
        this.align = shift;
        this.computeAlign(pos);
        this.min.x = Math.min(this.min.x, pos.x - this.size);
        this.min.y = Math.min(this.min.y, pos.y - this.size);
        this.max.x = Math.max(this.max.x, pos.x + this.size);
        this.max.y = Math.max(this.max.y, pos.y + this.size);

        this.clear();

        if (this.pixelMode) {
            if (this.mode === 1 || this.mode === 2) {
                this.drawPixelLine(this.initPos, pos);
            } else if (this.mode === 2) {

            } else if (this.mode === 4) {
                this.drawPixelLine(this.initPos, {x: this.initPos.x, y: pos.y});
                this.drawPixelLine({x: this.initPos.x, y: pos.y}, pos);
                this.drawPixelLine(pos, {x: pos.x, y: this.initPos.y});
                this.drawPixelLine({x: pos.x, y: this.initPos.y}, this.initPos);

            } else if (this.mode === 9) {
                this.drawPixelCircle(this.initPos.x, this.initPos.y, pos.x, pos.y,
                    (cx, cy, x, y, xff,yff) => this.drawCircleMirror(cx, cy, x, y, xff,yff));
            } else {
                this.drawPixelShape(pos);
            }
        } else {
            this.ctx.fillSyle = "none";
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.size;

            this.ctx.beginPath();
            if (this.size % 2 === 1) {
                this.ctx.translate(0.5, 0.5);
            }
            if (this.mode === 1 || this.mode === 2) {
                this.ctx.moveTo(this.initPos.x, this.initPos.y);
                this.ctx.lineTo(pos.x, pos.y);
            } else if (this.mode === 2) {

            } else if (this.mode === 3) {
                let len = Math.sqrt(
                    (this.initPos.x - pos.x) * (this.initPos.x - pos.x) +
                    (this.initPos.y - pos.y) * (this.initPos.y - pos.y));
                let ang = Math.atan2(this.initPos.y - pos.y, this.initPos.x - pos.x) + Math.PI * 0.333333;
                this.ctx.moveTo(this.initPos.x, this.initPos.y);
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.lineTo(pos.x + Math.cos(ang) * len, pos.y + Math.sin(ang) * len);
                this.ctx.closePath();

            } else if (this.mode === 4) {
                this.ctx.moveTo(this.initPos.x, this.initPos.y);
                this.ctx.lineTo(this.initPos.x, pos.y);
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.lineTo(pos.x, this.initPos.y);
                this.ctx.closePath();

            } else if (this.mode === 9) {
                let cx = (this.initPos.x + pos.x) / 2;
                let cy = (this.initPos.y + pos.y) / 2;
                this.ctx.ellipse(cx, cy, Math.abs(this.initPos.x - pos.x) / 2, Math.abs(this.initPos.y - pos.y) / 2, 0 , 0, Math.PI * 2);
            } else {
                this.drawShape(pos);
            }
            this.ctx.stroke();
            this.ctx.resetTransform();
        }
        this.clip();
        this.prevPos = pos;
    }

    mouseUp(pos) {
        this.editor.toolEnd();
    }

    drawShape(pos) {
        let len = Math.sqrt(
            (this.initPos.x - pos.x) * (this.initPos.x - pos.x) +
            (this.initPos.y - pos.y) * (this.initPos.y - pos.y));

        let angInit = Math.atan2(pos.y - this.initPos.y, pos.x - this.initPos.x);
        let ang = Math.PI * 2 / this.mode;

        this.ctx.moveTo(this.initPos.x, this.initPos.y);
        this.ctx.lineTo(pos.x, pos.y);
        let point = {x: pos.x, y: pos.y};

        for (let i = 1; i < this.mode; i++) {
            point.x = point.x + Math.cos(angInit - ang * i) * len;
            point.y = point.y + Math.sin(angInit - ang * i) * len;
            this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.closePath();
    }

    drawPixelShape(pos) {
        let w = Math.abs(pos.x - this.initPos.x);
        let h = Math.abs(pos.y - this.initPos.y);
        let size = (pos.x === this.initPos.x || pos.y === this.initPos.y) ? Math.max(w, h) : Math.round(Math.sqrt(w * w + h * h));
        if (size < 3) {
            this.drawPixelLine(this.initPos, pos);
        } else if (pos.x === this.initPos.x || pos.y === this.initPos.y || (w === h && this.mode === 8)) {
            let polygon;
            if (this.mode === 3) {
                polygon = this.drawPixelTriangle(pos, size);
            } else if (this.mode === 5) {
                polygon = this.drawPixelPentagon(pos, size);
            } else if (this.mode === 6) {
                polygon = this.drawPixelHexagon(pos, size);
            } else if (this.mode === 7) {
                polygon = this.drawPixelHeptagon(pos, size);
            } else {
                polygon = this.drawPixelOctagon(pos, size);
            }
            this.rotPolygon(polygon);

            for (let i = 0; i < polygon.length; i++) {
                /*this.color = this.getColor(i, polygon.length);
                this.updateBrushCanvas();*/
                let p1 = i + 1 === polygon.length ? 0 : i + 1;
                if (polygon[i].r) {
                    this.drawPixelLine(polygon[p1], polygon[i]);
                } else {
                    this.drawPixelLine(polygon[i], polygon[p1]);
                }
            }
        } else {
            this.drawPixelPolygon(pos);
        }
    }

    drawPixelPolygon(pos) {
        let len = Math.sqrt(
            (this.initPos.x - pos.x) * (this.initPos.x - pos.x) +
            (this.initPos.y - pos.y) * (this.initPos.y - pos.y));

        let angInit = Math.atan2(pos.y - this.initPos.y, pos.x - this.initPos.x);
        let ang = Math.PI * 2 / this.mode;
        let prevP = {x: this.initPos.x, y: this.initPos.y};
        let point = {x: pos.x, y: pos.y};

        for (let i = 0; i < this.mode; i++) {
            if (i === this.mode - 1) {
                this.drawPixelLine(prevP, this.initPos);
            } else {
                this.drawPixelLine(prevP, point);
                prevP.x = point.x;
                prevP.y = point.y;
                point.x = point.x + Math.cos(angInit - ang * (i + 1)) * len;
                point.y = point.y + Math.sin(angInit - ang * (i + 1)) * len;
            }
        }
    }

    drawPixelTriangle(pos, size) {
        // Main Rects
        let ix = this.initPos.x;
        let iy = this.initPos.y;
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

    drawPixelPentagon(pos, size) {
        let height = Math.round(size * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2);

        // Main Rects
        let ix = this.initPos.x;
        let iy = this.initPos.y;
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

    drawPixelHexagon(pos, size) {
        // Main Rects
        let ix = this.initPos.x;
        let iy = this.initPos.y;
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

    drawPixelHeptagon(pos, size) {
        // Main Rects
        let ix = this.initPos.x;
        let iy = this.initPos.y;
        let psx = ix + size;
        let psy = iy;

        let height = size * 2.1907;

        let cx = Math.round(this.initPos.x + size / 2);
        let cx2 = Math.round(this.initPos.x + size / 2) - 1;
        let cy = this.initPos.y - height;

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

    drawPixelOctagon(pos, size) {
        let ix = this.initPos.x;
        let iy = this.initPos.y;
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

    drawPixelCircle(x1, y1, x2, y2, ptFunction) {
        if (x1 === x2 || y1 === y2) {
            this.drawPixelLine({x:x1, y:y1}, {x:x2, y:y2});
            return;
        }

        let xff = Math.abs(x2 - x1) % 2 === 1 ? -1 : 0;
        let yff = Math.abs(y2 - y1) % 2 === 1 ? -1 : 0;
        let a = Math.round(Math.abs(x2 - x1) / 2);
        let b = Math.round(Math.abs(y2 - y1) / 2);
        let cx = Math.round((x1 + x2) / 2);
        let cy = Math.round((y1 + y2) / 2);
        let bb = b * b;
        let d = bb / (a * a);

        let prevY = 0;
        for (let x = 0; x < a; x++) {
            let y = Math.round(Math.sqrt(bb - (x * x) * d));
            if (y !== y) y = 0;
            for (let i = y + 1; i < prevY; i++) {
                ptFunction(cx, cy, x, i, xff, yff);
            }
            ptFunction(cx, cy, x, y, xff, yff);
            prevY = y;
        }
        ptFunction(cx, cy, a, 0, xff, yff);
        for (let i = 0; i < prevY; i++) {
            ptFunction(cx, cy, a, i, xff, yff);
        }
    }

    drawCircleMirror(cx, cy, x, y, xff, yff) {
        this.drawBrush(cx + x + xff, cy + y + yff);
        this.drawBrush(cx + x + xff, cy - y);
        this.drawBrush(cx - x, cy + y + yff);
        this.drawBrush(cx - x, cy - y);
    }

    rotPolygon(points) {
        let angInit = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
        if (Math.abs(angInit) > 0.00001) {
            let cos = Math.cos(angInit);
            let sin = Math.sin(angInit);
            for (let i = 2; i < points.length; i++) {
                this.rotPoint(this.initPos.x, this.initPos.y, cos, sin, points[i]);
            }
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