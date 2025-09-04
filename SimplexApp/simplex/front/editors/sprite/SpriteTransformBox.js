export class SpriteTransformBox {

    /** @type {SpriteEditor} */ editor;

    /** @type{number} */ cx = 0;
    /** @type{number} */ cy = 0;
    /** @type{number} */ width = 0;
    /** @type{number} */ height = 0;
    /** @type{number} */ angle = 0;
    /** @type{number} */ signX = 1;
    /** @type{number} */ signY = 1;

    /** @type{number} */ startWidth = 0;
    /** @type{number} */ startHeight = 0;

    /** @type{number} */ offX = 0;
    /** @type{number} */ offY = 0;
    /** @type{number} */ offWidth = 0;
    /** @type{number} */ offHeight = 0;
    /** @type{number} */ offAngle = 0;

    /** @type{{x, y, nx, ny}} */ mouseIn = {x : 0, y : 0, nx : 0, ny : 0};
    /** @type{{x, y, nx, ny}} */ mouseMv = {x : 0, y : 0, nx : 0, ny : 0};

    /** @type{{x, y}} */ handleA = {x: 0, y:0};
    /** @type{{x, y}} */ handleB = {x: 0, y:0};

    /** @type{{x, y}} */ handleOffA = {x: 0, y:0};
    /** @type{{x, y}} */ handleOffB = {x: 0, y:0};

    /** @type{boolean} */ isOpen = false;
    /** @type{boolean} */ isBezier = false;
    /** @type{boolean} */ textMode = false;

    /** @type{Function} */ onUpdate;

    /** @type{number} */ size = 24;
    /** @type{string} */ font = "Arial";

    constructor(editor) {
        this.editor = editor;
        this.jqBox = $("<div class='sprite-scale-box'></div>");
        this.jqImg = $("<img class='sprite-scale-img'/>");
        this.jqTxt = $("<textarea class='sprite-text-area' spellcheck='false'>Type...</textarea>");
        this.jqTxtSpan = $("<div class='sprite-textspan'></div>");
        this.jqTxt.css("display", "none");
        this.jqTxt.on("keyup", e => {
            if (this.textMode) {
                this.textEdited = true;
                this.update();
            }
        });
        this.jqTxt.on("click", e => {
            this.textEdited = true;
        });
        this.jqPivot = [];
        for (let i = 0; i < 9; i++) {
            let pivot = $("<div class='sprite-pivot'><div class='sprite-pivot-handler'></div></div>");
            this.jqPivot.push(pivot);
            this.jqBox.append(pivot);

            const id = i + 1;
            pivot.on('mousedown', (e) => {
                if (e.button !== 0) return;
                if (!this.pivot) {
                    this.pivot = id;
                    let off = this.editor.canvasScl.offset();
                    this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
                }
            });
        }

        this.pivotA = $("<div class='sprite-pivot bezier'><div class='sprite-pivot-handler'></div></div>");
        this.pivotB = $("<div class='sprite-pivot bezier'><div class='sprite-pivot-handler'></div></div>");
        this.jqBox.append(this.pivotA);
        this.jqBox.append(this.pivotB);
        this.pivotA.on('mousedown', (e) => {
            if (e.button !== 0) return;
            if (!this.pivot) {
                this.pivot = 11;
                let off = this.editor.canvasScl.offset();
                this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
            }
        });
        this.pivotB.on('mousedown', (e) => {
            if (e.button !== 0) return;
            if (!this.pivot) {
                this.pivot = 12;
                let off = this.editor.canvasScl.offset();
                this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
            }
        });

        let border = $("<div class='sprite-scale-box-border'></div>");
        this.jqBox.append(this.jqImg);
        this.jqBox.append(this.jqTxt);
        this.jqBox.append(border);
        border.on('mousedown', (e) => {
            if (this.pivot || e.button !== 0) return;
            if ($(e.target).closest('.sprite-pivot').length) return;

            let off = this.editor.canvasScl.offset();
            this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
            this.pivot = 10;
        });
        this.editor.addWindowListener('mousemove', (e) => {
            if (e.button !== 0) return;
            if (this.pivot) {
                let off = this.editor.canvasScl.offset();
                this.mouseMv = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
                let x = this.mouseMv.x - this.mouseIn.x;
                let y = this.mouseMv.y - this.mouseIn.y;
                let nx = this.mouseMv.nx - this.mouseIn.nx;
                let ny = this.mouseMv.ny - this.mouseIn.ny;
                this.movePivot(this.pivot - 1, {x, y, nx, ny}, e.shiftKey);
            }
        });
        this.editor.addWindowListener('mouseup', (e) => {
            this.leave();
        });
        this.editor.canvasScl.append(this.jqBox);
        this.jqBox.css("display", "none");
        this.update();
    }

    openText(pos, x, y, w, h, size, font, bold, italic) {
        this.size = size;
        this.font = font;
        this.bold = bold;
        this.italic = italic;
        this.open(pos, x, y, w, h, null, null, null);
        this.jqTxt.css("display", "");
        this.jqTxt.trigger("focus");
        this.jqTxt.trigger("select");
        this.textMode = true;
        this.textEdited = false;
    }

    open(pos, x, y, w, h, imageSrc, handleA, handleB) {
        this.x = x;
        this.y = y;
        this.cx = x + w / 2;
        this.cy = y + h / 2;
        this.width = w;
        this.height = h;
        this.startWidth = w;
        this.startHeight = h;
        this.angle = 0;

        this.offX = 0;
        this.offY = 0;
        this.offWidth = 0;
        this.offHeight = 0;
        this.offAngle = 0;
        this.jqBox.css("display", "");

        this.signX = 1;
        this.signY = 1;

        this.handleA = handleA ? {x:handleA.x, y:handleA.y} : null;
        this.handleB = handleB ? {x:handleB.x, y:handleB.y} : null;
        if (this.handleA) {
            this.isBezier = true;
            this.handleA.x -= x;
            this.handleA.y -= y;
            this.handleB.x -= x;
            this.handleB.y -= y;
            this.jqBox.addClass("bezier");
        } else {
            this.isBezier = false;
            this.jqBox.removeClass("bezier");
        }

        if (imageSrc) {
            this.jqImg[0].src = imageSrc;
            this.jqImg.css("display", "");
        } else {
            this.jqImg.css("display", "none");
        }

        this.mouseIn = {x:pos.x, y:pos.y};
        this.pivot = 10;
        this.isOpen = true;
        this.textMode = false;
        this.jqTxt.css("display", "none");

        this.update();
    }

    leave() {
        if (this.pivot) {
            if ((this.width + this.offWidth) < 0) {
                this.signX = -this.signX;
            }
            if ((this.height + this.offHeight) < 0) {
                this.signY = -this.signY;
            }

            this.cx += this.offX;
            this.cy += this.offY;
            this.width = Math.abs(this.width + this.offWidth);
            this.height = Math.abs(this.height + this.offHeight);
            this.angle = Math.round((this.angle + this.offAngle) / (Math.PI / 360)) * (Math.PI / 360);
            if (this.width < 1) this.width = 1;
            if (this.height < 1) this.height = 1;
            this.offX = 0;
            this.offY = 0;
            this.offWidth = 0;
            this.offHeight = 0;
            this.offAngle = 0;
            if (this.isBezier) {
                this.handleA.x += this.handleOffA.x;
                this.handleA.y += this.handleOffA.y;
                this.handleB.x += this.handleOffB.x;
                this.handleB.y += this.handleOffB.y;
                this.handleOffA.x = 0;
                this.handleOffA.y = 0;
                this.handleOffB.x = 0;
                this.handleOffB.y = 0;
            }
        }
        this.pivot = 0;
    }

    close() {
        this.isOpen = false;
        this.jqBox.css("display", "none");
        this.jqImg[0].src = "";
        this.jqTxt.val("Type...");
        this.onUpdate = null;
        this.update();
    }

    convertRelativePos(mx, my) {
        mx = Math.round(mx / this.editor.zoomStep);
        my = Math.round(my / this.editor.zoomStep);
        let p = this.RotatePoint(mx, my, (Math.PI * 2) - this.angle);
        return {x: Math.round(p.x), y: Math.round(p.y), nx: mx, ny: my};
    }

    movePivot(id, pos, shift) {
        if (id < 4 || (id > 4 && id < 9)) {

            let xS = 0, yS = 0;
            if (id === 0 || id === 1 || id === 2) {
                yS = -1;
            }
            if (id === 6 || id === 7 || id === 8) {
                yS = 1;
            }
            if (id === 0 || id === 3 || id === 6) {
                xS = -1;
            }
            if (id === 2 || id === 5 || id === 8) {
                xS = 1;
            }

            this.offWidth = pos.x * xS;
            this.offHeight = pos.y * yS;
            let p = this.RotatePoint(xS === 0 ? 0 : pos.x / 2, yS === 0 ? 0 : pos.y / 2, this.angle);
            this.offX = p.x;
            this.offY = p.y;
        } else if (id === 4) {
            let x1 = this.mouseIn.nx - this.cx;
            let y1 = this.mouseIn.ny - this.cy;
            let x2 = this.mouseMv.nx - this.cx
            let y2 = this.mouseMv.ny - this.cy;
            this.offAngle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
            if (shift) {
                this.offAngle = (Math.round((this.angle + this.offAngle) / (Math.PI / 4)) * Math.PI / 4) - this.angle;
            }
        } else if (id === 9) {
            let p = this.RotatePoint(pos.x,pos.y, this.angle);
            this.offX = p.x;
            this.offY = p.y;
        } else if (id === 10) {
            this.handleOffA.x = pos.x;
            this.handleOffA.y = pos.y;
        } else if (id === 11) {
            this.handleOffB.x = pos.x;
            this.handleOffB.y = pos.y;
        }

        this.update();
    }

    update() {
        let offw = (this.width + this.offWidth);
        let offh = (this.height + this.offHeight);
        let w = Math.abs(offw);
        let h = Math.abs(offh);
        if (w < 1 || h < 1) return;

        let a = (this.angle + this.offAngle);
        let rx1 = this.cx + this.offX - w / 2;
        let rx2 = this.cx + this.offX + w / 2;
        let ry1 = this.cy + this.offY - h / 2;
        let ry2 = this.cy + this.offY + h / 2;
        let signX = offw < 0 ? -this.signX : this.signX;
        let signY = offh < 0 ? -this.signY : this.signY;

        let trueX = (rx1 * this.editor.zoomStep);
        let trueY = (ry1 * this.editor.zoomStep);
        let trueW = (rx2 - rx1) * this.editor.zoomStep;
        let trueH = (ry2 - ry1) * this.editor.zoomStep;
        let width = Math.floor(trueW);
        let height = Math.floor(trueH);
        let sW = trueW > 10 ? trueW / width : 1;
        let sH = trueH > 10 ? trueH / height : 1;

        if (this.isBezier) {
            if (this.pivot !== 4 && this.pivot < 10) {
                let x1 = offw < 0 ? w : 0;
                let x2 = offw < 0 ? 0 : w;
                let y1 = offh < 0 ? h : 0;
                let y2 = offh < 0 ? 0 : h;
                let wp1 = this.handleA.x / this.width;
                let hp1 = this.handleA.y / this.height;
                this.handleOffA.x = (x1 * (1 - wp1) + x2 * wp1) - this.handleA.x;
                this.handleOffA.y = (y1 * (1 - hp1) + y2 * hp1) - this.handleA.y;
                let wp2 = this.handleB.x / this.width;
                let hp2 = this.handleB.y / this.height;
                this.handleOffB.x = (x1 * (1 - wp2) + x2 * wp2) - this.handleB.x;
                this.handleOffB.y = (y1 * (1 - hp2) + y2 * hp2) - this.handleB.y;
            }

            this.pivotA.css({
                left: (this.handleA.x + this.handleOffA.x + 0.5) * this.editor.zoomStep,
                top: (this.handleA.y + this.handleOffA.y + 0.5) * this.editor.zoomStep
            });
            this.pivotB.css({
                left: (this.handleB.x + this.handleOffB.x + 0.5) * this.editor.zoomStep,
                top: (this.handleB.y + this.handleOffB.y + 0.5) * this.editor.zoomStep
            });
        }

        this.jqBox.css({
            width: width,
            height: height,
            transform: "translate(" + trueX + "px, " + trueY + "px) scale(" + sW + ", " + sH + ") rotate(" + a + "rad)"
        });

        this.jqImg.removeClass("flipX");
        this.jqImg.removeClass("flipY");
        this.jqImg.removeClass("flipXY");
        if (signX === -1 && signY === -1) {
            this.jqImg.addClass("flipXY");
        } else if (signX === -1) {
            this.jqImg.addClass("flipX");
        } else if (signY === -1) {
            this.jqImg.addClass("flipY");
        }

        this.jqTxt.css("margin", 8 * this.editor.zoomStep);
        this.jqTxt.css("font-size", this.size * this.editor.zoomStep);
        this.jqTxt.css("font-family", this.font);
        this.jqTxt.css("font-weight", this.bold ? "bold" : "normal");
        this.jqTxt.css("font-style", this.italic ? "italic" : "normal");

        this.rx1 = rx1;
        this.ry1 = ry1;
        this.rx2 = rx2;
        this.ry2 = ry2;
        this.rAngle = a;
        this.rSignX = signX;
        this.rSignY = signY;

        this.onUpdate?.(rx1, ry1, rx2, ry2, a, signX, signY, {
            x: this.isBezier ? (this.handleA.x + this.handleOffA.x) / w : 0,
            y: this.isBezier ? (this.handleA.y + this.handleOffA.y) / h: 0,
        }, {
            x: this.isBezier ? (this.handleB.x + this.handleOffB.x) / w: 0,
            y: this.isBezier ? (this.handleB.y + this.handleOffB.y) / h: 0,
        });
    }

    RotatePoint(pointx, pointy, radians) {
        if (radians === 0) return {x : pointx, y : pointy};

        let cosTheta = Math.cos(radians);
        let sinTheta = Math.sin(radians);

        let x = cosTheta * pointx - sinTheta * pointy;
        let y = sinTheta * pointx + cosTheta * pointy;

        return {x, y};
    }

    getLines() {
        this.jqTxtSpan.appendTo(this.jqTxt.parent());
        this.jqTxtSpan.css("margin", 8 * this.editor.zoomStep);
        this.jqTxtSpan.css("font-size", this.size * this.editor.zoomStep);
        this.jqTxtSpan.css("font-family", this.font);
        let lines = this.jqTxt.val().split("\n");
        let html = "";
        for (let i = 0; i < lines.length; i++) {
            html += lines[i];
            this.jqTxtSpan.html(html);
            lines[i] = {text : lines[i], height : this.jqTxtSpan.height() / this.editor.zoomStep};
            html += "<br>";
        }
        this.jqTxtSpan.detach()
        return lines;
    }
}