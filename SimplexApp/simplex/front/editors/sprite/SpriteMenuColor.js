import {SpriteMenu} from "./SpriteMenu.js";

export class SpriteMenuColor extends SpriteMenu {

    palette = null;
    paletteMode = false;
    wheelMode = 'rgb';
    hsbMode = false;
    ctx = null;
    cWidth = 176;
    cHeight = 176;

    color = "#FF0000";
    altColor = "#00FF00"

    originalColor = "";
    originalAltColor = "";

    dropper = false;
    colorSelected = 'main';

    selHue = 0;
    selPos = {x : 0, y : 0};

    interval = null;

    palettes = [
        {
            colors: [
                {r:0, g:0, b:0},
                {r:64, g:64, b:64},
                {r:128, g:128, b:128},
                {r:192, g:192, b:192},
                {r:255, g:255, b:255},
                {r:128, g:0, b:0},
                {r:0, g:128, b:0},
                {r:0, g:0, b:128},
                {r:128, g:64, b:64},
                {r:64, g:128, b:64},
                {r:64, g:64, b:128},
                {r:255, g:64, b:64},
                {r:64, g:255, b:64},
                {r:64, g:64, b:255},
                {r:255, g:0, b:0},
                {r:255, g:128, b:0},
                {r:255, g:255, b:0},
                {r:128, g:255, b:0},
                {r:0, g:255, b:0},
                {r:0, g:255, b:128},
                {r:0, g:255, b:255},
                {r:0, g:128, b:255},
                {r:0, g:0, b:255},
                {r:128, g:0, b:255},
                {r:255, g:0, b:255},
                {r:255, g:0, b:128},
            ]
        }
    ]

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);

        this.jqHue = jqDragView.find(".color-hue");
        this.jqSat = jqDragView.find(".color-sat");
        this.jqColor = jqDragView.find(".main-color");
        this.jqAltColor = jqDragView.find(".alt-color");
        this.jqCanvas = jqDragView.find(".color-canvas");
        this.colorCanvas = this.jqCanvas[0];
        this.colorCanvas.width = this.cWidth;
        this.colorCanvas.height = this.cHeight;
        this.ctx = this.colorCanvas.getContext("2d", {willReadFrequently: true});
        jqDragView.find(".close-view").click((e) => {
            this.hide();
        });

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
            this.colorSelected = "main";
            this.jqColor.addClass("selected");
            this.jqAltColor.removeClass("selected");
            this.setColor(this.originalColor);
        });
        this.jqAltColor.on('click', (e) => {
            this.colorSelected = "alt";
            this.jqAltColor.addClass("selected");
            this.jqColor.removeClass("selected");
            this.setColor(this.originalAltColor);
        });
        this.colorSelected = "main";
        this.jqColor.addClass("selected");

        this.originalColor = this.editor.color;
        this.originalAltColor = this.editor.altColor;
        this.color = this.convert(this.originalColor);
        this.altColor = this.convert(this.originalAltColor);
        this.setColor(this.originalColor);

        this.requestUpdate();
    }

    configureColorPicker() {
        this.jqCanvas.on('mousedown', (e) => {
            if (!!this.dragging) return;

            let pos = this.jqCanvas.offset();
            let px = e.pageX - pos.left;
            let py = e.pageY - pos.top;
            let center = this.cWidth / 2;
            let outCenter = center - 24;
            let dist = (px - this.cWidth/2) * (px - this.cWidth/2) + (py - this.cHeight/2) * (py - this.cHeight/2);
            if (dist < outCenter * outCenter) {
                this.dragging = "inner";
                this.innerPress(px, py);
            } else if (dist < center * center) {
                this.dragging = "outter";
                this.outterPress(px, py);
            }
        });
        this.editor.addWindowListener('mousemove', (e) =>{
            if (this.dragging === "outter") {
                let pos = this.jqCanvas.offset();
                let px = e.pageX - pos.left;
                let py = e.pageY - pos.top;
                this.outterPress(px, py);
            } else if (this.dragging === "inner") {
                let pos = this.jqCanvas.offset();
                let px = e.pageX - pos.left;
                let py = e.pageY - pos.top;
                this.innerPress(px, py);
            }
        });
        this.editor.addWindowListener('mouseup',  (e) => {
            this.dragging = null;
            this.dropper = false;
        });
    }

    configureSliders() {
        this.jqRslider = this.jqDragView.find("input[type=range].color-r");
        this.jqGslider = this.jqDragView.find("input[type=range].color-g");
        this.jqBslider = this.jqDragView.find("input[type=range].color-b");
        this.jqRtext = this.jqDragView.find("input[type=text].color-r");
        this.jqGtext = this.jqDragView.find("input[type=text].color-g");
        this.jqBtext = this.jqDragView.find("input[type=text].color-b");
        this.jqRslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            col.r = Math.round(this.jqRslider[0].value);
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqGslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            col.g = Math.round(this.jqGslider[0].value);
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqBslider[0].addEventListener('input', (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            col.b = Math.round(this.jqBslider[0].value);
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqRtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            let r = parseInt(this.jqRtext.val());
            if (!r || r < 0) {
                r = 0;
            } else if (r > 255) {
                r = 255;
            }
            col.r = r;
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqGtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            let g = parseInt(this.jqGtext.val());
            if (!g || g < 0) {
                g = 0;
            } else if (g > 255) {
                g = 255;
            }
            col.g = g;
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
        });
        this.jqBtext.on("input", (e) => {
            let col = this.colorSelected === "main" ? this.hexToRgb(this.originalColor) : this.hexToRgb(this.originalAltColor);
            let b = parseInt(this.jqBtext.val());
            if (!b || b < 0) {
                b = 0;
            } else if (b > 255) {
                b = 255;
            }
            col.b = b
            this.setColor(this.rgbToHex(col.r, col.g, col.b));
            this.requestUpdate();
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
        let iCen = this.cWidth - cPos - cPos;
        this.selPos.x = Math.min(Math.max(0, px - cPos) / iCen, 1);
        this.selPos.y = Math.min(Math.max(0, py - cPos) / iCen, 1);

        if (dist > inCenter) {
            left = (px - center) / dist * (inCenter) + center;
            top = (py - center) / dist * (inCenter) + center;
        }
        this.jqSat.css({left: left, top : top});
        this.setButtonColor();
    }

    getDropperColor(canvasPos) {
        this.editor.canvasBakeImage();
        let ctx = this.editor.getMainContext();
        let data = ctx.getImageData(canvasPos.x, canvasPos.y, 1, 1).data;
        let color = this.rgbToHex(data[0], data[1], data[2]);
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

        let rgb = this.hexToRgb(color);
        let hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        this.selHue = hsv.h;

        let angle = hsv.h * Math.PI * 2 - Math.PI / 2;
        let px = center + Math.cos(angle) * outCenter;
        let py = center + Math.sin(angle) * outCenter;
        this.jqHue.css({left: px, top : py});

        this.selPos.x = 1 - hsv.s;
        this.selPos.y = 1 - hsv.v;
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
        let final = this.hsvToRgb(this.selHue, 1 - this.selPos.x, 1 - this.selPos.y);
        let color = this.rgbToHex(final.r, final.g, final.b);
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
        colorIn = this.hexToRgb(colorIn);

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
        return this.rgbToHex(bCol.r, bCol.g, bCol.b);
    }

    setButtonColor() {
        this.updateColor();
        let rgb;
        if (this.colorSelected === "main") {
            rgb = this.hexToRgb(this.originalColor);
            this.jqSat.css("background-color", this.color);
        } else {
            rgb = this.hexToRgb(this.originalAltColor);
            this.jqSat.css("background-color", this.altColor);
        }
        this.jqRslider[0].value = rgb.r;
        this.jqGslider[0].value = rgb.g;
        this.jqBslider[0].value = rgb.b;
        this.jqRtext.val(rgb.r);
        this.jqGtext.val(rgb.g);
        this.jqBtext.val(rgb.b);
        this.editor.color = this.color;
        this.editor.altColor = this.altColor;
        this.editor.toolMenu.updateColors();
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
        let rgb = this.hsvToRgb(this.selHue, 1, 1);
        let col = this.rgbToHex(rgb.r, rgb.g, rgb.b);

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

    rgbToHex(r, g, b) {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if (r.length === 1) r = "0" + r;
        if (g.length === 1) g = "0" + g;
        if (b.length === 1) b = "0" + b;

        return "#" + r + g + b;
    }

    hexToRgb(h) {
        let r = 0, g = 0, b = 0;

        // 3 digits
        if (h.length === 4) {
            r = parseInt(h[1] + h[1], 16);
            g = parseInt(h[2] + h[2], 16);
            b = parseInt(h[3] + h[3], 16);

            // 6 digits
        } else if (h.length === 7) {
            r = parseInt(h[1] + h[2], 16);
            g = parseInt(h[3] + h[4], 16);
            b = parseInt(h[5] + h[6], 16);
        }

        return {r, g, b};
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {h, s, l};
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
    }

    hsvToRgb(h, s, v) {
        let r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s;
            v = h.v;
            h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    rgbToHsv(r, g, b) {
        if (arguments.length === 1) {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        let max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }
}