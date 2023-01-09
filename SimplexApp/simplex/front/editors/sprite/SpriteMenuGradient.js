import {SpriteMenu} from "./SpriteMenu.js";
import {hexToRgb, rgbToHex} from "../../Colors.js";
import {ColorPickerDialog} from "../../dialogs/ColorPickerDialog.js";

export class SpriteMenuGradient extends SpriteMenu {

    nodes = [];

    constructor(editor, jqDragView, dockeable) {
        super(editor, jqDragView, dockeable);
        jqDragView.find(".close-view i").click((e) => {
            this.hide();
        });
        this.jqGradLine = jqDragView.find(".gradient-line");
        this.jqGradLine.on("dblclick", (e) => {
            if (e.target !== this.jqGradLine[0]) return;

            let left = this.jqGradLine.offset().left + 4;
            let width = this.jqGradLine.width() - 8;
            let pos = Math.max(0, Math.min(1, (e.pageX - left) / width));
            this.addNode(pos, left + pos * width - 4);
        });

        this.editor.addWindowListener("mousemove", (e) => {
            if (!this.draggedNode) return;

            let left = this.jqGradLine.offset().left + 4;
            let width = this.jqGradLine.width() - 8;
            let rpos = (e.pageX - left) / width;
            let pos = Math.max(0, Math.min(1, rpos));
            this.draggedNode.jqNode.offset({left: Math.min(left + width, Math.max(left, e.pageX)) - 4});
            this.moveNode(this.draggedNode, pos, rpos > 1.25 || rpos < -0.25, false);
            this.pick = null;
        });
        this.editor.addWindowListener("mouseup", (e) => {
            if (!this.draggedNode) return;
            if (this.pick) {
                this.draggedNode = null;
                return;
            }

            let left = this.jqGradLine.offset().left + 4;
            let width = this.jqGradLine.width() - 8;
            let rpos = (e.pageX - left) / width;
            let pos = Math.max(0, Math.min(1, rpos));
            this.draggedNode.jqNode.offset({left: Math.min(left + width, Math.max(left, e.pageX)) - 4});
            this.moveNode(this.draggedNode, pos, false, rpos > 1.25 || rpos < -0.25);
            this.draggedNode = null;
        });

        this.addNode(0, this.jqGradLine.offset().left);
        this.addNode(1, this.jqGradLine.offset().left + this.jqGradLine.width() - 8);
        this.nodes[0].col = "#FFFFFFFF";
        this.nodes[1].col = "#000000FF";
        this.updateGradient();
        this.tolerance = 0;
        this.contiguous = true;
        this.blendAlpha = false;
        this.useGradient = false;
        this.radial = false;
        this.palette = false;

        this.jqTolerance = jqDragView.find(".value-tolerance");
        this.jqToleranceText = jqDragView.find(".text-tolerance");
        this.jqTolerance.on("input", (e) => {
            this.tolerance = this.jqTolerance[0].value;
            this.jqToleranceText.val(this.tolerance);
        });
        this.jqToleranceText.on("input", (e) => {
            let t = parseInt(this.jqToleranceText.val());
            if (!t || t < 0) {
                t = 0;
            } else if (t > 128) {
                t = 128;
            }
            this.tolerance = t;
            this.jqTolerance[0].value = t;
        });

        this.jqContiguous = jqDragView.find(".gradient-contiguous");
        this.jqContiguous[0].checked = true;
        this.jqContiguous.change((e) => {
            this.contiguous = this.jqContiguous[0].checked;
        });

        this.jqBlendAlpha = jqDragView.find(".gradient-alpha");
        this.jqBlendAlpha.change((e) => {
            this.blendAlpha = this.jqBlendAlpha[0].checked;
        });

        this.jqUseGradient = jqDragView.find(".gradient-gradient");
        this.jqUseGradient.change((e) => {
            this.useGradient = this.jqUseGradient[0].checked;
            if (this.useGradient) {
                this.jqGradLine.removeClass("disabled");
                this.jqRadial.removeClass("disabled");
                this.jqRadial.removeAttr("disabled");
                this.jqPalette.removeClass("disabled");
                this.jqPalette.removeAttr("disabled");
            } else {
                this.jqGradLine.addClass("disabled");
                this.jqRadial.addClass("disabled");
                this.jqRadial.attr("disabled", true);
                this.jqPalette.addClass("disabled");
                this.jqPalette.attr("disabled", true);
            }
        });

        this.jqRadial = jqDragView.find(".gradient-radial");
        this.jqRadial.change((e) => {
            this.radial = this.jqRadial[0].checked;
        });

        this.jqPalette = jqDragView.find(".gradient-palette");
        this.jqPalette.change((e) => {
            this.palette = this.jqPalette[0].checked;
        });
        this.jqGradLine.addClass("disabled");
        this.jqPalette.addClass("disabled");
        this.jqPalette.attr("disabled", true);
        this.jqRadial.addClass("disabled");
        this.jqRadial.attr("disabled", true);
    }

