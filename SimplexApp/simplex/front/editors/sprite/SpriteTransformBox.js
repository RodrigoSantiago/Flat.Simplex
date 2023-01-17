export class SpriteTransformBox {

    editor;
    width = 100;
    height = 100;
    center = {x: 100, y: 100};
    mouseIn = {x:0, y:0};
    angle = 0;

    addHeight = 0;
    addWidth = 0;
    offX = 0;
    offY = 0;
    addAngle = 0;

    isOpen = false;

    constructor(editor) {
        this.editor = editor;
        this.jqBox = $("<div class='sprite-scale-box'></div>");
        this.jqImg = $("<img class='sprite-scale-img'/>");
        this.jqPivot = [];
        for (let i = 0; i < 9; i++) {
            let pivot = $("<div class='sprite-pivot'><div class='sprite-pivot-handler'></div></div>");
            pivot.id = i;
            this.jqPivot.push(pivot);
            this.jqBox.append(pivot);

            pivot.on('mousedown', (e) => {
                if (e.button !== 0) return;
                if (!this.pivot) {
                    this.pivot = pivot;
                    if (this.height < 0) {
                        if (this.pivot.id === 0) this.pivot = this.jqPivot[6];
                        else if (this.pivot.id === 1) this.pivot = this.jqPivot[7];
                        else if (this.pivot.id === 2) this.pivot = this.jqPivot[8];
                        else if (this.pivot.id === 6) this.pivot = this.jqPivot[0];
                        else if (this.pivot.id === 7) this.pivot = this.jqPivot[1];
                        else if (this.pivot.id === 8) this.pivot = this.jqPivot[2];
                    }
                    if (this.width < 0) {
                        if (this.pivot.id === 0) this.pivot = this.jqPivot[2];
                        else if (this.pivot.id === 2) this.pivot = this.jqPivot[0];
                        else if (this.pivot.id === 3) this.pivot = this.jqPivot[5];
                        else if (this.pivot.id === 5) this.pivot = this.jqPivot[3];
                        else if (this.pivot.id === 6) this.pivot = this.jqPivot[8];
                        else if (this.pivot.id === 8) this.pivot = this.jqPivot[6];
                    }
                    let off = this.editor.canvasPos.offset();
                    this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
                }
            });
        }
        this.jqBox.append(this.jqImg);
        this.jqBox.append("<div class='sprite-scale-box-border'></div>");
        this.jqBox.on('mousedown', (e) => {
            if (e.button !== 0) return;
            if ($(e.target).closest('.sprite-pivot').length) return;

            let off = this.editor.canvasPos.offset();
            this.mouseIn = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
            this.pivot = 1;
        });
        this.editor.addWindowListener('mousemove', (e) => {
            if (e.button !== 0) return;
            if (this.pivot) {
                let off = this.editor.canvasPos.offset();
                this.mouseMv = this.convertRelativePos(e.pageX - off.left, e.pageY - off.top);
                let x = this.mouseMv.x - this.mouseIn.x;
                let y = this.mouseMv.y - this.mouseIn.y;
                if (this.pivot === 1) this.movePlane(this.mouseMv.xn - this.mouseIn.xn, this.mouseMv.yn - this.mouseIn.yn);
                else if (this.pivot.id === 0) this.movePivot(x, y, -1, -1);
                else if (this.pivot.id === 1) this.movePivot(x, y, 0, -1);
                else if (this.pivot.id === 2) this.movePivot(x, y, 1, -1);
                else if (this.pivot.id === 3) this.movePivot(x, y, -1, 0);
                else if (this.pivot.id === 4) this.rotatePlane(e.shiftKey);
                else if (this.pivot.id === 5) this.movePivot(x, y, 1, 0);
                else if (this.pivot.id === 6) this.movePivot(x, y, -1, 1);
                else if (this.pivot.id === 7) this.movePivot(x, y, 0, 1);
                else if (this.pivot.id === 8) this.movePivot(x, y, 1, 1);
                else if (this.pivot.id === 8) this.movePivot(x, y, 1, 1);
            }
        });
        this.editor.addWindowListener('mouseup', (e) => {
            if (e.button !== 0) return;
            if (this.pivot) {
                this.center.x += this.offX;
                this.center.y += this.offY;
                this.width += this.addWidth;
                this.height += this.addHeight;
                this.angle = Math.round((this.angle + this.addAngle) / (Math.PI / 360)) * (Math.PI / 360);
                this.offX = 0;
                this.offY = 0;
                this.addWidth = 0;
                this.addHeight = 0;
                this.addAngle = 0;
            }
            this.pivot = null;
        });
        this.editor.canvasPos.append(this.jqBox);
        this.jqBox.css("display", "none");
        this.update();
    }

    open(pos, x, y, w, h, imageSrc) {
        this.center.x = ((x - this.editor.imageWidth / 2) + w / 2) * this.editor.zoomStep;
        this.center.y = ((y - this.editor.imageHeight / 2) + h / 2) * this.editor.zoomStep;
        this.width = w;
        this.height = h;
        this.startWidth = w;
        this.startHeight = h;
        this.angle = 0;
        this.offX = 0;
        this.offY = 0;
        this.addWidth = 0;
        this.addHeight = 0;
        this.addAngle = 0;
        this.jqBox.css("display", "");
        this.jqImg[0].src = imageSrc;
        this.update();

        this.mouseIn = this.convertRelativePos(
            (pos.x - this.editor.imageWidth / 2)  * this.editor.zoomStep,
            (pos.y - this.editor.imageHeight / 2)  * this.editor.zoomStep
        );
        this.pivot = 1;
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
        this.jqBox.css("display", "none");
        this.jqImg[0].src = "";
        this.update();
    }

    convertRelativePos(mx, my) {
        let p = this.RotatePoint(mx, my, (Math.PI*2) - this.angle);
        return {x:p.x, y:p.y, xn:mx, yn:my};
    }

    movePivot(x , y, xS, yS) {
        this.addWidth = x * xS / this.editor.zoomStep;
        this.addHeight = y * yS / this.editor.zoomStep;
        let p = this.RotatePoint(xS === 0 ? 0 : x / 2, yS === 0 ? 0 : y / 2, this.angle);
        this.offX = p.x;
        this.offY = p.y;
        this.update();
    }

    movePlane(x ,y) {
        this.offX = x;
        this.offY = y;
        this.update();
    }

    rotatePlane(shift) {
        let x1 = this.mouseIn.xn - this.center.x;
        let y1 = this.mouseIn.yn - this.center.y;
        let x2 = this.mouseMv.xn - this.center.x;
        let y2 = this.mouseMv.yn - this.center.y;
        this.addAngle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
        if (shift) {
            this.addAngle = (Math.round((this.angle + this.addAngle) / (Math.PI / 4)) * Math.PI / 4) - this.angle;
        }
        this.update();
    }

    update(prevZoom) {
        let pos = this.editor.zoomPos;
        if (prevZoom) {
            this.center.x = this.center.x / prevZoom * this.editor.zoomStep;
            this.center.y = this.center.y / prevZoom * this.editor.zoomStep;
        }
        let w = Math.abs((this.width + this.addWidth) * this.editor.zoomStep);
        let h = Math.abs((this.height + this.addHeight) * this.editor.zoomStep);
        this.x1 = ((this.center.x + this.offX) - w / 2);
        this.y1 = ((this.center.y + this.offY) - h / 2);
        this.x2 = ((this.center.x + this.offX) + w / 2);
        this.y2 = ((this.center.y + this.offY) + h / 2);
        this.x1 = Math.round(this.x1 / this.editor.zoomStep) * this.editor.zoomStep;
        this.y1 = Math.round(this.y1 / this.editor.zoomStep) * this.editor.zoomStep;
        this.x2 = Math.round(this.x2 / this.editor.zoomStep) * this.editor.zoomStep;
        this.y2 = Math.round(this.y2 / this.editor.zoomStep) * this.editor.zoomStep;

        this.jqBox.css({
            left: this.x1,
            top: this.y1,
            width: this.x2 -this.x1,
            height: this.y2 - this.y1,
            transform: "rotate(" + (this.angle + this.addAngle) + "rad)"
        });
    }

    isTranspose() {
        let a = this.angle + this.addAngle;
        return Math.abs(a - 0) < 0.00001 || Math.abs(a - Math.PI / 2) < 0.00001 ||
            Math.abs(a - Math.PI) < 0.00001 || Math.abs(a - Math.PI / 2 * 3) < 0.00001
    }

    RotatePoint(pointx, pointy, radians) {
        if (radians === 0) return {x : pointx, y : pointy};

        let cosTheta = Math.cos(radians);
        let sinTheta = Math.sin(radians);

        let x = cosTheta * pointx - sinTheta * pointy;
        let y = sinTheta * pointx + cosTheta * pointy;

        return {x, y};
    }
}