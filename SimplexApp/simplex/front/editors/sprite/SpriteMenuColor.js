import {SpriteMenu} from "./SpriteMenu.js";
import {SpriteEditor} from "./SpriteEditor.js";
import {hexToRgb, hsvToRgb, rgbToHex, rgbToHsv} from "../../Colors.js";

export class SpriteMenuColor extends SpriteMenu {

    palette = null;
    paletteMode = false;
    wheelMode = 'rgb';

    ctx = null;
    cWidth = 176;
    cHeight = 176;

    color = "#FF0000";
    altColor = "#00FF00";

    alpha = 1;
    altAlpha = 1;

    originalColor = "";
    originalAltColor = "";

    dropper = false;
    colorSelected = 'main';

    selHue = 0;
    selPos = {x : 0, y : 0};

    interval = null;

    palettes = [
        {
            colors: []
        }
    ]

    constructor(editor, jqDragView, dockeable, onColorChoose, initialColor) {
        super(editor, jqDragView, dockeable);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    this.palettes[0].colors.push({r:Math.round(255/3 * i), g:Math.round(255/3 * j), b:Math.round(255/3 * k)});
                }
            }
        }

        this.jqHue = jqDragView.find(".color-hue");
        this.jqSat = jqDragView.find(".color-sat");
        this.jqColor = jqDragView.find(".main-color");
        this.jqAltColor = jqDragView.find(".alt-color");
        this.jqCanvas = jqDragView.find(".color-canvas");
        this.colorCanvas = this.jqCanvas[0];
        this.colorCanvas.width = this.cWidth;
        this.colorCanvas.height = this.cHeight;
        this.ctx = this.colorCanvas.getContext("2d", {willReadFrequently: true});

        this.palette = this.palettes[0];
        this.configureSliders();
        this.configureColorPicker();

        let mode = jqDragView.find(".color-circle-mode");
        mode.on('click', (e) => {
            this.setPaletteMode(!this.paletteMode);
            mode.find("i").text(this.paletteMode ? "palette" : "camera");
        });
        let pick = jqDragView.find(".color-circle-dropper");
        pick.on('click', (e) => {
            this.dropper = true;
        });
        this.jqColor.on('click', (e) => {
            if (this.colorSelected === "main") return;

            this.colorSelected = "main";
            this.jqColor.addClass("selected");
            this.jqAltColor.removeClass("selected");
            this.setColor(this.originalColor);
        });
        this.jqAltColor.on('click', (e) => {
            if (this.colorSelected === "alt") return;

            this.colorSelected = "alt";
            this.jqAltColor.addClass("selected");
            this.jqColor.removeClass("selected");
            this.setColor(this.originalAltColor);
        });
        this.colorSelected = "main";
        this.jqColor.addClass("selected");

        if (editor instanceof SpriteEditor) {
            jqDragView.find(".close-view i").click((e) => {
                this.hide();
            });
            this.originalColor = this.editor.color;
            this.originalAltColor = this.editor.altColor;
            this.color = this.convert(this.originalColor);
            this.altColor = this.convert(this.originalAltColor);
            this.alpha = this.editor.alpha;
            this.altAlpha = this.editor.altAlpha;
        } else {
            this.onColorChoose = onColorChoose;
            this.originalColor = initialColor.substring(0, 7);
            this.originalAltColor = this.originalColor;
            this.color = this.convert(this.originalColor);
            this.altColor = this.convert(this.originalAltColor);
            this.alpha = initialColor.length === 7 ? 255 : parseInt(initialColor.substring(7), 16);
            this.altAlpha = this.alpha;
            this.jqAltColor.css("display", "none");
            pick.css("display", "none");
        }

        this.setColor(this.originalColor);
        this.requestUpdate();
    }

    showAsPopup(position, onColorChoose, initialColor) {
        this.jqDragView.offset({
            left : position.x - this.jqDragView.width()/2,
            top : position.y
        });
        this.onColorChoose = onColorChoose;
        this.originalColor = initialColor.substring(0, 7);
        this.originalAltColor = this.originalColor;
        this.color = this.convert(this.originalColor);
        this.altColor = this.convert(this.originalAltColor);
        this.alpha = initialColor.length === 7 ? 255 : parseInt(initialColor.substring(7), 16);
        this.altAlpha = this.alpha;
        this.show();
    }

    configureColorPicker() {
        this.jqCanvas.on('mousedown', (e) => {
            if (!!this.draggingColor) return;

            let pos = this.jqCanvas.offset();
            let px = e.pageX - pos.left;
            let py = e.pageY - pos.top;
            let center = this.cWidth / 2;
            let outCenter = center - 24;
            let dist = (px - this.cWidth/2) * (px - this.cWidth/2) + (py - this.cHeight/2) * (py - this.cHeight/2);
            if (dist < outCenter * outCenter) {
                this.draggingColor = "inner";
                this.innerPress(px, py);
            } else if (dist < center * center) {
                this.draggingColor = "outter";
                this.outterPress(px, py);
            }
        });
        this.editor.addWindowListener('mousemove', (e) =>{
            if (this.draggingColor === "outter") {
                let pos = this.jqCanvas.offset();
                let px = e.pageX - pos.left;
                let py = e.pageY - pos.top;
                this.outterPress(px, py);
            } else if (this.draggingColor === "inner") {
                let pos = this.jqCanvas.offset();
                let px = e.pageX - pos.left;
                let py = e.pageY - pos.top;
                this.innerPress(px, py);
            }
        });
        this.editor.addWindowListener('mouseup',  (e) => {
            this.draggingColor = null;
            this.dropper = false;
        });
    }

    configureSliders() {
        this.jqRslider = this.jqDragView.find("input[type=range].color-r");
        this.jqGslider = this.jqDragView.find("input[type=range].color-g");
        this.jqBslider = this.jqDragView.find("input[type=range].color-b");
        this.jqAslider = this.jqDragView.find("input[type=range].color-a");
        this.jqRtext = this.jqDragView.find("input[type=text].color-r");
        this.jqGtext = this.jqDragView.find("input[type=text].color-g");
        this.jqBtext = this.jqDragView.find("input[type=text].color-b");
        this.jqAtext = this.jqDragView.find("input[type=text].color-a");
        this.jqRslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            col.r = Math.round(this.jqRslider[0].value);
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqGslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            col.g = Math.round(this.jqGslider[0].value);
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqBslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            col.b = Math.round(this.jqBslider[0].value);
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqAslider[0].addEventListener('input', (e) => {
            if (this.colorSelected === "main") {
                this.alpha = Math.round(this.jqAslider[0].value);
            } else {
                this.altAlpha = Math.round(this.jqAslider[0].value);
            }
            this.setButtonColor();
        });
        this.jqRtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            let r = parseInt(this.jqRtext.val());
            if (!r || r < 0) {
                r = 0;
            } else if (r > 255) {
                r = 255;
            }
            col.r = r;
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqGtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            let g = parseInt(this.jqGtext.val());
            if (!g || g < 0) {
                g = 0;
            } else if (g > 255) {
                g = 255;
            }
            col.g = g;
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqBtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? hexToRgb(this.originalColor) : hexToRgb(this.originalAltColor);
            let b = parseInt(this.jqBtext.val());
            if (!b || b < 0) {
                b = 0;
            } else if (b > 255) {
                b = 255;
            }
            col.b = b
            this.setColor(rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqAtext.on("input", (e) => {
            let a = parseInt(this.jqAtext.val());
            if (!a || a < 0) {
                a = 0;
            } else if (a > 255) {
                a = 255;
            }
            if (this.colorSelected === "main") {
                this.alpha = a;
            } else {
                this.altAlpha = a;
            }
            this.setButtonColor();
        });
    }

    setPaletteMode(paletteMode) {
        if (this.paletteMode !== paletteMode) {
            this.paletteMode = paletteMode;
            this.setButtonColor();
            this.requestUpdate();
        }
    }

    outterPress(px, py) {
        let center = this.cWidth / 2;
        let outCenter = center - 12;
        let dist = Math.sqrt((px - center) * (px - center) + (py - center) * (py - center));
        let left = (px - center) / dist * (outCenter) + center;
        let top = (py - center) / dist * (outCenter) + center;
        this.selHue = (Math.atan2((center - px) / dist, (py - center) / dist) / Math.PI + 1) / 2;

        this.jqHue.css({left: left, top : top});
        this.setButtonColor();
        this.requestUpdate();
    }

    innerPress(px, py) {
        let center = this.cWidth / 2;
        let inCenter = center - 28;
        let dist = Math.sqrt((px - center) * (px - center) + (py - center) * (py - center));
        let left = px;
        let top = py;
        let cPos = 28 + 18;
        let iCenW = this.cWidth - cPos - cPos;

        if (dist > inCenter) {
            left = (px - center) / dist * (inCenter) + center;
            top = (py - center) / dist * (inCenter) + center;
        }
        this.selPos.x = Math.min(Math.max(0, left - cPos) / iCenW, 1);
        this.selPos.y = Math.min(Math.max(0, top - cPos) / iCenW, 1);

        this.jqSat.css({left: left, top : top});
        this.setButtonColor();
    }

    getDropperColor(canvasPos) {
        this.editor.canvasBakeImage();
        let ctx = this.editor.getMainContext();
        let data = ctx.getImageData(canvasPos.x, canvasPos.y, 1, 1).data;
        let color = rgbToHex(data[0], data[1], data[2]);
        this.setColor(color);
    }

    setColor(color) {
        if (this.colorSelected === "main") {
            this.originalColor = color;
        } else {
            this.originalAltColor = color;
        }

        let center = this.cWidth / 2;
        let outCenter = center - 13;

        let rgb = hexToRgb(color);
        let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        this.selHue = hsv.h;

        let angle = hsv.h * Math.PI * 2 - Math.PI / 2;
        let px = center + Math.cos(angle) * outCenter;
        let py = center + Math.sin(angle) * outCenter;
        this.jqHue.css({left: px, top : py});

        this.selPos.x = Math.min(Math.max(0, 1 - hsv.s), 1);
        this.selPos.y = Math.min(Math.max(0, 1 - hsv.v), 1);
        let cPos = 28 + 18;
        let iCen = this.cWidth - cPos - cPos;
        this.jqSat.css({
            left: this.selPos.x * iCen + cPos,
            top : this.selPos.y * iCen + cPos
        });
        this.setButtonColor();
        this.requestUpdate();
    }

    updateColor() {
        let final = hsvToRgb(this.selHue, 1 - this.selPos.x, 1 - this.selPos.y);
        let color = rgbToHex(final.r, final.g, final.b);
        if (this.colorSelected === "main") {
            this.originalColor = color;
        } else {
            this.originalAltColor = color;
        }
        this.color = this.convert(this.originalColor);
        this.altColor = this.convert(this.originalAltColor);
    }

    convert(color) {
        if (this.paletteMode) {
            return this.getPaletteBestColor(color);
        }
        return color;
    }

    getPaletteBestColor(colorIn) {
        let stringMode = typeof colorIn === "string";
        if (stringMode) {
            colorIn = hexToRgb(colorIn);
        }

        let col = this.palette.colors;
        let diff = -1;
        let bCol = col[0];
        for (let i = 0; i < col.length; i++) {
            let rDiff = Math.abs(col[i].r - colorIn.r);
            let gDiff = Math.abs(col[i].g - colorIn.g);
            let bDiff = Math.abs(col[i].b - colorIn.b);
            if (rDiff * rDiff + gDiff * gDiff + bDiff * bDiff < diff || diff === -1) {
                diff = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
                bCol = col[i];
            }
        }
        if (stringMode) {
            return rgbToHex(bCol.r, bCol.g, bCol.b);
        } else {
            colorIn.r = bCol.r;
            colorIn.g = bCol.g;
            colorIn.b = bCol.b;
            return colorIn;
        }
    }

    setButtonColor() {
        this.updateColor();
        let rgb, a;
        if (this.colorSelected === "main") {
            rgb = hexToRgb(this.originalColor);
            a = this.alpha;
            this.jqSat.css("background-color", this.color);
            this.jqAslider.css("background", "linear-gradient(to left, " + this.color + ", " + this.color+"00");
        } else {
            rgb = hexToRgb(this.originalAltColor);
            a = this.altAlpha;
            this.jqSat.css("background-color", this.altColor);
            this.jqAslider.css("background", "linear-gradient(to left, " + this.altColor + ", " + this.altColor+"00");
        }
        this.jqRslider[0].value = rgb.r;
        this.jqGslider[0].value = rgb.g;
        this.jqBslider[0].value = rgb.b;
        this.jqAslider[0].value = a;
        this.jqRtext.val(rgb.r);
        this.jqGtext.val(rgb.g);
        this.jqBtext.val(rgb.b);
        this.jqAtext.val(a);
        if (this.onColorChoose) {
            this.onColorChoose(this.color + (this.alpha.toString(16).length === 1 ? "0" : "") + this.alpha.toString(16));
        } else {
            this.editor.color = this.color;
            this.editor.altColor = this.altColor;
            this.editor.alpha = this.alpha;
            this.editor.altAlpha = this.altAlpha;
            this.editor.toolMenu.updateColors();
        }
        this.jqColor.css("background-color", this.color);
        this.jqAltColor.css("background-color", this.altColor);
    }

    requestUpdate() {
        if (!this.interval) {
            this.updateCanvas();
            this.interval = setTimeout((e) => {
                this.updateCanvas();
                this.interval = null;
            }, 100);
        }
    }

    updateCanvas() {
        let center = this.cWidth / 2;
        this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);

        let outCenter = center - 24;
        let inCenter = center - 28;
        let rgb = hsvToRgb(this.selHue, 1, 1);
        let col = rgbToHex(rgb.r, rgb.g, rgb.b);

        let hgrd = this.ctx.createLinearGradient(28, center, this.cWidth - 28, center);
        hgrd.addColorStop(0.146446, col);
        hgrd.addColorStop(0.853554, "#FFFFFF");

        this.ctx.fillStyle = hgrd;
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, inCenter, inCenter, 0, 0, Math.PI * 2);
        this.ctx.fill();

        let vgrd = this.ctx.createLinearGradient(center, 28, center, this.cHeight - 28);
        vgrd.addColorStop(0.146446, "#00000000");
        vgrd.addColorStop(0.853554, "#000000FF");

        this.ctx.fillStyle = vgrd;
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, inCenter, inCenter, 0, 0, Math.PI * 2);
        this.ctx.fill();

        if (this.paletteMode) {
            let imgData = this.ctx.getImageData(0, 0, this.cWidth, this.cHeight);
            let arr = imgData.data;
            let col = this.palette.colors;
            for (let x = 0; x < this.cWidth; x++) {
                for (let y = 0; y < this.cHeight; y++) {
                    let p = x * 4 + (y * this.cWidth * 4);
                    let diff = -1;
                    let bCol = col[0];
                    for (let i = 0; i < col.length; i++) {
                        let rDiff = Math.abs(col[i].r - arr[p]);
                        let gDiff = Math.abs(col[i].g - arr[p + 1]);
                        let bDiff = Math.abs(col[i].b - arr[p + 2]);
                        if (rDiff * rDiff + gDiff * gDiff + bDiff * bDiff < diff || diff === -1) {
                            diff = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
                            bCol = col[i];
                        }
                    }
                    if (arr[p + 3] < 128) {
                        arr[p + 3] = 0;
                    } else {
                        arr[p] = bCol.r;
                        arr[p + 1] = bCol.g;
                        arr[p + 2] = bCol.b;
                        arr[p + 3] = 255;
                    }
                }
            }
            this.ctx.putImageData(imgData, 0, 0);
        }

        let grd = this.ctx.createConicGradient(-Math.PI/2, center, center);
        if (this.wheelMode === 'rygb') {
            grd.addColorStop(0 / 12, "#FF0000"); // red
            grd.addColorStop(1 / 12, "#FF5500");
            grd.addColorStop(2 / 12, "#FFAA00");
            grd.addColorStop(3 / 12, "#FFFF00"); // yellow
            grd.addColorStop(4 / 12, "#AAFF00");
            grd.addColorStop(5 / 12, "#55BF00");
            grd.addColorStop(6 / 12, "#00AA00"); // green {dark}
            grd.addColorStop(7 / 12, "#00BFAA");
            grd.addColorStop(8 / 12, "#0080FF");
            grd.addColorStop(9 / 12, "#0000FF"); // blue
            grd.addColorStop(10 / 12,"#AA00FF");
            grd.addColorStop(11 / 12,"#FF00AA");
            grd.addColorStop(12 / 12,"#FF0000");
        } else if (this.wheelMode === 'ryb') {
            grd.addColorStop(0 / 12, "#FF0000");
            grd.addColorStop(1 / 12, "#FF4000");
            grd.addColorStop(2 / 12, "#FF8000");
            grd.addColorStop(3 / 12, "#FFC000");
            grd.addColorStop(4 / 12, "#FFFF00");
            grd.addColorStop(5 / 12, "#80FF00");
            grd.addColorStop(6 / 12, "#00BF00");
            grd.addColorStop(7 / 12, "#0080FF");
            grd.addColorStop(8 / 12, "#0020FF");
            grd.addColorStop(9 / 12, "#8000FF");
            grd.addColorStop(10 / 12,"#FF00FF");
            grd.addColorStop(11 / 12,"#FF0080");
            grd.addColorStop(12 / 12,"#FF0000");
        } else {
            grd.addColorStop(0 / 6, "#FF0000");
            grd.addColorStop(1 / 6, "#FFFF00");
            grd.addColorStop(2 / 6, "#00BF00");
            grd.addColorStop(3 / 6, "#00FFFF");
            grd.addColorStop(4 / 6, "#0000FF");
            grd.addColorStop(5 / 6, "#FF00FF");
            grd.addColorStop(6 / 6, "#FF0000");
        }

        this.ctx.strokeStyle = grd;
        this.ctx.lineWidth = 24;
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, center-12, center-12, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, inCenter, inCenter, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, outCenter, outCenter, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.ellipse(center, center, center - 1, center - 1, 0, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}