    addNode(pos, pageX) {
        let jqNode = $("<div class='gradient-node'></div>");
        this.jqGradLine.append(jqNode);
        jqNode.offset({left : pageX});
        let node = {
            pos : pos,
            col : this.getColorAtPoint(pos),
            jqNode : jqNode
        };

        this.nodes.push(node);
        this.nodes.sort(function (a, b) {
            return a.pos - b.pos
        });
        jqNode.on("mousedown", (e) => {
            if (!this.draggedNode) {
                this.draggedNode = node;
                this.pick = node;
            }
        });
        jqNode.on("click", (e) => {
            if (node === this.pick) {
                new ColorPickerDialog(node.col, (e) => {
                    node.col = e;
                    this.updateGradient();
                });
            }
        });
        this.updateGradient();
    }

    removeNode(node, totaly) {
        let index = this.nodes.indexOf(node);
        if (index > -1) {
            this.nodes.splice(index, 1);
            this.nodes.sort(function (a, b) {
                return a.pos - b.pos
            });
        }
        if (totaly) {
            node.jqNode.remove();
        } else {
            node.jqNode.detach();
        }
    }

    moveNode(node, pos, displace, remove) {
        node.pos = pos;
        if (displace) {
            this.removeNode(node, false);
        } else if (remove) {
            this.removeNode(node, true);
        } else {
            if (this.nodes.indexOf(node) === -1) {
                node.jqNode.appendTo(this.jqGradLine);
                this.nodes.push(node);
            }
        }
        this.nodes.sort(function (a, b) {
            return a.pos - b.pos
        });
        this.updateGradient();
    }

    getColorAtPoint(pos) {
        if (this.nodes.length === 0) return "#000000FF";
        if (this.nodes.length === 1) return this.nodes[0].col;

        for (let i = 0; i < this.nodes.length - 1; i++){
            let node = this.nodes[i];
            let next = this.nodes[i + 1];
            if (pos < node.pos) {
                return node.col;
            } else if (pos >= node.pos && pos < next.pos) {
                if (node.pos === next.pos) return next.col;

                let rgb = hexToRgb(node.col);
                let rgb2 = hexToRgb(next.col);
                let diff = (pos - node.pos) / (next.pos - node.pos);
                rgb.r = Math.round(rgb.r * (1 - diff) + rgb2.r * diff);
                rgb.g = Math.round(rgb.g * (1 - diff) + rgb2.g * diff);
                rgb.b = Math.round(rgb.b * (1 - diff) + rgb2.b * diff);
                rgb.a = Math.round(rgb.a * (1 - diff) + rgb2.a * diff);
                return rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
            }
        }

        return this.nodes[this.nodes.length - 1].col;
    }

    getGradient() {
        if (this.nodes.length === 0) return [{pos : 0, col : "#000000FF"}];

        let grad = [];
        for (let node of this.nodes) {
            grad.push({pos : node.pos, col : node.col});
        }
        return grad;
    }

    updateGradient() {
        if (this.nodes.length === 0) {
            this.jqGradLine.css("background", "#000000FF");
        } else if (this.nodes.length === 1) {
            this.jqGradLine.css("background", this.nodes[0].col);
        } else {
            let grad = "";
            for (let node of this.nodes) {
                grad += ", " + node.col + " " + (node.pos * 100) + "%";
            }
            this.jqGradLine.css("background", "linear-gradient(to right" + grad + ")");
        }
    }
}